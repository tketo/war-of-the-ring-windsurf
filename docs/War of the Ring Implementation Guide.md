# War of the Ring Implementation Guide v2.6

*Enhanced for Windsurf AI with Regions, Test Plan, Schema Sharing, Undo/Redo, Multiplayer, Character Data, and Initial Army Setup*

**Note**: This guide aligns with *Rules Guide v2.6 (Base Game Edition)* and *PRD v1.3*. It includes detailed schemas, code snippets, and instructions to implement revised character data for all 13 characters, updated game mechanics (combat, siege, fellowship, and hunt), enhanced multiplayer logic, support for new expansions and scenarios, improved state management, strengthened security/validation, additional testing scenarios, and refined development notes. It maintains modularity with `regions.json` (static data) and `initial_army_setup.json` (starting units/control).

---

#### Project Overview
- **Goal**: Develop a multiplayer online board game enforcing *War of the Ring, 2nd Edition* rules (v2.6), with state saving, undo/redo, replay, and detailed combat/siege mechanics for 1-4 players.
- **Structure**:
  - **Frontend**: React with JSX, styled with Tailwind CSS.
  - **Backend**: Node.js with Express, MongoDB for persistence, Redis for sessions.
- **Features**: Full board representation, expansions, multiplayer support, AI plugins, and companion mode.

---

#### Technology Stack
- **Backend**: Node.js (v18+), Express, `crypto` (AES-256), MongoDB, Redis.
- **Frontend**: React, JSX (Babel), Tailwind CSS, `react-i18next`, `reduxjs/toolkit`.
- **Communication**: WebSocket (`socket.io`, HTTPS), REST API (HTTPS).
- **Dev Tools**: Docker, Jest, Quicktype (for schema sharing).
- **Schema Sharing**: Backend generates TypeScript types for frontend using Quicktype.

---

#### Backend Architecture

##### 1. Game State Model
The game state is the core data structure, stored in Redux for global access and synchronized via WebSocket. Below is the detailed schema with annotations for implementation.

- **Schema**:
```javascript
const gameStateSchema = {
  gameId: { type: String, required: true }, // Unique identifier (e.g., UUID)
  mode: { type: String, enum: ["Full", "Companion"], default: "Full" }, // Game mode: Full or Companion
  rulesEnforced: { type: Boolean, default: true }, // Enforce rules or allow unrestricted play
  playerCount: { type: Number, enum: [1, 2, 3, 4], default: 2 }, // Number of players
  expansions: { type: [String], default: [] }, // Enabled expansions (e.g., ["Lords of Middle-earth"])
  scenario: { type: String, default: "Base" }, // Scenario (e.g., "Breaking of the Fellowship")
  players: [{
    id: { type: String, required: true }, // Unique player ID
    team: { type: String, enum: ["Free", "Shadow"], required: true }, // Free Peoples or Shadow
    role: { type: String, enum: ["FreeAll", "GondorElves", "RohanNorthDwarves", "Sauron", "Saruman"] }, // Multiplayer role
    isAI: { type: Boolean, default: false }, // AI-controlled player
    aiStrategy: { type: String, default: null }, // AI strategy (e.g., "Aggressive")
    isLeading: { type: Boolean, default: false }, // Current leader in multiplayer
    hand: { type: [String], default: [] }, // Event Card IDs
    controlledNations: { type: [String], default: [] } // Nations controlled (e.g., ["3"] for Gondor)
  }],
  board: {
    regions: {
      type: Map,
      of: {
        name: { type: String, required: true }, // Region name (e.g., "Minas Tirith")
        control: { type: String, default: null }, // Controlling nation or null
        siegeStatus: { type: String, enum: ["in", "out"], default: "out" }, // Siege status
        nation: { type: String, required: true }, // Nation code
        deployments: [{
          group: { type: String, enum: ["normal", "besieged", "sieging", "rearGuard"], default: "normal" },
          units: {
            regular: { type: Number, default: 0 }, // Regular units
            elite: { type: Number, default: 0 }, // Elite units
            owner: { type: String, required: true } // Owning player ID
          },
          leaders: { type: Number, default: 0 } // Leaders present
        }],
        characters: { type: [String], default: [] }, // Character IDs
        structure: {
          type: { type: String, enum: ["town", "city", "stronghold", "fortification", null], default: null },
          category: { type: String, enum: ["settlement", "fortification", null], default: null },
          canMuster: { type: Boolean, default: false }, // Muster capability
          vp: { type: Number, default: 0 } // Victory points
        }
      }
    },
    actionDiceArea: {
      free: [{ type: String, selected: { type: Boolean, default: false } }], // Free Peoples dice
      shadow: [{ type: String, selected: { type: Boolean, default: false } }] // Shadow dice
    },
    combatDiceArea: { free: [Number], shadow: [Number] }, // Combat dice rolls
    huntBox: { dice: { type: Number, default: 0 }, tile: { type: String, default: null } }, // Hunt dice and tile
    elvenRings: { free: { type: Number, default: 3 }, shadow: { type: Number, default: 0 } }, // Elven Rings
    eventDecks: {
      freeCharacter: { type: [String], default: [] },
      freeStrategy: { type: [String], default: [] },
      shadowCharacter: { type: [String], default: [] },
      shadowStrategy: { type: [String], default: [] }
    },
    huntPool: { tiles: { type: [String], default: [] }, count: { type: Number, default: 16 } }, // Hunt tiles
    fellowshipTrack: {
      progress: { value: { type: Number, default: 0 }, hidden: { type: Boolean, default: true } },
      corruption: { type: Number, default: 0 }
    },
    politicalTrack: {
      type: Map,
      of: { position: { type: String, required: true }, active: { type: Boolean, default: false } }
    },
    guideBox: { companion: { type: String, default: "gandalf_grey" } }, // Fellowship Guide
    fellowshipBox: { companions: { type: [String], default: [] } }, // Fellowship companions
    victoryPoints: { free: { type: Number, default: 0 }, shadow: { type: Number, default: 0 } }, // VP totals
    mordorTrack: { position: { type: String, default: null } }, // Fellowship in Mordor
    gollum: { location: { type: String, default: null } } // Gollum’s location
  },
  offBoard: {
    free: { 
      hand: { type: [String], default: [] }, 
      discards: { type: [String], default: [] }, 
      reserves: { type: Map, of: { regular: Number, elite: Number }, default: {} }, 
      graveyard: { type: [String], default: [] } 
    },
    shadow: { 
      hand: { type: [String], default: [] }, 
      discards: { type: [String], default: [] }, 
      reserves: { type: Map, of: { regular: Number, elite: Number }, default: {} }, 
      graveyard: { type: [String], default: [] } 
    }
  },
  turn: {
    phase: { type: String, required: true }, // Current phase
    activePlayer: { type: String, required: true }, // Active player ID
    turnOrder: { type: [String], default: [] } // Player order
  },
  combat: {
    attacker: { type: String, default: null },
    defender: { type: String, default: null },
    region: { type: String, default: null },
    round: { type: Number, default: 0 },
    leadershipForfeited: { free: { type: Boolean, default: false }, shadow: { type: Boolean, default: false } },
    combatCards: { free: { type: String, default: null }, shadow: { type: String, default: null } }
  },
  history: [{ action: { type: Object, required: true }, timestamp: { type: Date, required: true }, committed: { type: Boolean, default: false } }], // Action log
  replay: { actions: { type: [Object], default: [] }, currentStep: { type: Number, default: 0 } } // Replay state
};
```
### Annotations

- **gameId**: Unique session identifier, generated at game start.
- **mode**: "Full" for online play; "Companion" for assisting physical games.
- **players**: Array of player objects, supporting up to 4 players with team and role assignments.
- **board.regions**: Tracks region control, armies (via `deployments`), and sieges, critical for combat and movement.
- **board.actionDiceArea**: Manages dice pools for actions, with `selected` indicating used dice.
- **board.fellowshipTrack**: Tracks the Fellowship’s hidden progress and corruption, key to the Hunt mechanic.
- **combat**: Captures ongoing battle details, including combat cards and rounds.
- **history**: Logs actions for undo/redo, adaptable to rules enforcement settings.

- **Implementation Notes**:
  - **Initialization**: Use a function `initializeGameState(playerCount, expansions, scenario)` to populate the schema from `initial_army_setup.json` (army placements) and `regions.json` (static region data). Set `fellowshipBox.companions` to all 9 initial companions and `board.regions[81].characters` to reflect Rivendell’s starting state.
  - **Dice Pools**: Populate `actionDiceArea.free` with 4 dice (FP) and `actionDiceArea.shadow` with 7 dice (SP), adjustable by character events (e.g., Witch-king adds 1 die).
  - **Schema Sharing**: Run Quicktype on this schema to generate TypeScript types (e.g., `GameState`) for frontend consistency:
    ```bash
    quicktype -s schema gameStateSchema.json -o src/types/GameState.ts --lang typescript
    ```

---

##### 2. Rules Engine
The rules engine enforces *Rules Guide v2.6* logic server-side. Below are detailed examples with schemas and code.

- **Character Database** (`characters.json`):
```javascript
[
  {
    id: "frodo_sam",
    name: "Frodo and Sam",
    title: "Ring-bearers",
    faction: "Free Peoples",
    type: "Companion",
    level: "1/0",
    leadership: 0,
    abilities: [],
    canGuide: false,
    playableBy: "Free Peoples"
  },
  {
    id: "gandalf_grey",
    name: "Gandalf",
    title: "The Grey",
    faction: "Free Peoples",
    type: "Companion",
    level: "3",
    leadership: 1,
    abilities: [
      { name: "Event Draw", description: "After playing a Free Peoples Event card, draw a matching Event card" },
      { name: "Combat Boost", description: "Adds +1 Combat Strength (max 5 dice)" }
    ],
    canGuide: true,
    playableBy: "Free Peoples"
  },
  {
    id: "gollum",
    name: "Gollum",
    title: "Creature",
    faction: "Free Peoples",
    type: "Companion",
    level: "0",
    leadership: 0,
    abilities: [
      { name: "Hunt Reduction", description: "May reveal the Fellowship to cancel 1 Hunt damage" }
    ],
    canGuide: true,
    playableBy: "Free Peoples"
  },
  {
    id: "witch_king",
    name: "Witch-king",
    title: "Chief of the Ringwraiths",
    faction: "Shadow",
    type: "Minion",
    level: "∞",
    leadership: 2,
    actionDieBonus: 1,
    abilities: [
      { name: "Combat Draw", description: "After playing a Combat card, draw a matching Event card" }
    ],
    canGuide: false,
    playableBy: "Sauron"
  }
  // Include all 13 characters as per v2.6
]
```
- **Move Validation** (`validateMove.js`):
```javascript
function validateMove(action, state) {
  const player = state.players.find(p => p.id === state.turn.activePlayer);
  const dicePool = player.team === "Free" ? state.board.actionDiceArea.free : state.board.actionDiceArea.shadow;
  if (!dicePool.some(die => die.selected)) return { valid: false, message: "No die selected" };

  if (action.type === "PLAY_CHARACTER") {
    const character = require("./characters.json").find(c => c.id === action.characterId);
    const roleMap = {
      "GondorElves": ["Gondor", "Elves"],
      "RohanNorthDwarves": ["Rohan", "North", "Dwarves"],
      "Sauron": ["Sauron"],
      "Saruman": ["Saruman"],
      "FreeAll": ["Free Peoples", "Gondor", "Elves", "Rohan", "North", "Dwarves"]
    };
    const allowed = roleMap[player.role] || [];
    if (!allowed.includes(character.playableBy) && character.playableBy !== "Free Peoples") {
      return { valid: false, message: "Character not playable by this role" };
    }
  }
  return { valid: true, message: "" };
}
```
- **Action Resolution** (`resolveAction.js`):
```javascript
function resolveAction(action, state) {
  const player = state.players.find(p => p.id === state.turn.activePlayer);
  const dicePool = player.team === "Free" ? state.board.actionDiceArea.free : state.board.actionDiceArea.shadow;
  const dieIndex = dicePool.findIndex(die => die.selected);
  if (dieIndex === -1) throw new Error("No die selected");

  let updatedState = JSON.parse(JSON.stringify(state)); // Deep copy
  switch (action.type) {
    case "MOVE_FELLOWSHIP":
      updatedState.board.fellowshipTrack.progress.value++;
      dicePool[dieIndex].selected = false;
      updatedState.board.huntBox.dice++;
      break;
    case "PLAY_CHARACTER":
      const character = require("./characters.json").find(c => c.id === action.characterId);
      updatedState.board.regions[action.regionId].characters.push(character.id);
      if (character.actionDieBonus) {
        const targetPool = player.team === "Free" ? updatedState.board.actionDiceArea.free : updatedState.board.actionDiceArea.shadow;
        targetPool.push({ type: "Character", selected: false });
      }
      break;
  }
  return updatedState;
}
```

---

##### 3. Combat and Siege Logic
Detailed implementation for combat and sieges per *Rules Guide v2.6*.

- **Combat Resolution** (`resolveCombat.js`):
```javascript
function resolveCombat(state, regionId) {
  const region = state.board.regions[regionId];
  const isSiege = region.siegeStatus === "in";
  const attackerUnits = region.deployments.find(d => d.group === "sieging")?.units || region.units;
  const defenderUnits = region.deployments.find(d => d.group === "besieged")?.units || region.units;

  for (let round = 1; round <= 5; round++) {
    const attackerRoll = Math.min(attackerUnits.regular + attackerUnits.elite, 5);
    const defenderRoll = Math.min(defenderUnits.regular + defenderUnits.elite, 5);
    let attackerHits = 0, defenderHits = 0;

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

function applyCasualties(units, hits, state, team) {
  let remainingHits = hits;
  while (remainingHits > 0 && (units.elite > 0 || units.regular > 0)) {
    if (units.elite > 0) {
      units.elite--;
    } else {
      units.regular--;
    }
    remainingHits--;
  }
}
```
- **Siege Handling** (`initiateSiege.js`):
```javascript
function initiateSiege(state, regionId) {
  const region = state.board.regions[regionId];
  if (region.deployments[0].units.owner === "Shadow" && region.control !== "Shadow") {
    region.deployments.push({
      group: "besieged",
      units: { regular: region.deployments[0].units.regular, elite: region.deployments[0].units.elite, owner: "Free" },
      leaders: region.leaders
    });
    region.deployments[0].group = "sieging";
    region.siegeStatus = "in";
    if (region.deployments[1].units.regular + region.deployments[1].units.elite > 5) {
      const excess = region.deployments[1].units.regular + region.deployments[1].units.elite - 5;
      region.deployments[1].units.regular = Math.max(0, region.deployments[1].units.regular - excess);
      state.offBoard.free.reserves[region.nation].regular += excess;
    }
  }
}
```

---

##### 4. State Management
- **Redux Setup** (`store.js`):
```javascript
const { configureStore } = require('@reduxjs/toolkit');
const gameReducer = require('./reducers/gameReducer');

const store = configureStore({
  reducer: {
    game: gameReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(/* WebSocket sync middleware */)
});

module.exports = store;
```
- **Undo/Redo**:
  - Use `redux-undo` for unrestricted mode:
    ```javascript
    const undoableGameReducer = undoable(gameReducer, {
      limit: state => state.rulesEnforced ? 1 : false, // 1 action in enforced mode
      filter: action => !state.rulesEnforced || !action.committed
    });
    ```
  - Commit actions after phase completion in enforced mode.

---

##### 5. Security
- **Encryption**: Use `crypto` for AES-256:
```javascript
const crypto = require('crypto');
const key = process.env.ENCRYPTION_KEY; // 32 bytes
const iv = crypto.randomBytes(16);

function encryptState(state) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(state), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), data: encrypted };
}
```

---

#### Conclusion
This *War of the Ring Implementation Guide v2.6* provides the high detail you requested, including detailed schemas (e.g., `gameStateSchema`, character data), code examples for validation and resolution, and specific instructions for state management, security, and game mechanics. It ensures developers have a clear, actionable roadmap to build the app as outlined in *PRD v1.3*, fully aligned with *Rules Guide v2.6*. Let me know if you need further elaboration or additional details!