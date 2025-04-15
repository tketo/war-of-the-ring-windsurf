Below is the updated *War of the Ring Implementation Guide v2.6*, incorporating all changes discussed to infer game state from piece placement, eliminate flag-board desync, and simplify undo/redo. This update builds on your insights, including:

- **Combat Cards**: Represented in `tableCardsArea[{cardId, owner, type}]` with ownership tracking, placed on the table during battles, discarded post-round.
- **Cards Played on Table**: Event cards with ongoing effects (e.g., “The Council of Rivendell”) in `tableCardsArea`, with owner tracking.
- **Hunt Box**: Free Peoples dice (e.g., “Character”) placed for Fellowship movement, triggering a Shadow “Eye” die in Phase 1, inferred via `huntBox.diceArea[{type, team}]`.
- **Reserved Hunt Tiles**: Tiles (e.g., “Balrog”) tracked in `reservedHuntTilesArea[{cardId}][{id, owner}]`, placed in Hunt Box on Mordor entry.
- **Political Track**: Chits (`position: Step_1` to `At_War`, `face: active/passive`), active-only advance from `Step_3` to `At_War`, inferred via `politicalTrack[nation].position`, `face`.
- **Other Areas**: Regions, stronghold boxes, figures (Witch-king, Saruman), dice (`actionDiceArea`, `usedDiceArea`, `selectedDiceArea`), Fellowship, victory points, etc., all inferred without flags (e.g., no `siegeStatus`, `fellowshipTrack.hidden`, `victoryPoints`).

The update removes flags like `siegeStatus`, `fellowshipTrack.hidden`, `actionDiceArea.selected`, `politicalTrack[{nation}].active`, and `combat.combatCards`, replacing them with piece-based inference (e.g., `deployments[{sieging, besieged}]`, `tableCardsArea`, `huntBox.diceArea`). It simplifies undo/redo to piece movements (e.g., “move units,” “flip chit,” “return card”), aligning with the physical game’s clarity while ensuring digital robustness, especially for multi-player (3/4 players with roles like Witch-king, Saruman). The guide retains minimal non-piece flags (`turn.phase`, `turn.activePlayer`) as player-memory-based, justified previously, and integrates with our 3D, stronghold-box, large-scale-unit model (~8000 vs. ~5000 troops).

The output is in Markdown (`.md`) format, as requested, updating the original v2.6 guide with new schemas, logic, and annotations to reflect inference, ownership tracking, and your clarifications (e.g., Hunt Box dice, reserved tiles, active-only “At War”).

---

# War of the Ring Implementation Guide v2.6

*Enhanced for Windsurf AI with Piece-Based State Inference, Ownership Tracking, Regions, Test Plan, Schema Sharing, Undo/Redo, Multiplayer, Character Data, and Initial Army Setup*

**Note**: This guide aligns with *Rules Guide v2.6 (Base Game Edition)* and *PRD v1.3*. It updates the original v2.6 implementation to infer game state from piece placement, eliminating flags (e.g., `siegeStatus`, `fellowshipTrack.hidden`, `politicalTrack.active`) to prevent desync and simplify undo/redo as piece movements (e.g., “move units,” “flip chit,” “place card”). It includes new areas (`tableCardsArea` for combat/event cards, `reservedHuntTilesArea`, `usedDiceArea`, `selectedDiceArea`), ownership tracking (cards, figures), and refined mechanics (e.g., Hunt Box dice, active-only political track advance). The guide supports all board areas (regions, strongholds, tracks, dice, cards), multi-player roles (Witch-king, Saruman), and expansions, maintaining modularity with `regions.json` and `initial_army_setup.json`.

---

## Project Overview
- **Goal**: Develop a multiplayer online board game enforcing *War of the Ring, 2nd Edition* rules (v2.6), with state inference from piece placement, ownership tracking, state saving, undo/redo, replay, and detailed mechanics for 1-4 players.
- **Structure**:
  - **Frontend**: React with JSX, styled with Tailwind CSS.
  - **Backend**: Node.js with Express, MongoDB for persistence, Redis for sessions.
- **Features**:
  - Full board representation via piece placement (regions, tracks, dice, cards).
  - Multi-player support (Witch-king, Saruman, Gondor/Elves, Rohan/North/Dwarves).
  - Expansions (e.g., *Lords of Middle-earth*), AI plugins, companion mode.
  - Desync-free state (no flags like `siegeStatus`, `hidden`).
  - Simplified undo/redo as piece movements.

---

## Technology Stack
- **Backend**: Node.js (v18+), Express, `crypto` (AES-256), MongoDB, Redis.
- **Frontend**: React, JSX (Babel), Tailwind CSS, `react-i18next`, `reduxjs/toolkit`.
- **Communication**: WebSocket (`socket.io`, HTTPS), REST API (HTTPS).
- **Dev Tools**: Docker, Jest, Quicktype (schema sharing).
- **Schema Sharing**: Backend generates TypeScript types for frontend using Quicktype.

---

## Backend Architecture

### 1. Game State Model
The game state is a piece-based data structure, stored in Redux for global access and synchronized via WebSocket. It infers state from piece placement (e.g., units, chits, dice, cards) rather than flags, preventing desync (e.g., no `siegeStatus`, `hidden`). Below is the updated schema with annotations.

- **Schema**:
```javascript
const gameStateSchema = {
  gameId: { type: String, required: true }, // Unique identifier (UUID)
  mode: { type: String, enum: ["Full", "Companion"], default: "Full" }, // Game mode
  rulesEnforced: { type: Boolean, default: true }, // Enforce rules
  playerCount: { type: Number, enum: [1, 2, 3, 4], default: 2 }, // Players
  expansions: { type: [String], default: [] }, // e.g., ["Lords of Middle-earth"]
  scenario: { type: String, default: "Base" }, // e.g., "Breaking of the Fellowship"
  players: [{
    id: { type: String, required: true }, // Player ID
    team: { type: String, enum: ["Free", "Shadow"], required: true },
    role: { type: String, enum: ["FreeAll", "GondorElves", "RohanNorthDwarves", "Sauron", "Saruman"] },
    isAI: { type: Boolean, default: false },
    aiStrategy: { type: String, default: null }, // e.g., "Aggressive"
    isLeading: { type: Boolean, default: false }, // Current leader
    controlledNations: { type: [String], default: [] } // e.g., ["Gondor"]
  }],
  board: {
    regions: {
      type: Map,
      of: {
        name: { type: String, required: true }, // e.g., "Minas_Tirith"
        control: { type: String, default: null }, // "Free", "Shadow", null
        nation: { type: String, required: true }, // e.g., "Gondor"
        deployments: [{
          group: { type: String, enum: ["normal", "besieged", "sieging", "rearGuard"] },
          units: {
            regular: { type: Number, default: 0 },
            elite: { type: Number, default: 0 },
            owner: { type: String, required: true } // Player ID
          },
          leaders: { type: Number, default: 0 }
        }],
        characters: [{ id: { type: String }, owner: { type: String } }], // e.g., [{id: "frodo_sam", owner: "FreeAll"}]
        structure: {
          type: { type: String, enum: ["town", "city", "stronghold", "fortification", null] },
          category: { type: String, enum: ["settlement", "fortification", null] },
          canMuster: { type: Boolean, default: false },
          vp: { type: Number, default: 0 } // e.g., 2
        }
      }
    },
    actionDiceArea: {
      free: [{ type: String }], // e.g., [{type: "Army"}]
      shadow: [{ type: String }]
    },
    usedDiceArea: {
      free: [{ type: String }], // e.g., [{type: "Character"}]
      shadow: [{ type: String }]
    },
    selectedDiceArea: {
      type: Map,
      of: { type: String, index: Number } // e.g., {type: "Eye", index: 1}
    },
    huntBox: {
      diceArea: [{ type: String, team: String }], // e.g., [{type: "Character", team: "Free"}]
      tile: String // e.g., "Reveal"
    },
    huntPool: {
      tiles: [{ id: String }] // e.g., [{id: "Eye_1"}]
    },
    reservedHuntTilesArea: {
      type: Map,
      of: [{ id: String, owner: String }] // e.g., [{id: "Balrog_1", owner: "Sauron"}]
    },
    elvenRingsArea: {
      free: [{ id: String }], // e.g., [{id: "ring_1"}]
      shadow: [{ id: String }]
    },
    tableCardsArea: {
      type: Map,
      of: { id: String, owner: String, type: String } // e.g., {id: "Council", owner: "GondorElves", type: "event"}
    },
    eventDecks: {
      freeCharacter: [{ id: String }],
      freeStrategy: [{ id: String }],
      shadowCharacter: [{ id: String }],
      shadowStrategy: [{ id: String }]
    },
    fellowshipTrack: {
      progress: { type: Number, default: 0 }, // 0-12 steps
      corruption: { type: Number, default: 0 } // 0-12
    },
    politicalTrack: {
      type: Map,
      of: {
        position: String, // "Step_1", "Step_2", "Step_3", "At_War"
        face: String // "active", "passive"
      }
    },
    guideBox: { companion: { type: String, default: "gandalf_grey" } }, // e.g., "frodo_sam"
    fellowshipBox: { companions: [{ id: String, owner: String }], default: [] }, // e.g., [{id: "frodo_sam", owner: "FreeAll"}]
    mordorTrack: { position: { type: String, default: null } }, // e.g., "Step_1"
    gollum: {
      location: { type: String, default: null }, // e.g., "fellowshipBox"
      owner: { type: String, default: null } // e.g., "FreeAll"
    }
  },
  offBoard: {
    free: {
      hand: [{ id: String }],
      discards: [{ id: String }],
      reserves: { type: Map, of: { regular: Number, elite: Number } },
      graveyard: [{ id: String, owner: String }]
    },
    shadow: { ... },
    playerAreas: {
      type: Map,
      of: {
        characters: [{ id: String, owner: String }] // e.g., [{id: "witch_king", owner: "Sauron"}]
      }
    }
  },
  turn: {
    phase: { type: String, required: true }, // e.g., "Action Resolution"
    activePlayer: { type: String, required: true },
    turnOrder: { type: [String], default: [] }
  },
  history: [{ action: { type: Object, required: true }, timestamp: { type: Date, required: true } }], // Action log
  replay: { actions: { type: [Object], default: [] }, currentStep: { type: Number, default: 0 } } // Replay state
};
```
- **Annotations**:
  - **gameId**: Unique session identifier, generated at start.
  - **mode**: "Full" for online, "Companion" for physical assistance.
  - **players**: Supports 1-4 players with roles (e.g., “Sauron” = Witch-king, “Saruman”), no `hand` (moved to `offBoard`).
  - **board.regions**: Tracks units (`deployments`), characters (`characters[{id, owner}]`), control, no flags (e.g., `siegeStatus`).
  - **actionDiceArea/usedDiceArea/selectedDiceArea**: Dice faces (`type`), no `selected` flag, `usedDiceArea` for used dice, `selectedDiceArea` for intent.
  - **huntBox.diceArea**: Dice with `team` (Free Peoples/Shadow), infers Fellowship movement, triggers “Eye” placement, no `dice` count.
  - **huntPool/reservedHuntTilesArea**: Tiles (`tiles[{id}]`), reserved tiles (`[{id, owner}]`), no `count`.
  - **tableCardsArea**: Event/combat cards on table (`{id, owner, type}`), tracks ownership (e.g., Witch-king’s “Durin’s_Bane”), no effect flags.
  - **politicalTrack**: Chits (`position`, `face`), active-only “At_War” advance, no `active`.
  - **fellowshipTrack**: No `hidden`, `progress` infers state with `regions.characters`.
  - **offBoard.playerAreas**: Figures (e.g., `witch_king`) with ownership, no implicit state.
  - **turn**: Retains `phase`, `activePlayer` as non-piece-based (player memory), minimal flags.
  - **history**: Logs piece movements (e.g., “play_combat_card”), no flags like `committed`.

- **Implementation Notes**:
  - **Initialization**: Use `initializeGameState(playerCount, expansions, scenario)` to populate from `initial_army_setup.json` (units, control) and `regions.json` (static data). Set `fellowshipBox.companions` to 9 initial companions, `regions["Rivendell"].characters` for starting Fellowship.
  - **Dice**: Populate `actionDiceArea.free` (4 dice), `actionDiceArea.shadow` (7 dice), adjustable (e.g., Witch-king adds 1 die). No `selected`, use `selectedDiceArea`, `usedDiceArea`.
  - **Cards**: Initialize `eventDecks`, move to `offBoard.hand`, `tableCardsArea`, or `offBoard.discards` as played, track ownership.
  - **Schema Sharing**: Generate TypeScript types with Quicktype:
    ```bash
    quicktype -s schema gameStateSchema.json -o src/types/GameState.ts --lang typescript
    ```

---

### 2. Rules Engine
The rules engine enforces *Rules Guide v2.6* logic server-side using piece placement, removing flags to prevent desync. Below are updated examples.

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
  // Include all 13 characters
]
```
- **Move Validation** (`validateMove.js`):
```javascript
function validateMove(action, state) {
  const player = state.players.find(p => p.id === state.turn.activePlayer);
  const dicePool = state.board.actionDiceArea[player.team];
  const selectedDie = state.board.selectedDiceArea[player.id];
  if (!selectedDie || !dicePool.some(d => d.type === selectedDie.type)) {
    return { valid: false, message: "No valid die selected" };
  }

  if (action.type === "PLAY_MINION") {
    const character = require("./characters.json").find(c => c.id === action.characterId);
    const roleMap = {
      "GondorElves": ["Gondor", "Elves"],
      "RohanNorthDwarves": ["Rohan", "North", "Dwarves"],
      "Sauron": ["Sauron"],
      "Saruman": ["Saruman"],
      "FreeAll": ["Free Peoples", "Gondor", "Elves", "Rohan", "North", "Dwarves"]
    };
    const allowed = roleMap[player.role] || [];
    if (!allowed.includes(character.playableBy)) {
      return { valid: false, message: "Character not playable by this role" };
    }
    const isOffBoard = state.offBoard.playerAreas[player.id]?.characters.some(c => c.id === action.characterId);
    if (!isOffBoard) {
      return { valid: false, message: "Character not in player area" };
    }
  } else if (action.type === "ADVANCE_NATION") {
    const track = state.politicalTrack[action.nation];
    if (track.position === "Step_3" && action.steps > 0 && track.face !== "active") {
      return { valid: false, message: "Passive chit cannot advance to At War" };
    }
  }
  return { valid: true, message: "" };
}
```
- **Action Resolution** (`resolveAction.js`):
```javascript
function resolveAction(action, state) {
  const player = state.players.find(p => p.id === state.turn.activePlayer);
  let updatedState = JSON.parse(JSON.stringify(state)); // Deep copy
  switch (action.type) {
    case "MOVE_FELLOWSHIP":
      updatedState.board.huntBox.diceArea.push({
        type: updatedState.board.selectedDiceArea[player.id].type,
        team: player.team
      });
      updatedState.board.actionDiceArea[player.team].splice(
        updatedState.board.selectedDiceArea[player.id].index, 1
      );
      updatedState.board.selectedDiceArea[player.id] = null;
      updatedState.fellowshipTrack.progress++;
      break;
    case "PLAY_MINION":
      updatedState.offBoard.playerAreas[player.id].characters = 
        updatedState.offBoard.playerAreas[player.id].characters.filter(
          c => c.id !== action.characterId
        );
      updatedState.board.regions[action.regionId].characters.push({
        id: action.characterId,
        owner: player.id
      });
      break;
    case "PLAY_COMBAT_CARD":
      updatedState.offBoard[player.team].hand = 
        updatedState.offBoard[player.team].hand.filter(c => c.id !== action.cardId);
      updatedState.tableCardsArea[action.cardId] = {
        id: action.cardId,
        owner: player.id,
        type: "combat"
      };
      break;
  }
  updatedState.history.push({
    action,
    timestamp: new Date()
  });
  return updatedState;
}
```

---

### 3. Combat and Siege Logic
Combat and siege logic infers state from piece placement, removing flags like `siegeStatus`, `combat.combatCards`.

- **Combat Resolution** (`resolveCombat.js`):
```javascript
function hasSiege(region) {
  return region.deployments.some(d => d.group === "sieging") && 
         region.deployments.some(d => d.group === "besieged");
}
function resolveCombat(state, regionId) {
  const region = state.board.regions[regionId];
  const attackerUnits = region.deployments.find(d => d.group === "sieging")?.units || 
                       region.deployments.find(d => d.group === "normal")?.units;
  const defenderUnits = region.deployments.find(d => d.group === "besieged")?.units || 
                       region.deployments.find(d => d.group === "normal")?.units;
  const isSiege = hasSiege(region);

  for (let round = 1; round <= 5; round++) {
    let attackerHits = 0, defenderHits = 0;
    const attackerRoll = Math.min(attackerUnits.regular + attackerUnits.elite, 5);
    const defenderRoll = Math.min(defenderUnits.regular + defenderUnits.elite, 5);

    // Apply combat cards
    const combatCards = Object.values(state.tableCardsArea).filter(c => c.type === "combat");
    combatCards.forEach(card => {
      const effect = getCombatCardEffect(card.id, state, regionId);
      if (card.owner.team === "Free") {
        defenderHits += effect.hits || 0;
      } else {
        attackerHits += effect.hits || 0;
      }
    });

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
    if (attackerUnits.regular + attackerUnits.elite === 0 || 
        defenderUnits.regular + defenderUnits.elite === 0) {
      break;
    }

    state.history.push({
      action: {
        type: "resolve_combat_round",
        regionId,
        cards: combatCards,
        to: "discards"
      }
    });
    combatCards.forEach(card => {
      state.offBoard[card.owner.team].discards.push({ id: card.id });
      delete state.tableCardsArea[card.id];
    });
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
- **Siege Initiation** (`initiateSiege.js`):
```javascript
function initiateSiege(state, regionId) {
  const region = state.board.regions[regionId];
  if (region.deployments[0].units.owner === "Shadow" && region.control !== "Shadow") {
    state.history.push({
      action: {
        type: "initiate_siege",
        regionId,
        oldDeployments: [...region.deployments]
      }
    });
    region.deployments.push({
      group: "besieged",
      units: { regular: region.deployments[0].units.regular, elite: region.deployments[0].units.elite, owner: "Free" },
      leaders: region.deployments[0].leaders
    });
    region.deployments[0].group = "sieging";
    if (region.deployments[1].units.regular + region.deployments[1].units.elite > 5) {
      const excess = region.deployments[1].units.regular + region.deployments[1].units.elite - 5;
      region.deployments[1].units.regular = Math.max(0, region.deployments[1].units.regular - excess);
      state.offBoard.free.reserves[region.nation].regular += excess;
    }
  }
}
```

---

### 4. State Management
State management relies on piece placement, simplifying logic and undo/redo.

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
  - Use `redux-undo` with piece-based actions:
    ```javascript
    const { configureStore, undoable } = require('@reduxjs/toolkit');
    const gameReducer = require('./reducers/gameReducer');

    const undoableGameReducer = undoable(gameReducer, {
      limit: state => state.rulesEnforced ? 1 : false, // 1 action in enforced mode
      filter: () => true // All piece movements undoable
    });

    const store = configureStore({
      reducer: {
        game: undoableGameReducer
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(/* WebSocket sync middleware */)
    });
    ```
  - Example Undo:
    ```javascript
    function undoAction(state, action) {
      if (action.type === "play_combat_card") {
        state.offBoard[action.action.owner.team].hand.push({ id: action.action.cardId });
        delete state.tableCardsArea[action.action.cardId];
      } else if (action.type === "move_fellowship") {
        state.board.huntBox.diceArea = 
          state.board.huntBox.diceArea.filter(d => 
            !(d.type === action.action.dieType && d.team === action.action.playerId.team));
        state.board.actionDiceArea[action.action.playerId.team].splice(
          action.action.dieIndex, 0, { type: action.action.dieType }
        );
        state.fellowshipTrack.progress--;
      } else if (action.type === "advance_nation") {
        state.politicalTrack[action.action.nation].position = action.action.oldPosition;
        state.politicalTrack[action.action.nation].face = action.action.oldFace;
      }
      // Other actions (reserve_tile, play_minion, etc.)
    }
    ```

---

### 5. Security
- **Encryption**:
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

## Conclusion
This *War of the Ring Implementation Guide v2.6* updates the original to infer state from piece placement, eliminating flags (`siegeStatus`, `hidden`, `active`, `combatCards`) to prevent desync and simplify undo/redo as piece movements (e.g., “place combat card,” “move fellowship die”). It introduces `tableCardsArea` for combat/event cards, `reservedHuntTilesArea`, `usedDiceArea`, `selectedDiceArea`, and `offBoard.playerAreas`, with ownership tracking (e.g., Witch-king’s “Durin’s_Bane”). The guide covers all board areas (regions, strongholds, tracks, dice, cards), supports multi-player roles, and aligns with *Rules Guide v2.6* and *PRD v1.3*, ensuring robust, desync-free gameplay for our 3D, stronghold-box, large-scale-unit model (~8000 vs. ~5000 troops). Let me know if you need further elaboration or testing!

--- 

This updated guide reflects all discussed changes, ensuring piece-based inference, ownership tracking, and fidelity to the physical game. If you’d like me to refine specific sections, prototype a function (e.g., `playCombatCard`), or test scenarios, just let me know!