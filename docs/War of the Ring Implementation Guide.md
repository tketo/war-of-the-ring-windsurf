# War of the Ring Implementation Guide v1.9 (Enhanced for Windsurf AI with Regions, Test Plan, Schema Sharing, Undo/Redo, and Multiplayer)

*Note*: Version 1.9 aligns with PRD v1.3, Rules Guide v1.3, and TODO List v1.4. Enhanced for Windsurf AI with schemas, examples, logic, regions data, a hybrid test plan, schema sharing via Quicktype, updated undo/redo per PRD v1.3, action die selection rule, 3/4-player rules per Chapter XI, and updated character data from `characters.json` with `playableBy` for multiplayer control. Clarified: `playableBy` is distinct from nations, tied to player roles.

## Project Overview
- **Goal**: Build a multiplayer online board game enforcing *War of the Ring, 2nd Edition* rules, with state saving, undo/redo, replay, and detailed combat/siege mechanics. Supports 1-4 players.
- **Structure**: Two projects:
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
    role: { type: String, enum: ["FreeAll", "GondorElves", "RohanNorthDwarves", "Sauron", "IsengardSouthrons"] },
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
      free: [{ type: String, selected: Boolean, owner: String }], 
      shadow: [{ type: String, selected: Boolean, owner: String }]
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
- **Character Data**: Loaded from `characters.json`. Key fields:
  - `id`: Unique identifier (e.g., "gimli", "saruman").
  - `playableBy`: Restricts usage in 3/4-player games (e.g., "Gondor", "Elves", "Sauron", "Free Peoples", "Any"). Not a nation code, but a faction/role descriptor tied to player assignments:
    - "GondorElves": "Gondor", "Elves".
    - "RohanNorthDwarves": "Rohan", "The North", "Dwarves".
    - "Sauron": "Sauron".
    - "IsengardSouthrons": "Isengard".
    - "Free Peoples" or "Any": Any Free player (3-player "FreeAll" or 4-player Free roles).
  - Note: `playableBy` is distinct from `controlledNations` (numeric codes); it aligns with multiplayer role names.
- **Example Snapshot (4-Player)**:
```javascript
{
  gameId: "game1",
  mode: "Full",
  playerCount: 4,
  players: [
    { id: "p1", team: "Free", role: "GondorElves", isLeading: true, controlledNations: ["3", "2"], hand: ["boromir", "legolas"] },
    { id: "p2", team: "Free", role: "RohanNorthDwarves", isLeading: false, controlledNations: ["5", "4", "1"], hand: ["gimli", "strider"] },
    { id: "p3", team: "Shadow", role: "Sauron", isLeading: true, controlledNations: ["7"], hand: ["witch_king", "mouth_of_sauron"] },
    { id: "p4", team: "Shadow", role: "IsengardSouthrons", isLeading: false, controlledNations: ["6", "8"], hand: ["saruman"] }
  ],
  board: {
    regions: { 
      "53": { name: "Minas Tirith", units: { regular: 3, elite: 0, owner: "p1" }, characters: ["boromir"], control: "3", nation: "3" }
    },
    actionDiceArea: { 
      free: [
        {type: "Army", selected: false, owner: "p1"}, {type: "Character", selected: false, owner: "p1"},
        {type: "Muster", selected: false, owner: "p2"}, {type: "Will", selected: false, owner: "p2"}
      ],
      shadow: Array(7).fill({type: "Eye", selected: false}).map((d, i) => ({ ...d, owner: i < 4 ? "p3" : "p4" }))
    }
  },
  turn: { phase: "Action Resolution", activePlayer: "p2", turnOrder: ["p2", "p4", "p1", "p3"] }
}
```

### 2. Rules Engine
- **Character Database**:
  - Schema (Updated from `characters.json`):
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
  - Example:
    ```javascript
    {
      id: "gimli",
      name: "Gimli",
      title: "Son of Gloin",
      faction: "Free Peoples",
      type: "companion",
      level: "2",
      leadership: 1,
      abilities: [
        { name: "Captain of the West", description: "If Gimli is in a battle, add one to Combat Strength (maximum 5 dice)" },
        { name: "Dwarf of Erebor", description: "If Gimli is in Erebor and Erebor is unconquered, use any Action die to advance Dwarven Nation on Political Track" }
      ],
      playableBy: "Dwarves"
    }
    ```
- **[High Priority] Move Validation**:
  - Pseudocode:
    ```javascript
    function validateMove(action, state, rulesEnforced) {
      const player = state.players.find(p => p.id === state.turn.activePlayer);
      const playerDice = player.team === "Free" ? state.board.actionDiceArea.free : state.board.actionDiceArea.shadow;
      const selectedDie = playerDice.find(die => die.selected && die.owner === player.id);
      if (!selectedDie) return { valid: false, message: i18n.t("action.noDieSelected") };

      if (action.type === "PLAY_CHARACTER") {
        const character = characters.find(c => c.id === action.characterId); // From characters.json
        const playableBy = character.playableBy;
        const rolePlayableMap = {
          "GondorElves": ["Gondor", "Elves"],
          "RohanNorthDwarves": ["Rohan", "The North", "Dwarves"],
          "Sauron": ["Sauron"],
          "IsengardSouthrons": ["Isengard", "Southrons & Easterlings"],
          "FreeAll": ["Free Peoples", "Gondor", "Elves", "Rohan", "The North", "Dwarves", "Any"]
        };
        const allowed = rolePlayableMap[player.role] || [];
        if (!allowed.includes(playableBy) && playableBy !== "Free Peoples" && playableBy !== "Any") 
          return { valid: false, message: i18n.t("action.wrongPlayer") };
      }
      // Other validations unchanged
      return { valid: true, message: "" };
    }
    ```
  - **Action Resolution Flow**: Unchanged, but `playableBy` now uses role-based mapping.

### 7. Testing Scenarios
- **Updated Multiplayer Tests**:
  14. **4-Player Action Order**:
      - **Input**: `turnOrder: ["p2", "p4", "p1", "p3"]`, p2 plays "gimli" (Dwarves), p4 plays "saruman" (Isengard), p1 plays "boromir" (Gondor), p3 plays "witch_king" (Sauron).
      - **Expected**: All valid based on `playableBy` matching roles.
  15. **3-Player Nation Restriction**:
      - **Input**: Free (p1) plays "gandalf_grey" ("Free Peoples"), then "peregrin" ("Free Peoples").
      - **Expected**: Both valid; "Free Peoples" allowed for "FreeAll".
  16. **Invalid Character Play**:
      - **Input**: p4 (IsengardSouthrons) attempts to play "legolas" (Elves).
      - **Expected**: `valid: false`, `message: i18n.t("action.wrongPlayer")`.

## Development Notes
- **Windsurf AI**: Use `playableBy` as a role/faction restriction, not a nation code. Map to `role` in 3/4-player modes.