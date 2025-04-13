# War of the Ring Implementation Guide v2.2

*Enhanced for Windsurf AI with Regions, Test Plan, Schema Sharing, Undo/Redo, Multiplayer, Character Data, and Initial Army Setup*

*Note*: Version 2.2 aligns with PRD v1.3, Rules Guide v1.4, and TODO List v1.8. Enhanced for Windsurf AI with schemas, examples, logic, regions data, a hybrid test plan, schema sharing via Quicktype, updated undo/redo per PRD v1.3, 3/4-player rules per Chapter XI, and character data from `characters.json` with `playableBy` (distinct from nations). Uses shared action dice pools per team (Free Peoples: 4 dice, Shadow: 7 dice), with no individual ownership. Updated initial army setup to use separate `regions.json` (static region data) and `initial_army_setup.json` (starting units, control) for modularity.

## Project Overview
- **Goal**: Build a multiplayer online board game enforcing *War of the Ring, 2nd Edition* rules, with state saving, undo/redo, replay, and detailed combat/siege mechanics. Supports 1-4 players.
- **Structure**:
  - **Frontend**: React with JSX, Tailwind CSS for UI.
  - **Backend**: Node.js with Express, MongoDB for persistence, Redis for sessions.
- **Features**: Full board, expansions (e.g., *Lords of Middle-earth*), multiplayer (1-4 players), AI plugins, companion mode.

## Technology Stack
- **Backend**: Node.js (v18+), Express, `crypto` (AES-256), MongoDB, Redis.
- **Frontend**: React, JSX (Babel), Tailwind CSS, `react-i18next`, `reduxjs/toolkit`.
- **Communication**: WebSocket (`socket.io`, HTTPS), REST API (HTTPS).
- **Dev Tools**: Docker, Jest, Quicktype (for schema sharing).
- **Schema Sharing**: Backend generates TypeScript types for frontend using Quicktype.

## Backend Architecture

### 1. Game State Model
- **Schema**:
```javascript
const gameStateSchema = {
  gameId: String,
  mode: { type: String, enum: ["Full", "Companion"], default: "Full" },
  rulesEnforced: { type: Boolean, default: true },
  playerCount: { type: Number, enum: [1, 2, 3, 4], default: 2 },
  expansions: [String],
  scenario: String,
  players: [{
    id: String,
    team: { type: String, enum: ["Free", "Shadow"] },
    role: { type: String, enum: ["FreeAll", "GondorElves", "RohanNorthDwarves", "Sauron", "Saruman"] },
    isAI: Boolean,
    aiStrategy: String,
    isLeading: Boolean,
    hand: [String], // Cards held, max 4 in 4-player
    controlledNations: [String] // Nation codes: "3" (Gondor), "7" (Sauron), etc.
  }],
  board: {
    regions: { 
      [regionId: string]: { 
        name: String,
        units: { regular: Number, elite: Number, owner: String }, 
        leaders: Number, 
        characters: [String], // Character IDs from characters.json
        control: String,
        siegeStatus: { type: String, enum: ["in", "out"], default: "out" },
        nation: String // Numeric nation code
      } 
    },
    settlements: { [settlement: string]: { type: String, control: String } },
    actionDiceArea: { 
      free: [{ type: String, selected: Boolean }], // 4 dice shared by Free team
      shadow: [{ type: String, selected: Boolean }] // 7 dice shared by Shadow team
    },
    combatDiceArea: { free: [Number], shadow: [Number] },
    huntBox: { dice: Number, tile: String },
    elvenRings: { free: Number, shadow: Number },
    eventDecks: {
      freeCharacter: [String], freeStrategy: [String],
      shadowCharacter: [String], shadowStrategy: [String]
    },
    huntPool: { tiles: [String], count: Number },
    fellowshipTrack: { progress: { value: Number, hidden: Boolean }, corruption: Number },
    politicalTrack: { [nation: string]: String },
    guideBox: { companion: String },
    fellowshipBox: { companions: [String] },
    victoryPoints: { free: Number, shadow: Number },
    mordorTrack: { position: String }
  },
  offBoard: {
    free: { hand: [String], discards: [String], reserves: { [nation: string]: { regular: Number, elite: Number } }, graveyard: [String] },
    shadow: { hand: [String], discards: [String], reserves: { [nation: string]: { regular: Number, elite: Number } }, graveyard: [String] }
  },
  turn: { phase: String, activePlayer: String, turnOrder: [String] },
  combat: {
    attacker: String,
    defender: String,
    region: String,
    round: Number,
    leadershipForfeited: { free: Boolean, shadow: Boolean },
    combatCards: { free: String, shadow: String }
  },
  history: [{ action: Object, timestamp: Date, committed: Boolean }],
  replay: { actions: [Object], currentStep: Number }
};
```
- **Dice Pool Note**: `actionDiceArea.free` (4 blue dice) and `actionDiceArea.shadow` (7 red dice) are shared team pools, not split by player. In 3/4-player games, all Free players use the Free pool, and all Shadow players use the Shadow pool.
- **Character Data Note**: The `board.regions.characters`, `fellowshipBox.companions`, and `guideBox.companion` fields reference character IDs from `characters.json`.
- **Initial Army Setup**:
  The base game starts with predefined units, leaders, and control for each region, as specified in `initial_army_setup.json`, with static region data (names, nation codes) in `regions.json`. Key starting positions include:
  - **Free Peoples**:
    - **Erebor** (nation 1, Dwarves): 1 regular, 2 elite, 1 leader, controlled by nation 1.
    - **Minas Tirith** (nation 3, Gondor): 3 regular, 1 elite, 1 leader, controlled by nation 3.
    - **Rivendell** (nation 2, Elves): 0 regular, 2 elite, 1 leader, controlled by nation 2.
    - **Edoras** (nation 5, Rohan): 1 regular, 1 elite, controlled by nation 5.
    - **Dale** (nation 4, The North): 1 regular, 1 leader, controlled by nation 4.
  - **Shadow**:
    - **Barad Dur** (nation 7, Sauron): 4 regular, 1 elite, 1 leader, controlled by nation 7.
    - **Orthanc** (nation 6, Isengard): 4 regular, 1 elite, controlled by nation 6.
    - **Minas Morgul** (nation 7, Sauron): 5 regular, 1 leader, controlled by nation 7.
    - **Umbar** (nation 8, Southrons & Easterlings): 3 regular, controlled by nation 8.
  - **Neutral**:
    - **Osgiliath** (nation 0): 2 regular, controlled by Free Peoples (nation 0).
  - All regions start with `siegeStatus: "out"` and empty `characters` arrays. The Fellowship begins in Rivendell (region 81) with `fellowshipBox.companions` including Frodo, Sam, Gandalf the Grey, Strider, Legolas, Gimli, Boromir, Merry, Pippin, and `guideBox.companion` set to Frodo. Static region data (e.g., names, nation codes) is stored in `regions.json`, while starting units, leaders, and control are in `initial_army_setup.json` for modularity.
- **Example Snapshot (4-Player, Initial State)**:
```javascript
{
  gameId: "game1",
  mode: "Full",
  playerCount: 4,
  players: [
    { id: "p1", team: "Free", role: "GondorElves", isLeading: true, controlledNations: ["3", "2"], hand: [] },
    { id: "p2", team: "Free", role: "RohanNorthDwarves", isLeading: false, controlledNations: ["5", "4", "1"], hand: [] },
    { id: "p3", team: "Shadow", role: "Sauron", isLeading: true, controlledNations: ["7"], hand: [] },
    { id: "p4", team: "Shadow", role: "Saruman", isLeading: false, controlledNations: ["6", "8"], hand: [] }
  ],
  board: {
    regions: { 
      "53": { 
        name: "Minas Tirith", 
        units: { regular: 3, elite: 1, owner: "Free" }, 
        leaders: 1, 
        characters: [], 
        control: "3", 
        siegeStatus: "out", 
        nation: "3" 
      },
      "81": { 
        name: "Rivendell", 
        units: { regular: 0, elite: 2, owner: "Free" }, 
        leaders: 1, 
        characters: [], 
        control: "2", 
        siegeStatus: "out", 
        nation: "2" 
      }
    },
    actionDiceArea: { 
      free: [
        { type: "Army", selected: false }, 
        { type: "Character", selected: false }, 
        { type: "Muster", selected: false }, 
        { type: "Will", selected: false }
      ],
      shadow: Array(7).fill({ type: "Eye", selected: false })
    },
    fellowshipBox: { 
      companions: ["frodo", "sam", "gandalf_grey", "strider", "legolas", "gimli", "boromir", "merry", "pippin"] 
    },
    guideBox: { companion: "gandalf_grey" },
    victoryPoints: { free: 0, shadow: 0 }
  },
  turn: { phase: "Action Resolution", activePlayer: "p2", turnOrder: ["p2", "p4", "p1", "p3"] }
}
```

### 2. Rules Engine
- **Character Database**:
  - **Schema** (Sourced from `characters.json`):
    ```javascript
    {
      id: String,
      name: String,
      title: String,
      faction: String,
      type: { type: String, enum: ["Companion", "Minion"] },
      level: String,
      leadership: Number,
      actionDieBonus: Number, // Optional
      abilities: [{ name: String, description: String }],
      canGuide: Boolean, // Optional
      playableBy: String // Role/faction descriptor, not nation code
    }
    ```
  - **Notes**:
    - `playableBy` restricts character usage in 3/4-player games, mapping to player roles (e.g., "Gondor", "Elves", "Sauron", "Free Peoples", "Any"). It is distinct from `controlledNations` (numeric codes like "3" for Gondor).
    - `canGuide` applies to Companions eligible to lead the Fellowship (e.g., Frodo, Gandalf) and Gollum in edge cases.
    - `actionDieBonus` is reserved for expansion characters (e.g., *Lords of Middle-earth*).
  - **Character List** (Based on *Rules Guide v1.4* Appendix C, 8 total):
    ```javascript
    [
      {
        id: "gimli",
        name: "Gimli",
        title: "Son of Gloin",
        faction: "Free Peoples",
        type: "Companion",
        level: "2",
        leadership: 1,
        abilities: [
          { name: "Captain of the West", description: "If Gimli is in a battle, add one to Combat Strength (maximum 5 dice)" },
          { name: "Dwarf of Erebor", description: "If Gimli is in Erebor and Erebor is unconquered, use any Action die to advance Dwarven Nation on Political Track" }
        ],
        canGuide: true,
        playableBy: "Dwarves"
      },
      {
        id: "saruman",
        name: "Saruman",
        title: "The White",
        faction: "Shadow",
        type: "Minion",
        level: "3",
        leadership: 2,
        abilities: [
          { name: "Voice of Saruman", description: "If Saruman is in Orthanc and Isengard is active, use a Muster die to recruit 2 Regulars in Orthanc" }
        ],
        canGuide: false,
        playableBy: "Saruman"
      },
      {
        id: "frodo",
        name: "Frodo",
        title: "Ring-bearer",
        faction: "Free Peoples",
        type: "Companion",
        level: "1",
        leadership: 0,
        abilities: [
          { name: "Ring-bearer", description: "If Frodo is the Guide, reduce Hunt damage by 1 (minimum 0)" }
        ],
        canGuide: true,
        playableBy: "Free Peoples"
      },
      {
        id: "sam",
        name: "Sam",
        title: "Gardener",
        faction: "Free Peoples",
        type: "Companion",
        level: "1",
        leadership: 0,
        abilities: [
          { name: "Loyal Friend", description: "If Sam is with Frodo and the Fellowship is revealed, reduce Corruption by 1 (once per Hunt)" }
        ],
        canGuide: true,
        playableBy: "Free Peoples"
      },
      {
        id: "gandalf_grey",
        name: "Gandalf",
        title: "The Grey",
        faction: "Free Peoples",
        type: "Companion",
        level: "3",
        leadership: 2,
        abilities: [
          { name: "Wizard’s Staff", description: "If Gandalf is the Guide, reroll one Hunt die per move (once per turn)" }
        ],
        canGuide: true,
        playableBy: "Free Peoples"
      },
      {
        id: "strider",
        name: "Strider",
        title: "Ranger of the North",
        faction: "Free Peoples",
        type: "Companion",
        level: "3",
        leadership: 2,
        abilities: [
          { name: "Heir of Elendil", description: "If Strider is in Minas Tirith and Gondor is At War, use a Will of the West die to crown Aragorn" }
        ],
        canGuide: true,
        playableBy: "The North"
      },
      {
        id: "witch_king",
        name: "Witch-king",
        title: "Chief of the Nazgûl",
        faction: "Shadow",
        type: "Minion",
        level: "3",
        leadership: 3,
        abilities: [
          { name: "Terror of Minas Morgul", description: "If Witch-king is in a battle, Shadow player may discard a card to add +1 to Combat Strength (once per battle)" }
        ],
        canGuide: false,
        playableBy: "Sauron"
      },
      {
        id: "gollum",
        name: "Gollum",
        title: "Creature",
        faction: "Free Peoples",
        type: "Companion",
        level: "1",
        leadership: 0,
        abilities: [
          { name: "My Precious", description: "If Gollum is the Guide, reduce Hunt damage by revealing the Fellowship (once per Hunt)" }
        ],
        canGuide: true,
        playableBy: "Free Peoples"
      }
    ]
    ```
- **Move Validation**:
  ```javascript
  function validateMove(action, state, rulesEnforced) {
    const player = state.players.find(p => p.id === state.turn.activePlayer);
    const playerDice = player.team === "Free" ? state.board.actionDiceArea.free : state.board.actionDiceArea.shadow;
    const selectedDie = playerDice.find(die => die.selected);
    if (!selectedDie) return { valid: false, message: i18n.t("action.noDieSelected") };
    if (action.type === "PLAY_CHARACTER") {
      const character = characters.find(c => c.id === action.characterId);
      const playableBy = character.playableBy;
      const rolePlayableMap = {
        "GondorElves": ["Gondor", "Elves"],
        "RohanNorthDwarves": ["Rohan", "The North", "Dwarves"],
        "Sauron": ["Sauron"],
        "Saruman": ["Saruman"],
        "FreeAll": ["Free Peoples", "Gondor", "Elves", "Rohan", "The North", "Dwarves", "Any"]
      };
      const allowed = rolePlayableMap[player.role] || [];
      if (!allowed.includes(playableBy) && playableBy !== "Free Peoples" && playableBy !== "Any") 
        return { valid: false, message: i18n.t("action.wrongPlayer") };
    }
    return { valid: true, message: "" };
  }
  ```
- **Action Resolution Flow**:
  - Dice are shared: Free team (4 blue dice), Shadow team (7 red dice).Any player on the team can select and use a die from their team’s pool during their turn in the order.
  - 4-Player Turn Order: Free Non-Leading → Shadow Non-Leading → Free Leading → Shadow Leading.
  - 3-Player Turn Order: Free → Shadow Non-Leading → Shadow Leading.
- **Utility Functions**:
  - `resolveAction(action: Object, state: Object) → Object`:
    ```javascript
    function resolveAction(action, state) {
      const player = state.players.find(p => p.id === state.turn.activePlayer);
      const playerDice = player.team === "Free" ? state.board.actionDiceArea.free : state.board.actionDiceArea.shadow;
      const dieIndex = playerDice.findIndex(die => die.selected);
      if (dieIndex === -1) throw new Error("No die selected");
      const updatedState = applyAction(action, state);
      playerDice.splice(dieIndex, 1);
      const currentIndex = state.turn.turnOrder.indexOf(player.id);
      state.turn.activePlayer = state.turn.turnOrder[(currentIndex + 1) % state.turn.turnOrder.length];
      if (playerDice.length === 0 && state.turn.turnOrder.length > 1) {
        state.turn.turnOrder.splice(currentIndex, 1);
      }
      if (state.board.actionDiceArea.free.length === 0 && state.board.actionDiceArea.shadow.length === 0) {
        state.turn.phase = "Military Victory";
      }
      return updatedState;
    }
    ```

### 7. Testing Scenarios
- 14. **4-Player Action Order**:
   - **Input**: `turnOrder: ["p2", "p4", "p1", "p3"]`, p2 selects Free die, p4 selects Shadow die, etc.
   - **Expected**: Shared pools (4 Free, 7 Shadow) deplete correctly.
- 15. **3-Player Nation Restriction**:
   - **Input**: Free (p1, FreeAll) selects Free die and plays "gandalf_grey" ("Free Peoples").
   - **Expected**: Valid; "Free Peoples" allowed for "FreeAll".
- 16. **Invalid Character Play**:
   - **Input**: p4 (Saruman) attempts to play "legolas" (Elves).
   - **Expected**: `valid: false`, `message: i18n.t("action.wrongPlayer")`.
- 17. **Character Ability Validation**:
   - **Input**: p2 (RohanNorthDwarves) plays "gimli" in Erebor, uses any die to advance Dwarves on Political Track.
   - **Expected**: Valid if Erebor is unconquered; Dwarves advance one step.
- 18. **Fellowship Guide**:
   - **Input**: p1 (GondorElves) sets "gandalf_grey" as Guide, moves Fellowship with Character die.
   - **Expected**: Valid; Hunt die reroll available per "Wizard’s Staff" ability.

## Development Notes
- **Windsurf AI**: Use `playableBy` as a role/faction restriction, not a nation code. Map to `role` in 3/4-player modes (e.g., "GondorElves" allows "Gondor" or "Elves" characters).
- **Action Dice Pools**:
  - The Free Peoples share a single pool of 4 blue dice (`actionDiceArea.free`), and the Shadow shares a single pool of 7 red dice (`actionDiceArea.shadow`).
  - No individual ownership is tracked; players on each team collaboratively select and use dice from their side’s pool during the Action Resolution phase.
  - UI component `ActionDiceArea` should display these shared pools with no per-player attribution.
- **Character Data**:
  - Ensure `characters.json` includes all 8 base game characters (Frodo, Sam, Gandalf the Grey, Strider, Gimli, Saruman, Witch-king, Gollum) with correct `playableBy` values.
  - Validate `canGuide` for Companions (e.g., Frodo, Gandalf) and Gollum, as it affects Fellowship mechanics.
  - At game start, all region `characters` arrays are empty, with the Fellowship in Rivendell (region 81).
- **Region and Army Setup**:
  - Store static region data (e.g., region IDs, names, nation codes, adjacency) in `regions.json`.
  - Store initial army setup (units, leaders, control, siege status) in `initial_army_setup.json` for the base game, allowing modularity for expansions or scenarios.
  - Initialize game state by combining `regions.json` and `initial_army_setup.json`, setting starting units, leaders, and control (e.g., Minas Tirith: 3 regular, 1 elite, 1 leader, nation 3; Barad Dur: 4 regular, 1 elite, 1 leader, nation 7).
  - Ensure `siegeStatus` is "out" for all regions and `characters` arrays are empty at start.
  - Load Fellowship in Rivendell (region 81) with `fellowshipBox.companions` containing all base game Companions and `guideBox.companion` set to Frodo.
  - Validate that `initial_army_setup.json` references valid region IDs from `regions.json`.
- **Testing**:
  - Verify character-related tests (e.g., ability triggers, `playableBy` restrictions) with the provided character data.
  - Test initial army setup by validating region states (e.g., Erebor, Orthanc) against `initial_army_setup.json` at game start, ensuring correct units, leaders, and control.
  - Test region data integrity using `regions.json` for UI rendering and move validation.
  - Test edge cases like Gollum as Guide (no Companions) and Minion mustering (e.g., Witch-king at 4+ Shadow VP).