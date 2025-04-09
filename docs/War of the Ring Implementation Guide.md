# War of the Ring Implementation Guide v1.4 (Enhanced for Windsurf AI with Regions, Test Plan, Schema Sharing, and Undo/Redo)

*Note*: Version 1.4 aligns with PRD v1.3, Rules Guide v1.3, and TODO List v1.4. Enhanced for Windsurf AI with schemas, examples, logic, regions data, a hybrid test plan, schema sharing via Quicktype, and updated undo/redo per PRD v1.3. Infrastructure setup is in TODO List v1.4.

## Project Overview
- **Goal**: Build a multiplayer online board game enforcing *War of the Ring, 2nd Edition* rules, with state saving, undo/redo, replay, and detailed combat/siege mechanics.
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
  expansions: [String],
  scenario: String,
  players: [{
    id: String,
    role: { type: String, enum: ["Free", "Shadow", "Gondor", "Rohan", "WitchKing", "Saruman"] },
    isAI: Boolean,
    aiStrategy: String
  }],
  board: {
    regions: { 
      [regionId: string]: { 
        name: String,
        units: { regular: Number, elite: Number }, 
        leaders: Number, 
        characters: [String], 
        control: String, // "Free", "Shadow", or nation code (e.g., "3" for Gondor)
        siegeStatus: { type: String, enum: ["in", "out"], default: "out" },
        nation: String // e.g., "0" (none), "1" (Dwarves), "3" (Gondor)
      } 
    },
    settlements: { [settlement: string]: { type: String, control: String } },
    actionDiceArea: { free: [Object], shadow: [Object] },
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
  turn: { phase: String, activePlayer: String },
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
- **Region Data Seed**: Use provided JSON (105 regions, see "Regions and Connections") to initialize `board.regions`. Map `id` to `regionId`, `side` to `control`, and `nation` to `nation`.
- **Connections**: Adjacency list (see "Regions and Connections") defines valid movement paths for `validateMove`.
- **Undo/Redo**:
  - **Rules Enforced**: Limited to current turn’s phase before actions commit (e.g., before Action Resolution phase ends). `history` tracks `committed: Boolean` to mark irreversible actions.
  - **Unrestricted**: Unlimited across game history.
- **Redux Integration**: Store `gameState` and `settings: {language: String, securityToken: String}`; actions: `updateGame`, `setLanguage`, `undoAction`, `redoAction`. Frontend uses generated TypeScript types (see "Schema Sharing").
- **Example Snapshot (Initial Setup)**:
```javascript
{
  gameId: "game1",
  mode: "Full",
  rulesEnforced: true,
  players: [{ id: "p1", role: "Free" }, { id: "p2", role: "Shadow" }],
  board: {
    regions: { 
      "1": { name: "Andrast", units: { regular: 0, elite: 0 }, leaders: 0, characters: [], control: "0", nation: "0" },
      "6": { name: "Barad Dur", units: { regular: 5, elite: 0 }, leaders: 0, characters: [], control: "7", nation: "7" },
      "81": { name: "Rivendell", units: { regular: 0, elite: 1 }, leaders: 0, characters: [], control: "2", nation: "2" }
    },
    actionDiceArea: { free: [{type: "Army"}, {type: "Character"}, {type: "Muster"}, {type: "Will"}], shadow: Array(7).fill({type: "Eye"}) },
    huntBox: { dice: 0, tile: null },
    fellowshipTrack: { progress: { value: 0, hidden: true }, corruption: 0 },
    guideBox: { companion: "Gandalf" },
    fellowshipBox: { companions: ["Frodo", "Sam", "Gandalf", "Strider", "Legolas", "Gimli", "Boromir", "Merry", "Pippin"] }
  },
  history: [{ action: { type: "START_GAME" }, timestamp: new Date(), committed: true }]
}
```

### 2. Rules Engine
- **Card Database**:
  - Schema:
    ```javascript
    {
      id: String,
      type: { type: String, enum: ["Character", "Strategy"] },
      side: { type: String, enum: ["Free", "Shadow"] },
      event: { title: String, effectText: String, initiative: Boolean, conditions: String },
      combat: { title: String, effectText: String, leadershipForfeited: Boolean },
      playOnTable: Boolean,
      exitConditions: String,
      translations: { en: Object, es: Object, fr: Object, de: Object, it: Object }
    }
    ```
  - Example:
    ```javascript
    {
      id: "FC01",
      type: "Character",
      side: "Free",
      event: { title: "Elven Cloaks", effectText: "Add [0] tile to Hunt Pool when Fellowship enters Mordor", conditions: "Fellowship on Mordor Track" },
      combat: null,
      playOnTable: false,
      translations: { en: { title: "Elven Cloaks" }, es: { title: "Capas Élficas" } }
    }
    ```
- **Character Database**:
  - Schema:
    ```javascript
    {
      id: String,
      name: String,
      title: String,
      faction: String,
      type: { type: String, enum: ["Companion", "Minion"] },
      level: Number,
      leadership: Number,
      abilities: [String],
      canGuide: Boolean,
      translations: { en: Object, es: Object, fr: Object, de: Object, it: Object }
    }
    ```
  - Example:
    ```javascript
    {
      id: "C01",
      name: "Gandalf",
      title: "the Grey",
      faction: "Free",
      type: "Companion",
      level: 3,
      leadership: 2,
      abilities: ["Muster Gandalf the White if dead"],
      canGuide: true,
      translations: { en: { name: "Gandalf" }, fr: { name: "Gandalf" } }
    }
    ```
- **[High Priority] Move Validation**:
  - Signature: `validateMove(action: Object, state: Object, rulesEnforced: Boolean) → { valid: Boolean, message: String }`
  - Pseudocode:
    ```javascript
    function validateMove(action, state, rulesEnforced) {
      const adjacencyMap = loadConnections(); // From "Regions and Connections"
      if (action.type === "MOVE_ARMY") {
        const fromId = action.from; // e.g., "20" (Eastemnet)
        const toId = action.to; // e.g., "37" (Fords of Isen)
        if (!adjacencyMap[fromId].includes(toId)) return { valid: false, message: i18n.t("move.invalidRegion") };
        if (state.board.regions[toId].units.total > 10) return { valid: false, message: i18n.t("move.stackLimit") };
      }
      if (action.type === "COMBAT") {
        if (state.combat.round > 5 && !action.extend) return { valid: false, message: i18n.t("combat.roundLimit") };
        if (action.card && !checkConditions(action.card, state)) return { valid: false, message: i18n.t("card.conditionFail") };
      }
      return { valid: true, message: "" };
    }
    ```
  - Logic Details: See Rules Guide v1.3.
- **Utility Functions**:
  - `rollDice(count: Number) → [Number]`: Returns array of 1-6 rolls.
  - `applyCardEffect(cardId: String, state: Object) → Object`: Applies card effects.

### 3. Multiplayer Features
- **Player Profiles**:
  - Schema: `{ id: String, username: String, stats: { wins: Number, losses: Number }, achievements: [String], language: String }`
  - Example: `{ id: "p1", username: "Aragorn", stats: { wins: 2, losses: 1 }, language: "en" }`
- **Lobby/Matchmaking**: 
  - Data Flow: `/lobby/create` → Redis queue → WebSocket `lobbyUpdate`.
- **Chat**: 
  - Event: `socket.emit("chat", { userId: String, message: String })`.

### 4. API Endpoints
- **Examples**:
  - `POST /game/move`:
    ```javascript
    // Request
    { action: { type: "COMBAT", region: "Minas Tirith", card: "FC02" }, token: "xyz" }
    // Response
    { success: true, state: { combat: { round: 1, combatCards: { free: "FC02" } } } }
    ```
  - `POST /game/undo`:
    ```javascript
    // Request
    { playerId: "p1", token: "xyz" }
    // Response (Rules Enforced)
    { success: true, state: { history: [{ action: {...}, committed: false }], turn: { phase: "Action Roll" } } }
    ```
- **Error Handling**: Return `{ success: false, error: i18n.t("move.invalid") }`.

### 5. Frontend Architecture
- **Components**:
  - `ActionDiceArea`: `{ dice: Array<Object>, rollable: Boolean, onRoll: Function }`
  - `SiegeBox`: `{ siegeStatus: String, units: {regular: Number, elite: Number}, besiegers: Object }`
- **Data Flow**: User clicks → Redux `updateGame` or `undoAction` → API `/move` or `/undo` → WebSocket `stateUpdate`. Uses generated types.

### 6. Regions and Connections
- **Regions**: 105 entries from provided JSON. Example:
  ```javascript
  [
    { "region": "Andrast", "id": "1", "side": "0", "nation": "0" },
    { "region": "Minas Tirith", "id": "53", "side": "0", "nation": "3" },
    // ... (103 more)
  ]
  ```
- **Connections**: Adjacency pairs (e.g., ["Andrast (1)", "Anfalas (2)"]). Convert to map:
  ```javascript
  const adjacencyMap = {
    "1": ["2", "18"], // Andrast → Anfalas, Druwaith Iaur
    "2": ["1", "14", "29"], // Anfalas → Andrast, Dol Amroth, Erech
    // ... (103 more)
  };
  ```

### 7. Schema Sharing
- **Purpose**: Eliminate schema duplication by auto-generating TypeScript types for the client from `gameStateSchema`.
- **Tool**: Quicktype (`npm install -g quicktype`).
- **Process**:
  1. **Export Schema Sample** (Backend):
     ```javascript
     // backend/schemas/gameState.js
     const gameStateSample = {
       gameId: "game1",
       mode: "Full",
       rulesEnforced: true,
       board: {
         regions: {
           "1": { name: "Andrast", units: { regular: 0, elite: 0 }, leaders: 0, characters: [], control: "0", siegeStatus: "out", nation: "0" }
         }
       },
       history: [{ action: { type: "MOVE_ARMY" }, timestamp: "2025-04-08T12:00:00Z", committed: false }]
     };
     module.exports = { gameStateSchema, gameStateSample };
     ```
  2. **Generate Types** (Script):
     ```json
     // backend/package.json
     "scripts": {
       "generate-types": "node scripts/exportSchema.js > temp/schema.json && quicktype --src temp/schema.json --lang typescript --out ../frontend/src/types/gameState.ts"
     }
     ```
     ```javascript
     // backend/scripts/exportSchema.js
     const { gameStateSample } = require('../schemas/gameState');
     console.log(JSON.stringify(gameStateSample));
     ```
  3. **Run Script**: `cd backend && npm run generate-types`
  4. **Output** (Frontend):
     ```typescript
     // frontend/src/types/gameState.ts
     export interface GameState {
       gameId: string;
       mode: "Full" | "Companion";
       rulesEnforced: boolean;
       board: {
         regions: {
           [key: string]: Region;
         };
       };
       history: HistoryEntry[];
     }

     export interface Region {
       name: string;
       units: { regular: number; elite: number };
       leaders: number;
       characters: string[];
       control: string;
       siegeStatus: "in" | "out";
       nation: string;
     }

     export interface HistoryEntry {
       action: { type: string; [key: string]: any };
       timestamp: string;
       committed: boolean;
     }
     ```
  5. **Usage**: Redux and components use these types.
- **Benefits**: No duplication, automatic sync, type safety.

### 7. Testing Scenarios
- **[Baseline] Initial Test Plan**:
  1. **Combat - Field Battle**:
     - **Input**: `state.combat = { attacker: "Free", defender: "Shadow", region: "Osgiliath", round: 1 }`, 5 units each, roll `[5, 6, 3, 4, 2]`.
     - **Expected**: 2 hits (`combatDiceArea.free = [5, 6]`), reduce `units.regular` by 2.
     - **Ref**: Rules Guide v1.3: “Combat Rounds”.
  2. **Combat - Siege Battle**:
     - **Input**: `state.combat = { attacker: "Shadow", defender: "Free", region: "Minas Tirith" }`, `siegeStatus: "in"`, 5 attackers, 3 defenders, roll `[6, 4, 3]`.
     - **Expected**: 1 hit for attacker, defender rolls `[5, 6]` for 2 hits.
     - **Ref**: Rules Guide v1.3: “Siege Battles”.
  3. **Combat - Card Use**:
     - **Input**: Play “Sudden Strike” (`combatCards.free`), pre-roll 2 Leadership dice `[6, 4]`, then 5 combat dice `[5, 5, 3]`.
     - **Expected**: 3 hits total (1 pre-roll, 2 combat).
     - **Ref**: Rules Guide v1.3: “Combat Cards”.
  4. **Siege - Elite Reduction**:
     - **Input**: `siegeStatus: "in"`, attacker extends round, `units.elite: 2`.
     - **Expected**: `units.elite: 1`, `units.regular: 1`, round continues.
     - **Ref**: Rules Guide v1.3: “Siege Battles”.
  5. **Hunt - Standard Move**:
     - **Input**: `fellowshipTrack.progress.value: 1`, `huntBox.dice: 3`, roll `[6, 4, 2]`, tile `[2]`.
     - **Expected**: `fellowshipTrack.corruption: 2`.
     - **Ref**: Rules Guide v1.3: “Hunt for the Ring”.
  6. **Hunt - Eye Tile**:
     - **Input**: `huntBox.dice: 4`, roll `[6, 6, 3, 1]`, tile `Eye`.
     - **Expected**: `fellowshipTrack.corruption: 2`, `progress.hidden: false`.
     - **Ref**: Rules Guide v1.3: “Hunt for the Ring”.
  7. **Movement - Army (Updated)**:
     - **Input**: Move 2 units from "20" (Eastemnet) to "37" (Fords of Isen).
     - **Expected**: `regions["37"].units.regular: 2`, `control: "5"`.
     - **Ref**: Rules Guide v1.3: “Armies and Battles”; Connections: ["Eastemnet (20)", "Fords of Isen (37)"].
  8. **Victory - Military (SP)**:
     - **Input**: `victoryPoints.shadow: 10` at turn end.
     - **Expected**: Game ends, Shadow wins.
     - **Ref**: Rules Guide v1.3: “Victory Conditions”.
  9. **Victory - Ring (FP)**:
     - **Input**: `mordorTrack.position: "Cracks of Doom"`, `fellowshipTrack.corruption: 5`.
     - **Expected**: Game ends, Free Peoples win.
     - **Ref**: Rules Guide v1.3: “Victory Conditions”.
  10. **Card - Play on Table**:
      - **Input**: Play “The Ents Awake: Huorns”, `state.board.regions["Fangorn"].units.elite: 2`.
      - **Expected**: Persists until Orthanc besieged, then discarded.
      - **Ref**: Rules Guide v1.3: “Event Cards”.
  11. **Movement - Invalid Region**:
      - **Input**: Move 2 units from "1" (Andrast) to "53" (Minas Tirith).
      - **Expected**: `valid: false`, `message: i18n.t("move.invalidRegion")`.
      - **Ref**: Connections (no direct link).
  12. **Region Control - Initial Setup**:
      - **Input**: Initialize "14" (Dol Amroth).
      - **Expected**: `regions["14"].control: "3"`, `nation: "3"`.
      - **Ref**: Regions data.

- **[Dynamic] Additional Test Cases**:
  - (Placeholder for Windsurf AI or human additions.)
  - Example Format: 
    - **Input**: [Describe state/action]
    - **Expected**: [Describe outcome]
    - **Ref**: [Rules Guide section]

## Development Notes
- **Windsurf AI**: Use generated `GameState` types, implement undo/redo per PRD v1.3.
- **Modularity**: Extract `rollDice`, `applyCardEffect`, `loadConnections` into utils.
- **Schema Sharing**: Use generated types for Redux and components.
- **Rules Source**: Cross-reference Rules Guide v1.3.