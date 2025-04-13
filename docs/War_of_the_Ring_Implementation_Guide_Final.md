# War of the Ring Implementation Guide v2.5

*Enhanced for Windsurf AI with Regions, Test Plan, Schema Sharing, Undo/Redo, Multiplayer, Character Data, and Initial Army Setup*

*Note*: Version 2.5 aligns with *Rules Guide v2.5 (Base Game Edition)*. Updates include full character data for 13 characters (7 Companions, Frodo/Sam, Gandalf the White, Aragorn, Gollum, 3 Minions), corrected initial army setup, multiplayer turn order and restrictions, shared Action Dice pools (Free Peoples: 4 dice, Shadow: 7 dice), siege mechanics, Fellowship and Hunt logic, and victory conditions. Maintains modularity with `regions.json` (static data) and `initial_army_setup.json` (starting units/control). Supports 1-4 players with enforced rules, state saving, and replay features.

## Project Overview
- **Goal**: Build a multiplayer online board game enforcing *War of the Ring, 2nd Edition* rules (v2.5), with state saving, undo/redo, replay, and detailed combat/siege mechanics. Supports 1-4 players.
- **Structure**:
  - **Frontend**: React with JSX, Tailwind CSS for UI.
  - **Backend**: Node.js with Express, MongoDB for persistence, Redis for sessions.
- **Features**: Full board, expansions (placeholders), multiplayer (1-4 players), AI plugins, companion mode.

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
    hand: [String], // Cards held, max varies by player count
    controlledNations: [String] // e.g., "3" (Gondor), "7" (Sauron)
  }],
  // ... other properties ...
  board: {
    regions: { 
      // Keyed by regionId from regions.json
      [regionId: string]: { 
        name: String,
        // Only regions with settlements (town, city, or stronghold) can be controlled.
        control: { type: String, default: null },
        siegeStatus: { type: String, enum: ["in", "out"], default: "out" },
        nation: String, // Numeric nation code
        // Army deployments in the region are aggregated as groups.
        // Each deployment groups units by their participation in a siege scenario:
        //    - "normal": forces not directly participating in the battle
        //    - "besieged": forces inside the stronghold
        //    - "sieging": forces actively attacking the stronghold
        //    - "rearGuard": forces in the region not directly participating in the battle
        deployments: [
          {
            group: { type: String, enum: ["normal", "besieged", "sieging", "rearGuard"], default: "normal" },
            units: {
              regular: Number,
              elite: Number,
              owner: String
            },
            leaders: Number
          }
        ],
        // The characters array stores unique character IDs present in the region.
        // These characters include:
        //    • **Companions**: Gandalf the White, Aragorn, Boromir, Legolas, Gimli, Peregrin, Meriadoc
        //    • **Minion Leaders**: Witch King, Saruman, and The Mouth
        //    • **Nazgul**: Treated as leaders (but are not companions or minions)
        // All of these characters count as leaders and are processed individually.
        characters: [String],
        // The structure field holds details about the settlement or fortification in the region.
        // Only settlements (towns, cities, or strongholds) are controllable and contribute victory points (vp).
        // Fortifications never allow mustering and always yield 0 vp.
        structure: {
          type: { type: String, enum: ["town", "city", "stronghold", "fortification", null], default: null },
          category: { type: String, enum: ["settlement", "fortification", null], default: null },
          canMuster: { type: Boolean, default: false },
          vp: { type: Number, default: 0 }
        }
      }
    },
    actionDiceArea: { 
      free: [{ type: String, selected: Boolean }],
      shadow: [{ type: String, selected: Boolean }]
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
    politicalTrack: { 
      [nation: string]: { position: String, active: Boolean }
    },
    guideBox: { companion: String },
    fellowshipBox: { companions: [String] },
    victoryPoints: { free: Number, shadow: Number },
    mordorTrack: { position: String },
    gollum: { location: String }
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
- **Dice Pools**: `actionDiceArea.free` (4 blue dice) and `actionDiceArea.shadow` (7 red dice) are shared team pools. Players select dice from their team’s pool during their turn.
- **Initial Setup**:
  - **Fellowship**: In Rivendell (region 81), `fellowshipBox.companions` includes all 9 characters (7 Companions, Frodo, Sam), `guideBox.companion` is "gandalf_grey".
  - **Elven Rings**: `elvenRings.free = 3`, `elvenRings.shadow = 0`.
  - **Hunt Pool**: 16 tiles (12 numbered 0-3, 4 Eye).
  - **Political Track**: Per rules (e.g., Dwarves: `{ position: "Peace1", active: false }`, Sauron: `{ position: "Peace3", active: true }`).
  - **Regions**: Loaded from `initial_army_setup.json` with units, leaders, control (e.g., Minas Tirith: 3 regular, 1 elite, 1 leader, control "3").
- **Example Initial State (4-Player)**:
```javascript
{
  gameId: "game1",
  playerCount: 4,
  players: [
    { id: "p1", team: "Free", role: "GondorElves", isLeading: true, controlledNations: ["3", "2"], hand: [] },
    { id: "p2", team: "Free", role: "RohanNorthDwarves", isLeading: false, controlledNations: ["5", "4", "1"], hand: [] },
    { id: "p3", team: "Shadow", role: "Sauron", isLeading: true, controlledNations: ["7"], hand: [] },
    { id: "p4", team: "Shadow", role: "Saruman", isLeading: false, controlledNations: ["6", "8"], hand: [] }
  ],
  board: {
    regions: { 
      "53": { name: "Minas Tirith", units: { regular: 3, elite: 1, owner: "Free" }, leaders: 1, characters: [], control: "3", siegeStatus: "out", besiegedUnits: { regular: 0, elite: 0, owner: "Free" }, besiegedLeaders: 0, besiegedCharacters: [], nation: "3" },
      "81": { name: "Rivendell", units: { regular: 0, elite: 2, owner: "Free" }, leaders: 1, characters: [], control: "2", siegeStatus: "out", besiegedUnits: { regular: 0, elite: 0, owner: "Free" }, besiegedLeaders: 0, besiegedCharacters: [], nation: "2" }
    },
    actionDiceArea: { 
      free: Array(4).fill({ type: "Will", selected: false }),
      shadow: Array(7).fill({ type: "Eye", selected: false })
    },
    fellowshipBox: { companions: ["frodo_sam", "gandalf_grey", "strider", "boromir", "legolas", "gimli", "merry", "pippin"] },
    guideBox: { companion: "gandalf_grey" },
    politicalTrack: {
      "1": { position: "Peace1", active: false }, // Dwarves
      "7": { position: "Peace3", active: true } // Sauron
    },
    victoryPoints: { free: 0, shadow: 0 }
  },
  turn: { phase: "Recover Dice", activePlayer: "p1", turnOrder: ["p2", "p4", "p1", "p3"] }
}
```

### 2. Rules Engine
- **Character Database** (`characters.json`):
```javascript
[
  { id: "frodo_sam", name: "Frodo and Sam", title: "Ring-bearers", faction: "Free Peoples", type: "Companion", level: "1/0", leadership: 0, abilities: [], canGuide: false, playableBy: "Free Peoples" },
  { id: "gandalf_grey", name: "Gandalf", title: "The Grey", faction: "Free Peoples", type: "Companion", level: "3", leadership: 1, abilities: [
    { name: "Event Draw", description: "After playing a Free Peoples Event card, draw a matching Event card" },
    { name: "Combat Boost", description: "Adds +1 Combat Strength (max 5 dice)" }
  ], canGuide: true, playableBy: "Free Peoples" },
  { id: "strider", name: "Strider", title: "Ranger", faction: "Free Peoples", type: "Companion", level: "3", leadership: 1, abilities: [
    { name: "Hide Fellowship", description: "Use an Action die to hide a revealed Fellowship" }
  ], canGuide: true, playableBy: "North" },
  { id: "boromir", name: "Boromir", title: "Son of Denethor", faction: "Free Peoples", type: "Companion", level: "2", leadership: 1, abilities: [
    { name: "Combat Boost", description: "+1 Combat Strength (max 5 dice)" },
    { name: "Advance Gondor", description: "May advance Gondor’s political position if in an unconquered Gondor City/Stronghold" }
  ], canGuide: false, playableBy: "Gondor" },
  { id: "legolas", name: "Legolas", title: "Elf Prince", faction: "Free Peoples", type: "Companion", level: "2", leadership: 1, abilities: [
    { name: "Combat Boost", description: "+1 Combat Strength (max 5 dice)" },
    { name: "Advance Elves", description: "May advance Elves if in an unconquered Elven Stronghold" }
  ], canGuide: false, playableBy: "Elves" },
  { id: "gimli", name: "Gimli", title: "Son of Gloin", faction: "Free Peoples", type: "Companion", level: "2", leadership: 1, abilities: [
    { name: "Combat Boost", description: "+1 Combat Strength (max 5 dice)" },
    { name: "Advance Dwarves", description: "May advance Dwarves if in unconquered Erebor" }
  ], canGuide: false, playableBy: "Dwarves" },
  { id: "merry", name: "Meriadoc", title: "Merry", faction: "Free Peoples", type: "Companion", level: "1", leadership: 1, abilities: [
    { name: "Hunt Reduction", description: "May separate to cancel 1 Hunt damage" },
    { name: "Return", description: "Returns if eliminated outside Mordor" }
  ], canGuide: true, playableBy: "Free Peoples" },
  { id: "pippin", name: "Peregrin", title: "Pippin", faction: "Free Peoples", type: "Companion", level: "1", leadership: 1, abilities: [
    { name: "Hunt Reduction", description: "May separate to cancel 1 Hunt damage" },
    { name: "Return", description: "Returns if eliminated outside Mordor" }
  ], canGuide: true, playableBy: "Free Peoples" },
  { id: "gandalf_white", name: "Gandalf", title: "The White", faction: "Free Peoples", type: "Companion", level: "3", leadership: 1, actionDieBonus: 1, abilities: [
    { name: "Enhanced Movement", description: "Moves at Level 4 when alone or with a Hobbit" },
    { name: "Negate Nazgûl", description: "May forfeit Leadership to cancel all Nazgûl Leadership in battle" }
  ], canGuide: false, playableBy: "Free Peoples" },
  { id: "aragorn", name: "Aragorn", title: "Heir of Isildur", faction: "Free Peoples", type: "Companion", level: "3", leadership: 2, actionDieBonus: 1, abilities: [
    { name: "Combat Boost", description: "+1 Combat Strength (max 5 dice)" }
  ], canGuide: false, playableBy: "Free Peoples" },
  { id: "gollum", name: "Gollum", title: "Creature", faction: "Free Peoples", type: "Companion", level: "0", leadership: 0, abilities: [
    { name: "Hunt Reduction", description: "May reveal the Fellowship to cancel 1 Hunt damage" }
  ], canGuide: true, playableBy: "Free Peoples" },
  { id: "saruman", name: "Saruman", title: "The White", faction: "Shadow", type: "Minion", level: "0", leadership: 1, actionDieBonus: 1, abilities: [
    { name: "Elite Leaders", description: "Isengard/Southrons & Easterlings Elites count as Leaders and units" }
  ], canGuide: false, playableBy: "Saruman" },
  { id: "witch_king", name: "Witch-king", title: "Chief of the Ringwraiths", faction: "Shadow", type: "Minion", level: "∞", leadership: 2, actionDieBonus: 1, abilities: [
    { name: "Combat Draw", description: "After playing a Combat card, draw a matching Event card" }
  ], canGuide: false, playableBy: "Sauron" },
  { id: "mouth_sauron", name: "Mouth of Sauron", title: "Lieutenant", faction: "Shadow", type: "Minion", level: "3", leadership: 2, actionDieBonus: 1, abilities: [
    { name: "Muster Swap", description: "Once per turn, may use a Muster die as an Army die" }
  ], canGuide: false, playableBy: "Sauron" }
]
```
- **Move Validation**:
```javascript
function validateMove(action, state) {
  const player = state.players.find(p => p.id === state.turn.activePlayer);
  const dicePool = player.team === "Free" ? state.board.actionDiceArea.free : state.board.actionDiceArea.shadow;
  const selectedDie = dicePool.find(die => die.selected);
  if (!selectedDie) return { valid: false, message: "No die selected" };

  if (action.type === "PLAY_CHARACTER") {
    const character = characters.find(c => c.id === action.characterId);
    const roleMap = {
      "GondorElves": ["Gondor", "Elves"],
      "RohanNorthDwarves": ["Rohan", "North", "Dwarves"],
      "Sauron": ["Sauron"],
      "Saruman": ["Saruman"],
      "FreeAll": ["Free Peoples", "Gondor", "Elves", "Rohan", "North", "Dwarves"]
    };
    const allowed = roleMap[player.role] || [];
    if (!allowed.includes(character.playableBy) && character.playableBy !== "Free Peoples") 
      return { valid: false, message: "Character not playable by this role" };
  }

  if (action.type === "MOVE_FELLOWSHIP" && selectedDie.type !== "Character") 
    return { valid: false, message: "Requires Character die" };

  return { valid: true, message: "" };
}
```
- **Action Resolution**:
```javascript
function resolveAction(action, state) {
  const player = state.players.find(p => p.id === state.turn.activePlayer);
  const dicePool = player.team === "Free" ? state.board.actionDiceArea.free : state.board.actionDiceArea.shadow;
  const dieIndex = dicePool.findIndex(die => die.selected);
  if (dieIndex === -1) throw new Error("No die selected");

  let updatedState = { ...state };
  switch (action.type) {
    case "MOVE_FELLOWSHIP":
      updatedState.board.fellowshipTrack.progress.value++;
      dicePool[dieIndex].selected = false;
      updatedState.board.huntBox.dice++;
      break;
    case "DECLARE_FELLOWSHIP":
      updatedState.board.fellowshipTrack.progress.hidden = false;
      updatedState.board.regions[action.region].characters.push(...updatedState.board.fellowshipBox.companions);
      updatedState.board.fellowshipBox.companions = ["frodo_sam"];
      if (action.region === "3" && !updatedState.board.regions[action.region].control.includes("Shadow")) {
        updatedState.board.fellowshipTrack.corruption--;
      }
      break;
    case "PLAY_COMBAT_CARD":
      updatedState.combat.combatCards[player.team.toLowerCase()] = action.cardId;
      break;
  }

  dicePool.splice(dieIndex, 1);
  const currentIndex = state.turn.turnOrder.indexOf(player.id);
  updatedState.turn.activePlayer = state.turn.turnOrder[(currentIndex + 1) % state.turn.turnOrder.length];
  if (dicePool.length === 0) state.turn.turnOrder.splice(currentIndex, 1);
  if (state.board.actionDiceArea.free.length === 0 && state.board.actionDiceArea.shadow.length === 0) {
    updatedState.turn.phase = "Military Victory";
  }

  checkVictoryConditions(updatedState);
  return updatedState;
}
```
- **Victory Check**:
```javascript
function checkVictoryConditions(state) {
  if (state.board.fellowshipTrack.corruption >= 12) {
    state.gameOver = true;
    state.winner = "Shadow";
  }
  if (state.board.mordorTrack.position === "Mount Doom" && state.board.fellowshipTrack.corruption < 12) {
    state.gameOver = true;
    state.winner = "Free";
  }
  if (state.turn.phase === "Military Victory") {
    if (state.board.victoryPoints.shadow >= 10) {
      state.gameOver = true;
      state.winner = "Shadow";
    } else if (state.board.victoryPoints.free >= 4 && state.board.victoryPoints.shadow < 10) {
      state.gameOver = true;
      state.winner = "Free";
    }
  }
}
```

### 3. Combat and Siege Logic
- **Combat Resolution**:
```javascript
function resolveCombat(state, regionId) {
  const region = state.board.regions[regionId];
  const isSiege = region.siegeStatus === "in";
  const attackerUnits = region.units;
  const defenderUnits = isSiege ? region.besiegedUnits : region.units;
  let attackerHits = 0, defenderHits = 0;

  for (let round = 1; round <= 5; round++) {
    const attackerRoll = Math.min(attackerUnits.regular + attackerUnits.elite, 5);
    const defenderRoll = Math.min(defenderUnits.regular + defenderUnits.elite, 5);
    
    for (let i = 0; i < attackerRoll; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      if ((isSiege && roll === 6) || (!isSiege && roll >= 5)) attackerHits++;
    }
    for (let i = 0; i < defenderRoll; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      if (roll >= 5) defenderHits++;
    }

    applyCasualties(attackerUnits, defenderHits, state, "Shadow");
    applyCasualties(defenderUnits, attackerHits, state, "Free");
    if (attackerUnits.regular + attackerUnits.elite === 0 || defenderUnits.regular + defenderUnits.elite === 0) break;
  }
}
```
- **Siege Handling**:
```javascript
function initiateSiege(state, regionId) {
  const region = state.board.regions[regionId];
  if (region.units.owner === "Shadow" && region.control !== "Shadow") {
    region.besiegedUnits = { regular: region.units.regular, elite: region.units.elite, owner: "Free" };
    region.besiegedLeaders = region.leaders;
    region.besiegedCharacters = region.characters;
    region.units = { regular: 0, elite: 0, owner: "Shadow" };
    region.leaders = 0;
    region.characters = [];
    region.siegeStatus = "in";
    if (region.besiegedUnits.regular + region.besiegedUnits.elite > 5) {
      const excess = region.besiegedUnits.regular + region.besiegedUnits.elite - 5;
      region.besiegedUnits.regular = Math.max(0, region.besiegedUnits.regular - excess);
      state.offBoard.free.reserves[region.nation].regular += excess;
    }
  }
}
```

### 4. Fellowship and Hunt
- **Hunt Resolution**:
```javascript
function resolveHunt(state) {
  const dice = Math.min(state.board.huntBox.dice, 5);
  let successes = 0;
  for (let i = 0; i < dice; i++) {
    if (Math.floor(Math.random() * 6) + 1 >= 6) successes++;
  }
  if (successes > 0) {
    const tile = state.board.huntPool.tiles.shift();
    state.board.huntBox.tile = tile;
    if (tile.includes("Eye")) {
      state.board.fellowshipTrack.corruption += successes;
      state.board.fellowshipTrack.progress.hidden = false;
    } else {
      state.board.fellowshipTrack.corruption += parseInt(tile);
    }
    if (state.guideBox.companion === "gollum" && action.reveal) {
      state.board.fellowshipTrack.corruption--;
      state.board.fellowshipTrack.progress.hidden = false;
    }
  }
  state.board.huntBox.dice = 0;
}
```

### 7. Testing Scenarios
- **1. Initial Setup**: Verify all regions match `initial_army_setup.json`, Fellowship in Rivendell with 9 characters, Political Track per rules.
- **2. 4-Player Turn Order**: Non-Leading FP → Non-Leading Shadow → Leading FP → Leading Shadow; dice pools deplete correctly.
- **3. Character Play**: "boromir" playable only by "GondorElves" in 4-player; "gandalf_grey" by any Free player.
- **4. Siege**: Minas Tirith under siege; max 5 units inside, excess to reserves.
- **5. Hunt**: Fellowship moves, 2 dice allocated, tile drawn increases corruption or reveals.
- **6. Victory**: Shadow reaches 10 VP in Phase 6; Free wins with Ring at Mount Doom.

## Development Notes
- **Characters**: All 13 characters from Rules Guide v2.5 included with abilities and `playableBy` restrictions.
- **Setup**: `initial_army_setup.json` must match Rules Guide army placements (e.g., Erebor: 1 regular, 2 elite, 1 leader).
- **Multiplayer**: Enforce turn order and nation restrictions; shared dice pools displayed in UI.
- **Combat/Sieges**: Handle field battles, sieges, sorties, and relief correctly with modified hit numbers.
- **Fellowship**: Manage movement, Guide changes, corruption, and separation per rules.
- **Expansions**: Placeholders retained for future integration.

## 🧭 Integration of Regions with the Board Schema (Updated)

The `regions.json` file defines every region on the game board with detailed properties essential for gameplay. The board schema has been updated to capture not only static region data but also dynamic battlefield deployments and structure details. Below is an outline of the updated integration:

### 🎯 Key Fields from `regions.json`

Each region entry may include:

- **`region`**: Human-readable name of the region.
- **`id`**: Unique identifier (as a string).
- **`side`**: Affiliation (typically unused in core rules; 0 = neutral or unaligned).
- **`nation`**: Numeric index referring to the controlling nation.
- **`settlement`** (optional): Indicates that the region contains a town, city, or stronghold.
- **`fortification`** (optional): Denotes minor defensive structures distinct from settlements.

#### Example:
```json
{
  "region": "Barad Dur",
  "id": "6",
  "side": "0",
  "nation": "7",
  "settlement": {
    "type": "stronghold",
    "vp": 2,
    "can_muster": true
  }
}
```

### 🛡 Settlement and Fortification Mapping

You should augment your **board schema** with the following structure details:

- **`type`**:  
  - For settlements: `"town"`, `"city"`, or `"stronghold"` (sourced from the `settlement` field in `regions.json`).  
  - For defensive structures: `"fortification"` (sourced from the `fortification` field).
- **`vp`**: Victory points associated with the structure (only settlements yield VP; fortifications always yield 0).
- **`can_muster`**: Boolean indicating if units can be mustered at this structure (true only for eligible settlements).
- **`category`**: Indicates the kind of structure—set to `"settlement"` for controllable, VP-generating structures or `"fortification"` for non-controllable defensive formations.

### 🔄 Integration Strategy

1. **Map region `id`s** in `regions.json` to your board's internal region schema.
2. **Extract and merge** any `settlement` or `fortification` data from `regions.json` into the region object’s `structure` field.
3. Ensure each board region object supports the following properties:
   - `has_settlement`: boolean indicating if a settlement is present.
   - `has_fortification`: boolean indicating if a fortification is present.
   - `structure_type`: a string value that is either `"town"`, `"city"`, `"stronghold"`, `"fortification"`, or `null`.
   - `vp`: an integer (default 0) representing the victory points provided by the structure.
   - `can_muster`: boolean (default false) indicating if units may be mustered at the structure.

### 🧪 Validation Tips

- **Confirm Structures**: Verify that all known strongholds and cities—used for scoring—are present in the board model.
- **Muster Points**: Ensure that muster points are correctly set for each nation (only eligible settlements should allow mustering).
- **Distinct Categories**: Make sure fortifications (which yield 0 VP and do not allow mustering) are not confused with VP-generating settlements.

This integration allows for dynamic rules enforcement, accurate victory point calculations, and proper muster validations while keeping your board schema clear and maintainable.
