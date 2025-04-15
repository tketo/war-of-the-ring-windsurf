Below is a **Refactoring Guide** tailored for Windsurf AI to update the *War of the Ring Implementation Guide v2.6* from its original form to the enhanced version incorporating piece-based state inference, ownership tracking, and simplified undo/redo, as discussed. This guide assumes Windsurf AI is an AI-assisted development tool capable of analyzing codebases, applying schema changes, updating logic, and generating tests. It provides clear, step-by-step instructions to refactor the existing v2.6 implementation to eliminate flags (e.g., `siegeStatus`, `fellowshipTrack.hidden`, `actionDiceArea.selected`, `politicalTrack[{nation}].active`, `combat.combatCards`), infer state from piece placement (e.g., `deployments[{sieging, besieged}]`, `tableCardsArea[{cardId, owner, type}]`, `huntBox.diceArea[{type, team}]`), add new areas (e.g., `reservedHuntTilesArea`, `usedDiceArea`, `selectedDiceArea`), and ensure multi-player accuracy (e.g., Witch-king, Saruman roles). The guide aligns with the physical *War of the Ring* board game (2nd Edition, Rules Guide v2.6), our 3D, stronghold-box, large-scale-unit model (~8000 vs. ~5000 troops), and your clarifications (e.g., combat cards on table, Hunt Box dice, reserved tiles, active-only political track advance).

The guide is structured for Windsurf AI to systematically update the codebase, with tasks, code snippets, estimated effort, and validation steps. It assumes the original v2.6 codebase uses Node.js (v18+), Express, MongoDB, Redis, React, Redux, and WebSocket (`socket.io`), with a schema-based game state, as outlined previously. The refactoring focuses on:

- Removing desync-prone flags (e.g., `siegeStatus`, `hidden`).
- Adding piece-based areas (e.g., `tableCardsArea`, `reservedHuntTilesArea`).
- Updating logic to infer state (e.g., `hasSiege`, `isFellowshipHidden`).
- Simplifying undo/redo to piece movements (e.g., “move units,” “return card”).
- Ensuring ownership tracking (e.g., cards, figures).
- Maintaining multi-player support (1-4 players, roles like Witch-king).

The output is in Markdown (`.md`) format for clarity, providing a roadmap for Windsurf AI to execute with minimal human oversight.

---

# War of the Ring v2.6 Refactoring Guide for Windsurf AI

**Purpose**: Refactor the *War of the Ring Implementation Guide v2.6* to eliminate flag-based state management, infer game state from piece placement, add ownership tracking, introduce new board areas, and simplify undo/redo, ensuring desync-free, multi-player gameplay aligned with *Rules Guide v2.6* and our 3D, stronghold-box, large-scale-unit model (~8000 vs. ~5000 troops).

**Scope**: Update backend (Node.js, Express, MongoDB, Redis), frontend (React, Redux), and WebSocket (`socket.io`) components to reflect piece-based inference for all board areas (regions, strongholds, tracks, dice, cards, etc.), incorporating combat cards, event cards on table, Hunt Box dice, reserved tiles, political track (active-only “At War”), and multi-player figures (Witch-king, Saruman).

**Assumptions**:
- Original v2.6 codebase uses schemas (`gameStateSchema.json`), logic files (`validateMove.js`, `resolveAction.js`, `resolveCombat.js`), and Redux (`store.js`).
- Windsurf AI can parse JavaScript, JSON, apply diffs, update schemas, generate tests, and validate changes.
- Effort estimates assume AI automation (~10-20 lines/minute coding, ~1-2 hours/area for integration).
- Total effort: ~9-11 hours across ~10 major tasks.

**Prerequisites**:
- Access to v2.6 codebase (`src/`, `gameStateSchema.json`, `characters.json`, `regions.json`, `initial_army_setup.json`).
- Node.js v18+, MongoDB, Redis running.
- Jest for testing, Quicktype for schema sharing.

---

## Refactoring Objectives
1. **Eliminate Flags**: Remove `siegeStatus`, `fellowshipTrack.hidden`, `actionDiceArea.selected`, `politicalTrack.active`, `combat.combatCards`, and other flags to prevent desync.
2. **Infer State**: Use piece placement (e.g., `deployments[{sieging, besieged}]`, `tableCardsArea[{cardId, owner, type}]`, `huntBox.diceArea[{type, team}]`) to derive state.
3. **Add Areas**: Introduce `tableCardsArea` (combat/event cards), `reservedHuntTilesArea`, `usedDiceArea`, `selectedDiceArea`, `offBoard.playerAreas`.
4. **Track Ownership**: Ensure cards, figures, and chits include `owner` (e.g., Witch-king’s “Durin’s_Bane”).
5. **Simplify Undo/Redo**: Implement piece-based actions (e.g., “move units,” “place card”) in `history`, no flags like `committed`.
6. **Support Multi-Player**: Validate roles (Witch-king, Saruman, Gondor/Elves, Rohan/North/Dwarves) with ownership.
7. **Maintain Fidelity**: Align with physical game (e.g., Free Peoples dice in Hunt Box, active-only “At War” advance).

---

## Refactoring Tasks

### Task 1: Update Game State Schema
**Description**: Modify `gameStateSchema.json` to remove flags, add new areas, and include ownership fields, ensuring piece-based inference.

**Changes**:
- Remove flags: `siegeStatus` (from `regions`), `fellowshipTrack.hidden`, `actionDiceArea.selected`, `politicalTrack.active`, `combat` (including `combatCards`).
- Add areas: `tableCardsArea`, `reservedHuntTilesArea`, `usedDiceArea`, `selectedDiceArea`, `offBoard.playerAreas`.
- Update fields:
  - `regions.characters`: Add `[{id, owner}]`.
  - `fellowshipBox.companions`: Add `[{id, owner}]`.
  - `actionDiceArea`: Remove `selected`, keep `[{type}]`.
  - `huntBox.diceArea`: Use `[{type, team}]`.
  - `politicalTrack`: Replace `active` with `face`.
  - `gollum`: Use `location` in `characters` or `fellowshipBox`.
- Retain `turn.phase`, `turn.activePlayer` (non-piece-based).

**Code**:
```json
{
  "gameId": { "type": "string", "required": true },
  "mode": { "type": "string", "enum": ["Full", "Companion"], "default": "Full" },
  "rulesEnforced": { "type": "boolean", "default": true },
  "playerCount": { "type": "number", "enum": [1, 2, 3, 4], "default": 2 },
  "expansions": { "type": ["string"], "default": [] },
  "scenario": { "type": "string", "default": "Base" },
  "players": [
    {
      "id": { "type": "string", "required": true },
      "team": { "type": "string", "enum": ["Free", "Shadow"], "required": true },
      "role": { "type": "string", "enum": ["FreeAll", "GondorElves", "RohanNorthDwarves", "Sauron", "Saruman"] },
      "isAI": { "type": "boolean", "default": false },
      "aiStrategy": { "type": "string", "default": null },
      "isLeading": { "type": "boolean", "default": false },
      "controlledNations": { "type": ["string"], "default": [] }
    }
  ],
  "board": {
    "regions": {
      "type": "Map",
      "of": {
        "name": { "type": "string", "required": true },
        "control": { "type": "string", "default": null },
        "nation": { "type": "string", "required": true },
        "deployments": [
          {
            "group": { "type": "string", "enum": ["normal", "besieged", "sieging", "rearGuard"] },
            "units": {
              "regular": { "type": "number", "default": 0 },
              "elite": { "type": "number", "default": 0 },
              "owner": { "type": "string", "required": true }
            },
            "leaders": { "type": "number", "default": 0 }
          }
        ],
        "characters": [
          { "id": { "type": "string" }, "owner": { "type": "string" } }
        ],
        "structure": {
          "type": { "type": "string", "enum": ["town", "city", "stronghold", "fortification", null] },
          "category": { "type": "string", "enum": ["settlement", "fortification", null] },
          "canMuster": { "type": "boolean", "default": false },
          "vp": { "type": "number", "default": 0 }
        }
      }
    },
    "actionDiceArea": {
      "free": [{ "type": "string" }],
      "shadow": [{ "type": "string" }]
    },
    "usedDiceArea": {
      "free": [{ "type": "string" }],
      "shadow": [{ "type": "string" }]
    },
    "selectedDiceArea": {
      "type": "Map",
      "of": { "type": "string", "index": "number" }
    },
    "huntBox": {
      "diceArea": [{ "type": "string", "team": "string" }],
      "tile": "string"
    },
    "huntPool": {
      "tiles": [{ "id": "string" }]
    },
    "reservedHuntTilesArea": {
      "type": "Map",
      "of": [{ "id": "string", "owner": "string" }]
    },
    "elvenRingsArea": {
      "free": [{ "id": "string" }],
      "shadow": [{ "id": "string" }]
    },
    "tableCardsArea": {
      "type": "Map",
      "of": { "id": "string", "owner": "string", "type": "string" }
    },
    "eventDecks": {
      "freeCharacter": [{ "id": "string" }],
      "freeStrategy": [{ "id": "string" }],
      "shadowCharacter": [{ "id": "string" }],
      "shadowStrategy": [{ "id": "string" }]
    },
    "fellowshipTrack": {
      "progress": { "type": "number", "default": 0 },
      "corruption": { "type": "number", "default": 0 }
    },
    "politicalTrack": {
      "type": "Map",
      "of": {
        "position": "string",
        "face": "string"
      }
    },
    "guideBox": { "companion": { "type": "string", "default": "gandalf_grey" } },
    "fellowshipBox": { 
      "companions": [{ "id": "string", "owner": "string" }], 
      "default": [] 
    },
    "mordorTrack": { "position": { "type": "string", "default": null } },
    "gollum": {
      "location": { "type": "string", "default": null },
      "owner": { "type": "string", "default": null }
    }
  },
  "offBoard": {
    "free": {
      "hand": [{ "id": "string" }],
      "discards": [{ "id": "string" }],
      "reserves": { "type": "Map", "of": { "regular": "number", "elite": "number" } },
      "graveyard": [{ "id": "string", "owner": "string" }]
    },
    "shadow": { /* same structure */ },
    "playerAreas": {
      "type": "Map",
      "of": {
        "characters": [{ "id": "string", "owner": "string" }]
      }
    }
  },
  "turn": {
    "phase": { "type": "string", "required": true },
    "activePlayer": { "type": "string", "required": true },
    "turnOrder": { "type": ["string"], "default": [] }
  },
  "history": [{ "action": { "type": "object", "required": true }, "timestamp": { "type": "Date", "required": true } }],
  "replay": { "actions": { "type": ["object"], "default": [] }, "currentStep": { "type": "number", "default": 0 } }
}
```

**Tasks**:
1. Replace `gameStateSchema.json` with the updated schema.
2. Remove `combat` object, `siegeStatus`, `fellowshipTrack.hidden`, `actionDiceArea.selected`, `politicalTrack.active`.
3. Add `tableCardsArea`, `reservedHuntTilesArea`, `usedDiceArea`, `selectedDiceArea`, `offBoard.playerAreas`.
4. Update `regions.characters`, `fellowshipBox.companions` to include `owner`.
5. Modify `huntBox.diceArea` to `[{type, team}]`.
6. Update `politicalTrack` to use `face` instead of `active`.
7. Generate TypeScript types:
   ```bash
   quicktype -s schema gameStateSchema.json -o src/types/GameState.ts --lang typescript
   ```

**Effort**: ~1 hour (schema update ~30 min, type generation ~30 min).

**Validation**:
- Run `npm test` to ensure schema parses.
- Verify TypeScript types in `src/types/GameState.ts`.
- Check MongoDB schema migration (e.g., `mongooseschema.js`).

---

### Task 2: Update Game Initialization
**Description**: Modify `initializeGameState.js` to populate the new schema with piece-based data, removing flag dependencies.

**Changes**:
- Initialize `tableCardsArea`, `reservedHuntTilesArea`, `usedDiceArea`, `selectedDiceArea`, `offBoard.playerAreas`.
- Set `regions.characters[{id, owner}]`, `fellowshipBox.companions[{id, owner}]` with ownership.
- Populate `huntBox.diceArea` as empty, ready for dice placement.
- Use `politicalTrack[nation].face` (`active`/`passive`) based on `initial_army_setup.json`.
- Remove `siegeStatus`, `fellowshipTrack.hidden`, `politicalTrack.active`.

**Code**:
```javascript
// src/initializeGameState.js
const regionsData = require('./regions.json');
const initialSetup = require('./initial_army_setup.json');
const uuid = require('uuid');

function initializeGameState(playerCount, expansions = [], scenario = "Base") {
  const state = {
    gameId: uuid.v4(),
    mode: "Full",
    rulesEnforced: true,
    playerCount,
    expansions,
    scenario,
    players: initializePlayers(playerCount),
    board: {
      regions: new Map(),
      actionDiceArea: { free: [], shadow: [] },
      usedDiceArea: { free: [], shadow: [] },
      selectedDiceArea: new Map(),
      huntBox: { diceArea: [], tile: null },
      huntPool: { tiles: initializeHuntTiles() },
      reservedHuntTilesArea: new Map(),
      elvenRingsArea: { free: [{ id: "ring_1" }, { id: "ring_2" }, { id: "ring_3" }], shadow: [] },
      tableCardsArea: new Map(),
      eventDecks: initializeEventDecks(),
      fellowshipTrack: { progress: 0, corruption: 0 },
      politicalTrack: initializePoliticalTrack(),
      guideBox: { companion: "gandalf_grey" },
      fellowshipBox: {
        companions: [
          { id: "frodo_sam", owner: playerCount > 2 ? "GondorElves" : "FreeAll" },
          { id: "gandalf_grey", owner: playerCount > 2 ? "GondorElves" : "FreeAll" },
          // Add other companions
        ]
      },
      mordorTrack: { position: null },
      gollum: { location: "fellowshipBox", owner: playerCount > 2 ? "GondorElves" : "FreeAll" }
    },
    offBoard: {
      free: { hand: [], discards: [], reserves: new Map(), graveyard: [] },
      shadow: { hand: [], discards: [], reserves: new Map(), graveyard: [] },
      playerAreas: new Map()
    },
    turn: { phase: "Setup", activePlayer: null, turnOrder: [] },
    history: [],
    replay: { actions: [], currentStep: 0 }
  };

  // Initialize regions
  Object.entries(regionsData).forEach(([id, data]) => {
    const setup = initialSetup.regions[id] || {};
    state.board.regions[id] = {
      name: data.name,
      control: setup.control || null,
      nation: data.nation,
      deployments: setup.deployments || [{ group: "normal", units: { regular: 0, elite: 0, owner: setup.control || "Free" }, leaders: 0 }],
      characters: setup.characters?.map(c => ({ id: c.id, owner: c.owner || setup.control })) || [],
      structure: data.structure
    };
  });

  // Initialize offBoard.playerAreas
  state.players.forEach(player => {
    state.offBoard.playerAreas[player.id] = { characters: [] };
    if (player.role === "Sauron") {
      state.offBoard.playerAreas[player.id].characters = [
        { id: "witch_king", owner: player.id },
        { id: "mouth_of_sauron", owner: player.id }
      ];
    } else if (player.role === "Saruman") {
      state.offBoard.playerAreas[player.id].characters = [
        { id: "saruman", owner: player.id }
      ];
    }
  });

  // Initialize dice
  state.board.actionDiceArea.free = Array(4).fill().map(() => ({ type: "Unknown" }));
  state.board.actionDiceArea.shadow = Array(7).fill().map(() => ({ type: "Unknown" }));

  return state;
}

function initializePlayers(playerCount) {
  const players = [];
  if (playerCount === 1) {
    players.push({ id: uuid.v4(), team: "Free", role: "FreeAll", controlledNations: ["Gondor", "Elves", "Rohan", "North", "Dwarves"] });
    players.push({ id: uuid.v4(), team: "Shadow", role: "Sauron", isAI: true, controlledNations: ["Sauron", "Southrons", "Isengard"] });
  } else if (playerCount === 2) {
    players.push({ id: uuid.v4(), team: "Free", role: "FreeAll", controlledNations: ["Gondor", "Elves", "Rohan", "North", "Dwarves"] });
    players.push({ id: uuid.v4(), team: "Shadow", role: "Sauron", controlledNations: ["Sauron", "Southrons", "Isengard"] });
  } else if (playerCount === 3) {
    players.push({ id: uuid.v4(), team: "Free", role: "FreeAll", controlledNations: ["Gondor", "Elves", "Rohan", "North", "Dwarves"] });
    players.push({ id: uuid.v4(), team: "Shadow", role: "Sauron", controlledNations: ["Sauron", "Southrons"] });
    players.push({ id: uuid.v4(), team: "Shadow", role: "Saruman", controlledNations: ["Isengard"] });
  } else {
    players.push({ id: uuid.v4(), team: "Free", role: "GondorElves", controlledNations: ["Gondor", "Elves"] });
    players.push({ id: uuid.v4(), team: "Free", role: "RohanNorthDwarves", controlledNations: ["Rohan", "North", "Dwarves"] });
    players.push({ id: uuid.v4(), team: "Shadow", role: "Sauron", controlledNations: ["Sauron", "Southrons"] });
    players.push({ id: uuid.v4(), team: "Shadow", role: "Saruman", controlledNations: ["Isengard"] });
  }
  return players;
}

function initializeHuntTiles() {
  return Array(16).fill().map((_, i) => ({ id: `tile_${i}` })); // Simplified
}

function initializeEventDecks() {
  return {
    freeCharacter: Array(20).fill().map((_, i) => ({ id: `fc_${i}` })),
    freeStrategy: Array(20).fill().map((_, i) => ({ id: `fs_${i}` })),
    shadowCharacter: Array(20).fill().map((_, i) => ({ id: `sc_${i}` })),
    shadowStrategy: Array(20).fill().map((_, i) => ({ id: `ss_${i}` }))
  };
}

function initializePoliticalTrack() {
  const nations = ["Gondor", "Elves", "Rohan", "North", "Dwarves", "Sauron", "Southrons", "Isengard"];
  const track = new Map();
  nations.forEach(nation => {
    track[nation] = { position: "Step_1", face: "passive" };
  });
  track["Sauron"] = { position: "At_War", face: "active" }; // Sauron starts at war
  return track;
}

module.exports = initializeGameState;
```

**Tasks**:
1. Update `initializeGameState.js` with new schema fields.
2. Remove flag initializations (`siegeStatus`, `hidden`, `active`, `combat`).
3. Initialize `offBoard.playerAreas` for figures (e.g., Witch-king, Saruman) with `owner`.
4. Set `fellowshipBox.companions`, `regions.characters` with `owner` (e.g., “GondorElves” for 3/4 players).
5. Initialize `actionDiceArea`, `usedDiceArea`, `selectedDiceArea`, `huntBox.diceArea`, `reservedHuntTilesArea`, `tableCardsArea`.

**Effort**: ~1 hour (code update ~30 min, validation ~30 min).

**Validation**:
- Run `npm test` to verify initialization.
- Test multi-player setups (2, 3, 4 players) for correct `playerAreas`, `controlledNations`.
- Check MongoDB for schema compliance.

---

### Task 3: Refactor Combat and Siege Logic
**Description**: Update `resolveCombat.js` and `initiateSiege.js` to infer sieges from `deployments[{sieging, besieged}]`, handle combat cards in `tableCardsArea`, and remove `combat` object.

**Changes**:
- Remove `combat` object, `siegeStatus`.
- Add `hasSiege` to check `deployments`.
- Update combat card handling to use `tableCardsArea[{cardId, owner, type}]`.
- Log actions in `history` for undo/redo (e.g., “play_combat_card”).

**Code**:
```javascript
// src/resolveCombat.js
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
      },
      timestamp: new Date()
    });
    combatCards.forEach(card => {
      state.offBoard[card.owner.team].discards.push({ id: card.id });
      delete state.tableCardsArea[card.id];
    });
  }

  return state;
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

function getCombatCardEffect(cardId, state, regionId) {
  // Mock effect lookup (replace with actual card data)
  const effects = {
    "Heroic_Stand": { hits: 1 },
    "Durins_Bane": regionId === "Moria" ? { hits: 1 } : { hits: 0 }
  };
  return effects[cardId] || { hits: 0 };
}

module.exports = { resolveCombat, hasSiege };

// src/initiateSiege.js
function initiateSiege(state, regionId) {
  const region = state.board.regions[regionId];
  if (region.deployments[0].units.owner === "Shadow" && region.control !== "Shadow") {
    state.history.push({
      action: {
        type: "initiate_siege",
        regionId,
        oldDeployments: [...region.deployments]
      },
      timestamp: new Date()
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
  return state;
}

module.exports = initiateSiege;
```

**Tasks**:
1. Update `resolveCombat.js` to use `hasSiege`, remove `combat` object.
2. Modify combat card logic to check `tableCardsArea`, discard post-round.
3. Update `initiateSiege.js` to log `deployments` changes, remove `siegeStatus`.
4. Add `history` pushes for all actions (e.g., “resolve_combat_round”).
5. Create mock `getCombatCardEffect` (replace with `cards.json` later).

**Effort**: ~1.5 hours (code update ~1 hour, validation ~30 min).

**Validation**:
- Test `hasSiege` with siege scenarios (e.g., Minas Tirith: 5 Shadow regulars `sieging`, 3 Free regulars `besieged`).
- Verify combat cards apply (e.g., “Heroic_Stand” adds +1 hit, discarded).
- Run `npm test` for `resolveCombat`, `initiateSiege`.
- Simulate battle (e.g., Helm’s Deep) to check `history` logs.

---

### Task 4: Refactor Card Handling (Event and Combat Cards)
**Description**: Update card logic to use `tableCardsArea[{cardId, owner, type}]` for event and combat cards, track ownership, remove `combat.combatCards`.

**Changes**:
- Add `playCardOnTable`, `playCombatCard`, `resolveTableCardEffect`.
- Update `offBoard.hand`, `offBoard.discards` to sync with `tableCardsArea`.
- Log card actions in `history` for undo/redo.
- Ensure multi-player ownership (e.g., Witch-king’s “Durin’s_Bane” vs. Saruman).

**Code**:
```javascript
// src/cardActions.js
function isTableCard(cardId) {
  // Mock lookup (replace with cards.json)
  return ["Council", "White_Rider", "Foul_Thing"].includes(cardId);
}

function isCombatCard(cardId) {
  // Mock lookup
  return ["Heroic_Stand", "Durins_Bane", "Shield_Wall"].includes(cardId);
}

function playCardOnTable(state, playerId, cardId) {
  const player = state.players.find(p => p.id === playerId);
  const card = state.offBoard[player.team].hand.find(c => c.id === cardId);
  if (card && isTableCard(cardId)) {
    state.history.push({
      action: {
        type: "play_card_table",
        playerId,
        cardId,
        owner: playerId,
        from: "hand",
        to: "tableCardsArea"
      },
      timestamp: new Date()
    });
    state.offBoard[player.team].hand = 
      state.offBoard[player.team].hand.filter(c => c.id !== cardId);
    state.tableCardsArea[cardId] = { id: cardId, owner: playerId, type: "event" };
    applyCardEffect(state, cardId); // Immediate effect, if any
  }
  return state;
}

function playCombatCard(state, playerId, cardId, regionId) {
  const player = state.players.find(p => p.id === playerId);
  const card = state.offBoard[player.team].hand.find(c => c.id === cardId);
  if (card && isCombatCard(cardId) && isValidCombatRegion(state, regionId, playerId)) {
    state.history.push({
      action: {
        type: "play_combat_card",
        playerId,
        cardId,
        owner: playerId,
        regionId,
        from: "hand",
        to: "tableCardsArea"
      },
      timestamp: new Date()
    });
    state.offBoard[player.team].hand = 
      state.offBoard[player.team].hand.filter(c => c.id !== cardId);
    state.tableCardsArea[cardId] = { id: cardId, owner: playerId, type: "combat" };
  }
  return state;
}

function resolveTableCardEffect(state, playerId, cardId, nation) {
  const player = state.players.find(p => p.id === playerId);
  if (state.tableCardsArea[cardId]?.owner === playerId && state.tableCardsArea[cardId].type === "event") {
    state.history.push({
      action: {
        type: "resolve_table_card",
        playerId,
        cardId,
        nation,
        to: "discards"
      },
      timestamp: new Date()
    });
    if (cardId === "Council") {
      state.politicalTrack[nation].face = "active";
    }
    state.offBoard[player.team].discards.push({ id: cardId });
    delete state.tableCardsArea[cardId];
  }
  return state;
}

function isValidCombatRegion(state, regionId, playerId) {
  const region = state.board.regions[regionId];
  const player = state.players.find(p => p.id === playerId);
  return region.deployments.some(d => d.units.owner === player.team);
}

function applyCardEffect(state, cardId) {
  // Mock effect (replace with cards.json)
  if (cardId === "Council") {
    // Placeholder for immediate effect, if any
  }
}

module.exports = { playCardOnTable, playCombatCard, resolveTableCardEffect };
```

**Tasks**:
1. Create `cardActions.js` with `playCardOnTable`, `playCombatCard`, `resolveTableCardEffect`.
2. Update `offBoard.hand`, `offBoard.discards` to sync with `tableCardsArea`.
3. Remove `combat.combatCards` references in combat logic.
4. Add `history` pushes for card actions (e.g., “play_combat_card”).
5. Mock `isTableCard`, `isCombatCard`, `applyCardEffect` (stub for `cards.json`).

**Effort**: ~1.5 hours (code ~1 hour, validation ~30 min).

**Validation**:
- Test `playCombatCard` (e.g., “Heroic_Stand” in Minas Tirith siege, owner “GondorElves”).
- Verify `playCardOnTable` (e.g., “Council” on table, owner “FreeAll”).
- Check `resolveTableCardEffect` (e.g., “Council” flips Gondor chit, moves to `discards`).
- Run `npm test` for card logic.
- Simulate 4-player game to ensure ownership (e.g., Witch-king’s “Durin’s_Bane” vs. Saruman).

---

### Task 5: Refactor Hunt Box and Reserved Tiles
**Description**: Update Hunt Box to use `diceArea[{type, team}]`, add Free Peoples dice for Fellowship moves, trigger “Eye” placement in Phase 1, and create `reservedHuntTilesArea` for reserved tiles.

**Changes**:
- Replace `huntBox.dice` with `diceArea[{type, team}]`.
- Update `moveFellowship` to place Free Peoples dice in `huntBox.diceArea`.
- Modify `recoverActionDice` to check Free Peoples dice, place “Eye” if present.
- Add `reserveHuntTile`, `enterMordor` to manage `reservedHuntTilesArea`.
- Log actions in `history`.

**Code**:
```javascript
// src/huntActions.js
function moveFellowship(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  const dicePool = state.board.actionDiceArea[player.team];
  const dieIndex = state.board.selectedDiceArea[player.id]?.index;
  if (dicePool[dieIndex]?.type === "Character") {
    state.history.push({
      action: {
        type: "move_fellowship",
        playerId,
        dieIndex,
        dieType: dicePool[dieIndex].type,
        from: "actionDiceArea",
        to: "huntBox"
      },
      timestamp: new Date()
    });
    const die = dicePool.splice(dieIndex, 1)[0];
    state.board.huntBox.diceArea.push({ type: die.type, team: player.team });
    state.board.selectedDiceArea[player.id] = null;
    state.fellowshipTrack.progress.value++;
  }
  return state;
}

function recoverActionDice(state) {
  const hasFreeDice = state.board.huntBox.diceArea.some(d => d.team === "Free");
  if (hasFreeDice) {
    state.history.push({
      action: {
        type: "place_eye",
        team: "Shadow",
        to: "huntBox"
      },
      timestamp: new Date()
    });
    state.board.huntBox.diceArea.push({ type: "Eye", team: "Shadow" });
  }
  state.history.push({
    action: {
      type: "reset_hunt_box",
      dice: state.board.huntBox.diceArea
    },
    timestamp: new Date()
  });
  state.board.huntBox.diceArea = [];
  // Reset actionDiceArea (simplified)
  state.board.actionDiceArea.free = Array(4).fill().map(() => ({ type: "Unknown" }));
  state.board.actionDiceArea.shadow = Array(7).fill().map(() => ({ type: "Unknown" }));
  return state;
}

function reserveHuntTile(state, cardId, tileId, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (state.huntPool.tiles.some(t => t.id === tileId)) {
    state.history.push({
      action: {
        type: "reserve_tile",
        cardId,
        tileId,
        owner: playerId,
        from: "huntPool",
        to: "reservedHuntTilesArea"
      },
      timestamp: new Date()
    });
    state.huntPool.tiles = state.huntPool.tiles.filter(t => t.id !== tileId);
    state.reservedHuntTilesArea[cardId] = state.reservedHuntTilesArea[cardId] || [];
    state.reservedHuntTilesArea[cardId].push({ id: tileId, owner: playerId });
  }
  return state;
}

function enterMordor(state, regionId) {
  const player = state.players.find(p => p.id === state.turn.activePlayer);
  state.history.push({
    action: {
      type: "enter_mordor",
      oldRegion: Object.keys(state.board.regions).find(id => 
        state.board.regions[id].characters.some(c => c.id === "frodo_sam")),
      newPosition: "Step_1",
      reservedTiles: Object.values(state.reservedHuntTilesArea).flat()
    },
    timestamp: new Date()
  });
  state.mordorTrack.position = "Step_1";
  state.board.regions[regionId].characters = 
    state.board.regions[regionId].characters.filter(c => c.id !== "frodo_sam");
  Object.keys(state.reservedHuntTilesArea).forEach(cardId => {
    const tiles = state.reservedHuntTilesArea[cardId];
    tiles.forEach(tile => {
      state.board.huntBox.tile = tile.id; // Sequential placement
    });
    delete state.reservedHuntTilesArea[cardId];
  });
  return state;
}

module.exports = { moveFellowship, recoverActionDice, reserveHuntTile, enterMordor };
```

**Tasks**:
1. Create `huntActions.js` with updated `moveFellowship`, `recoverActionDice`, `reserveHuntTile`, `enterMordor`.
2. Remove `huntBox.dice`, use `diceArea[{type, team}]`.
3. Update `resolveAction.js` to call `moveFellowship` for Fellowship moves.
4. Add `history` pushes for all hunt actions.
5. Mock tile effects (replace with `tiles.json` later).

**Effort**: ~1.5 hours (code ~1 hour, validation ~30 min).

**Validation**:
- Test `moveFellowship` (e.g., “Character” die to `huntBox.diceArea`, `progress++`).
- Verify `recoverActionDice` (e.g., Free Peoples die triggers “Eye,” clears `diceArea`).
- Check `reserveHuntTile` (e.g., “Balrog” tile to `reservedHuntTilesArea`, owner “Sauron”).
- Test `enterMordor` (e.g., tiles move to `huntBox.tile`, `mordorTrack.position: "Step_1"`).
- Run `npm test` for hunt logic.

---

### Task 6: Refactor Political Track Logic
**Description**: Update political track to use `position`, `face`, enforce active-only advance from `Step_3` to `At_War`, remove `active` flag.

**Changes**:
- Replace `politicalTrack.active` with `face` (`active`/`passive`).
- Add `canAdvanceToAtWar` to check `face === "active"` at `Step_3`.
- Update `advanceNation`, `activateNation` to log piece movements.
- Remove `active`-based checks in `validateMove.js`, `resolveAction.js`.

**Code**:
```javascript
// src/politicalActions.js
function isNationActive(state, nation) {
  const track = state.politicalTrack[nation];
  return track.position === "At_War" || track.face === "active";
}

function canAdvanceToAtWar(state, nation) {
  const track = state.politicalTrack[nation];
  return track.position === "Step_3" && track.face === "active";
}

function advanceNation(state, nation, steps) {
  const track = state.politicalTrack[nation];
  const positions = ["Step_1", "Step_2", "Step_3", "At_War"];
  const currentIndex = positions.indexOf(track.position);
  let newIndex = currentIndex;
  if (currentIndex === 2 && steps > 0) {
    if (canAdvanceToAtWar(state, nation)) {
      newIndex = Math.min(currentIndex + steps, positions.length - 1);
    } else {
      return state; // Passive at Step_3, can't advance
    }
  } else {
    newIndex = Math.min(currentIndex + steps, positions.length - 1);
  }
  state.history.push({
    action: {
      type: "advance_nation",
      nation,
      oldPosition: track.position,
      oldFace: track.face,
      newPosition: positions[newIndex],
      newFace: newIndex === 3 ? "active" : track.face
    },
    timestamp: new Date()
  });
  track.position = positions[newIndex];
  if (newIndex === 3) track.face = "active";
  return state;
}

function activateNation(state, nation) {
  const track = state.politicalTrack[nation];
  if (track.position !== "At_War" && track.face !== "active") {
    state.history.push({
      action: {
        type: "flip_chit",
        nation,
        oldFace: track.face,
        newFace: "active"
      },
      timestamp: new Date()
    });
    track.face = "active";
  }
  return state;
}

module.exports = { isNationActive, canAdvanceToAtWar, advanceNation, activateNation };
```

**Tasks**:
1. Create `politicalActions.js` with `isNationActive`, `canAdvanceToAtWar`, `advanceNation`, `activateNation`.
2. Remove `politicalTrack.active` references in `validateMove.js`, `resolveAction.js`.
3. Add `history` pushes for chit actions (e.g., “flip_chit”).
4. Update `resolveTableCardEffect` in `cardActions.js` to use `activateNation` for “Council”.

**Effort**: ~1 hour (code ~40 min, validation ~20 min).

**Validation**:
- Test `canAdvanceToAtWar` (e.g., Gondor at `Step_3`, passive = no advance; active = advance).
- Verify `advanceNation` (e.g., Sauron to “At_War”, face “active”).
- Check `activateNation` (e.g., Rohan flips to active, triggers muster).
- Run `npm test` for political logic.
- Simulate 4-player game (e.g., Witch-king advances Sauron, Gondor/Elves flip Gondor).

---

### Task 7: Update Fellowship and Hunt Logic
**Description**: Refactor Fellowship to infer state from `regions.characters`, `fellowshipBox.companions`, `fellowshipTrack.progress`, remove `hidden`, and update hunt logic for `diceArea`, `reservedHuntTilesArea`.

**Changes**:
- Remove `fellowshipTrack.hidden`.
- Add `isFellowshipHidden` to check `frodo_sam` placement.
- Update `moveFellowship` (already in Task 5) to use `huntBox.diceArea`.
- Add `reserveHuntTile`, `enterMordor` (Task 5).
- Update `resolveHunt` to use `isFellowshipHidden`, `huntBox.tile`.

**Code**:
```javascript
// src/fellowshipActions.js
function isFellowshipHidden(state) {
  return state.fellowshipBox.companions.some(c => c.id === "frodo_sam") || 
         !Object.values(state.board.regions).some(r => 
           r.characters.some(c => c.id === "frodo_sam"));
}

function resolveHunt(state) {
  const huntSuccess = state.board.huntBox.diceArea.some(d => d.type === "Eye" && Math.random() > 0.5); // Simplified
  if (huntSuccess) {
    const tile = state.board.huntBox.tile || drawHuntTile(state);
    if (tile.type === "Reveal" && isFellowshipHidden(state)) {
      const player = state.players.find(p => p.team === "Free");
      const regionId = chooseRegion(player.id, state); // AI or UI input
      state.history.push({
        action: {
          type: "reveal_fellowship",
          playerId: player.id,
          fromRegion: findFrodoRegion(state),
          toRegion: regionId,
          oldProgress: state.fellowshipTrack.progress.value,
          newProgress: adjustProgress(state.fellowshipTrack.progress.value, regionId)
        },
        timestamp: new Date()
      });
      state.fellowshipTrack.progress.value = adjustProgress(state.fellowshipTrack.progress.value, regionId);
      state.board.regions[regionId].characters.push({ id: "frodo_sam", owner: player.id });
      state.fellowshipBox.companions = state.fellowshipBox.companions.filter(c => c.id !== "frodo_sam");
      Object.values(state.board.regions).forEach(r => 
        r.characters = r.characters.filter(c => c.id !== "frodo_sam"));
    } else if (tile.type === "Eye" && isFellowshipHidden(state)) {
      state.history.push({
        action: {
          type: "apply_hunt_tile",
          tileId: tile.id,
          effect: "corruption"
        },
        timestamp: new Date()
      });
      state.fellowshipTrack.corruption += tile.corruption || 1;
    }
    state.board.huntBox.tile = null;
  }
  return state;
}

function drawHuntTile(state) {
  const tile = state.huntPool.tiles.pop();
  if (tile) {
    state.history.push({
      action: {
        type: "draw_tile",
        tileId: tile.id,
        from: "huntPool",
        to: "huntBox"
      },
      timestamp: new Date()
    });
    state.board.huntBox.tile = tile.id;
  }
  return { id: tile.id, type: tile.id.includes("Eye") ? "Eye" : "Reveal" }; // Simplified
}

function findFrodoRegion(state) {
  return Object.keys(state.board.regions).find(id => 
    state.board.regions[id].characters.some(c => c.id === "frodo_sam")) || null;
}

function adjustProgress(currentProgress, regionId) {
  // Mock adjustment (replace with region distance logic)
  return currentProgress + 1;
}

function chooseRegion(playerId, state) {
  // Mock UI/AI input (replace with actual logic)
  return "Lorien";
}

module.exports = { isFellowshipHidden, resolveHunt, drawHuntTile };
```

**Tasks**:
1. Create `fellowshipActions.js` with `isFellowshipHidden`, `resolveHunt`, `drawHuntTile`.
2. Remove `fellowshipTrack.hidden` references.
3. Update `resolveHunt` to use `isFellowshipHidden`, `huntBox.diceArea`, `huntBox.tile`.
4. Integrate `moveFellowship`, `reserveHuntTile`, `enterMordor` (from Task 5).
5. Add `history` pushes for hunt actions (e.g., “reveal_fellowship”).
6. Mock `adjustProgress`, `chooseRegion` (replace with `regions.json` logic).

**Effort**: ~1.5 hours (code ~1 hour, validation ~30 min).

**Validation**:
- Test `isFellowshipHidden` (e.g., `frodo_sam` in `fellowshipBox` = hidden, in “Lorien” = revealed).
- Verify `resolveHunt` (e.g., “Eye” tile adds corruption if hidden, “Reveal” moves `frodo_sam`).
- Check `drawHuntTile` (e.g., tile to `huntBox.tile`, logged in `history`).
- Run `npm test` for hunt logic.
- Simulate 3-player game (e.g., Free Peoples move Fellowship, Shadow hunts).

---

### Task 8: Refactor Multi-Player Figure Logic
**Description**: Update figure handling to use `offBoard.playerAreas[{playerId}].characters[{id, owner}]`, ensure ownership (e.g., Witch-king, Saruman), remove implicit state.

**Changes**:
- Add `offBoard.playerAreas` for figures (e.g., `witch_king`, `saruman`).
- Update `playMinion` to move figures from `playerAreas` to `regions.characters`.
- Log actions in `history` for undo/redo.
- Validate ownership in `validateMove.js`.

**Code**:
```javascript
// src/figureActions.js
function canPlayMinionCard(state, playerId, cardId) {
  const card = getCard(cardId); // Assume cards.json
  const requiredCharacter = card.requiredCharacter;
  return state.offBoard.playerAreas[playerId]?.characters.some(c => c.id === requiredCharacter) || 
         Object.values(state.board.regions).some(r => 
           r.characters.some(c => c.id === requiredCharacter && c.owner === playerId));
}

function playMinion(state, playerId, characterId, regionId) {
  const player = state.players.find(p => p.id === playerId);
  if (state.offBoard.playerAreas[playerId]?.characters.some(c => c.id === characterId)) {
    state.history.push({
      action: {
        type: "play_minion",
        playerId,
        characterId,
        owner: playerId,
        from: "playerArea",
        to: regionId
      },
      timestamp: new Date()
    });
    state.offBoard.playerAreas[playerId].characters = 
      state.offBoard.playerAreas[playerId].characters.filter(c => c.id !== characterId);
    state.board.regions[regionId].characters.push({ id: characterId, owner: playerId });
  }
  return state;
}

function getCard(cardId) {
  // Mock (replace with cards.json)
  return { requiredCharacter: cardId.includes("Dreadful") ? "witch_king" : null };
}

module.exports = { canPlayMinionCard, playMinion };
```

**Tasks**:
1. Create `figureActions.js` with `canPlayMinionCard`, `playMinion`.
2. Update `validateMove.js` to check `offBoard.playerAreas`, `regions.characters` for ownership.
3. Remove implicit figure state (e.g., `offBoard.graveyard` assumptions).
4. Add `history` pushes for figure actions (e.g., “play_minion”).
5. Mock `getCard` (replace with `cards.json`).

**Effort**: ~1 hour (code ~40 min, validation ~20 min).

**Validation**:
- Test `playMinion` (e.g., Witch-king moves `witch_king` to “Minas_Morgul”, owner “Sauron”).
- Verify `canPlayMinionCard` (e.g., “Dreadful Spells” valid only if `witch_king` available).
- Check `history` logs (e.g., “play_minion” for Saruman to Orthanc).
- Run `npm test` for figure logic.
- Simulate 4-player game (e.g., Saruman plays `saruman`, Witch-king plays `witch_king`).

---

### Task 9: Update Undo/Redo Logic
**Description**: Refactor `undoAction` in `store.js` to handle piece-based actions (e.g., “play_combat_card,” “move_fellowship,” “advance_nation”), remove flag reversals (e.g., `committed`, `active`).

**Changes**:
- Update `undoAction` to revert piece movements (e.g., cards to `hand`, dice to `actionDiceArea`, chits to `oldPosition`).
- Remove `committed` flag, use `history` for all actions.
- Ensure multi-player ownership (e.g., revert Witch-king’s card to correct `hand`).

**Code**:
```javascript
// src/store.js
const { configureStore, undoable } = require('@reduxjs/toolkit');
const gameReducer = require('./reducers/gameReducer');

function undoAction(state, action) {
  const newState = JSON.parse(JSON.stringify(state));
  switch (action.action.type) {
    case "play_combat_card":
    case "play_card_table":
      newState.offBoard[action.action.owner.team].hand.push({ id: action.action.cardId });
      delete newState.tableCardsArea[action.action.cardId];
      break;
    case "resolve_table_card":
      newState.offBoard[action.action.playerId.team].discards = 
        newState.offBoard[action.action.playerId.team].discards.filter(c => c.id !== action.action.cardId);
      newState.tableCardsArea[action.action.cardId] = { 
        id: action.action.cardId, 
        owner: action.action.playerId, 
        type: "event" 
      };
      if (action.action.cardId === "Council") {
        newState.politicalTrack[action.action.nation].face = "passive";
      }
      break;
    case "move_fellowship":
      newState.board.huntBox.diceArea = 
        newState.board.huntBox.diceArea.filter(d => 
          !(d.type === action.action.dieType && d.team === action.action.playerId.team));
      newState.board.actionDiceArea[action.action.playerId.team].splice(
        action.action.dieIndex, 0, { type: action.action.dieType }
      );
      newState.fellowshipTrack.progress--;
      break;
    case "place_eye":
      newState.board.huntBox.diceArea = 
        newState.board.huntBox.diceArea.filter(d => 
          !(d.type === "Eye" && d.team === "Shadow"));
      break;
    case "reserve_tile":
      newState.reservedHuntTilesArea[action.action.cardId] = 
        newState.reservedHuntTilesArea[action.action.cardId].filter(t => t.id !== action.action.tileId);
      newState.huntPool.tiles.push({ id: action.action.tileId });
      break;
    case "advance_nation":
      newState.politicalTrack[action.action.nation].position = action.action.oldPosition;
      newState.politicalTrack[action.action.nation].face = action.action.oldFace;
      break;
    case "flip_chit":
      newState.politicalTrack[action.action.nation].face = action.action.oldFace;
      break;
    case "play_minion":
      newState.board.regions[action.action.to].characters = 
        newState.board.regions[action.action.to].characters.filter(c => c.id !== action.action.characterId);
      newState.offBoard.playerAreas[action.action.playerId].characters.push({
        id: action.action.characterId,
        owner: action.action.playerId
      });
      break;
    // Add other actions (capture_region, resolve_hunt, etc.)
  }
  return newState;
}

const undoableGameReducer = undoable(gameReducer, {
  limit: state => state.rulesEnforced ? 1 : false,
  filter: () => true,
  undoType: 'UNDO_ACTION',
  redoType: 'REDO_ACTION'
});

const store = configureStore({
  reducer: { game: undoableGameReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(/* WebSocket sync middleware */)
});

module.exports = store;
```

**Tasks**:
1. Update `store.js` to include `undoAction` for all piece-based actions.
2. Remove `committed` flag handling.
3. Add undo logic for combat cards, event cards, Hunt Box dice, reserved tiles, political chits, figures.
4. Ensure `undoableGameReducer` logs all actions in `history`.

**Effort**: ~1.5 hours (code ~1 hour, validation ~30 min).

**Validation**:
- Test undo for combat card (e.g., “Heroic_Stand” back to `hand`).
- Verify undo for Fellowship move (e.g., “Character” die back, `progress--`).
- Check undo for nation advance (e.g., Gondor to `Step_3`, passive).
- Run `npm test` for `undoAction`.
- Simulate 3-player game with undo (e.g., revert Witch-king’s figure, Saruman’s card).

---

### Task 10: Update Other Areas (Victory Points, Elven Rings, Mordor Track, etc.)
**Description**: Refactor remaining areas to use piece-based inference, remove flags (e.g., `victoryPoints`), and update logic.

**Changes**:
- Replace `victoryPoints` with `computeVP`.
- Update `elvenRingsArea` to `[{id}]`.
- Use `mordorTrack.position`, `gollum` in `characters`/`fellowshipBox`.
- Update `eventDecks`, `reserves`, `graveyard` for ownership.
- Log actions in `history`.

**Code**:
```javascript
// src/otherActions.js
function computeVP(state, team) {
  return Object.values(state.board.regions)
    .filter(r => r.control === team && r.structure.vp > 0)
    .reduce((sum, r) => sum + r.structure.vp, 0);
}

function useElvenRing(state, team) {
  const rings = state.elvenRingsArea[team];
  if (rings.length > 0) {
    const ring = rings.pop();
    state.history.push({
      action: {
        type: "use_ring",
        team,
        ringId: ring.id
      },
      timestamp: new Date()
    });
  }
  return state;
}

function captureRegion(state, regionId, team) {
  const region = state.board.regions[regionId];
  state.history.push({
    action: {
      type: "capture_region",
      regionId,
      oldControl: region.control,
      newControl: team
    },
    timestamp: new Date()
  });
  region.control = team;
  return state;
}

module.exports = { computeVP, useElvenRing, captureRegion };
```

**Tasks**:
1. Create `otherActions.js` with `computeVP`, `useElvenRing`, `captureRegion`.
2. Remove `victoryPoints` references in logic, UI.
3. Update `elvenRingsArea`, `mordorTrack`, `gollum` handling.
4. Add `history` pushes for all actions.
5. Update `eventDecks`, `reserves`, `graveyard` for ownership consistency.

**Effort**: ~1.5 hours (code ~1 hour, validation ~30 min).

**Validation**:
- Test `computeVP` (e.g., Free Peoples control Minas Tirith = 2 VP).
- Verify `useElvenRing` (e.g., Free Peoples use ring, logged in `history`).
- Check `captureRegion` (e.g., Shadow captures Helm’s Deep, `control` updated).
- Run `npm test` for other actions.
- Simulate game end to verify VP calculation.

---

### Task 11: Update Frontend Integration
**Description**: Update React components to reflect new schema, remove flag-based UI (e.g., `siegeStatus`), and display piece-based state (e.g., `tableCardsArea`, `huntBox.diceArea`).

**Changes**:
- Update `GameBoard.js` to render `tableCardsArea`, `usedDiceArea`, `selectedDiceArea`, `offBoard.playerAreas`.
- Remove UI for `siegeStatus`, `fellowshipTrack.hidden`, `politicalTrack.active`.
- Display `huntBox.diceArea[{type, team}]`, `politicalTrack.face`.
- Sync with backend via WebSocket.

**Code**:
```javascript
// src/components/GameBoard.js
import React from 'react';
import { useSelector } from 'react-redux';

function GameBoard() {
  const state = useSelector(state => state.game.present);
  const { regions, actionDiceArea, usedDiceArea, selectedDiceArea, huntBox, tableCardsArea, politicalTrack } = state.board;

  return (
    <div>
      <div className="regions">
        {Object.entries(regions).map(([id, region]) => (
          <div key={id}>
            {region.name}: {region.deployments.map(d => `${d.units.regular}R/${d.units.elite}E (${d.group})`).join(', ')}
            {hasSiege(region) && <span> (Siege)</span>}
          </div>
        ))}
      </div>
      <div className="dice">
        Action Dice: {actionDiceArea.free.map(d => d.type).join(', ')} | {actionDiceArea.shadow.map(d => d.type).join(', ')}
        Used: {usedDiceArea.free.map(d => d.type).join(', ')} | {usedDiceArea.shadow.map(d => d.type).join(', ')}
        Hunt Box: {huntBox.diceArea.map(d => `${d.type} (${d.team})`).join(', ')}
      </div>
      <div className="cards">
        On Table: {Object.values(tableCardsArea).map(c => `${c.id} (${c.owner})`).join(', ')}
      </div>
      <div className="political">
        {Object.entries(politicalTrack).map(([nation, track]) => (
          <div key={nation}>
            {nation}: {track.position}, {track.face}
          </div>
        ))}
      </div>
    </div>
  );
}

function hasSiege(region) {
  return region.deployments.some(d => d.group === "sieging") && 
         region.deployments.some(d => d.group === "besieged");
}

export default GameBoard;
```

**Tasks**:
1. Update `GameBoard.js` to render new areas (`tableCardsArea`, `huntBox.diceArea`).
2. Remove flag-based UI (e.g., `siegeStatus`, `hidden`).
3. Add ownership display (e.g., “Heroic_Stand (GondorElves)”).
4. Update WebSocket listeners (`socket.io`) to handle new schema.
5. Adjust CSS (Tailwind) for new areas.

**Effort**: ~1.5 hours (code ~1 hour, validation ~30 min).

**Validation**:
- Render game state (e.g., Minas Tirith siege with “Heroic_Stand” on table).
- Verify UI updates (e.g., “Character” die in `huntBox.diceArea`, Gondor chit “active”).
- Test WebSocket sync (e.g., 4-player game, cards visible to all).
- Run `npm test` for frontend components.
- Simulate UI interaction (e.g., select die, play combat card).

---

### Task 12: Generate and Run Tests
**Description**: Create Jest tests for new logic, schema, and UI, ensuring desync-free behavior and multi-player accuracy.

**Changes**:
- Add tests for `hasSiege`, `isFellowshipHidden`, `isNationActive`, `canAdvanceToAtWar`.
- Test card handling (`playCombatCard`, `playCardOnTable`, `resolveTableCardEffect`).
- Test hunt logic (`moveFellowship`, `recoverActionDice`, `reserveHuntTile`).
- Test figure actions (`playMinion`, `canPlayMinionCard`).
- Validate undo/redo (`undoAction`).

**Code**:
```javascript
// tests/gameLogic.test.js
const { initializeGameState, resolveCombat, hasSiege } = require('../src');

describe('Game Logic', () => {
  let state;

  beforeEach(() => {
    state = initializeGameState(4);
  });

  test('hasSiege detects siege', () => {
    state.board.regions["Minas_Tirith"].deployments = [
      { group: "sieging", units: { regular: 5, elite: 3, owner: "Sauron" }, leaders: 2 },
      { group: "besieged", units: { regular: 3, elite: 2, owner: "GondorElves" }, leaders: 3 }
    ];
    expect(hasSiege(state.board.regions["Minas_Tirith"])).toBe(true);
  });

  test('playCombatCard adds card to tableCardsArea', () => {
    const playerId = state.players.find(p => p.role === "GondorElves").id;
    state.offBoard.free.hand.push({ id: "Heroic_Stand" });
    const newState = playCombatCard(state, playerId, "Heroic_Stand", "Minas_Tirith");
    expect(newState.tableCardsArea["Heroic_Stand"]).toEqual({
      id: "Heroic_Stand",
      owner: playerId,
      type: "combat"
    });
    expect(newState.offBoard.free.hand).not.toContainEqual({ id: "Heroic_Stand" });
  });

  // Add tests for isFellowshipHidden, moveFellowship, canAdvanceToAtWar, etc.
});
```

**Tasks**:
1. Create `tests/gameLogic.test.js` with tests for all new logic.
2. Update existing tests to remove flag checks (e.g., `siegeStatus`).
3. Add multi-player test cases (e.g., Witch-king’s card vs. Saruman).
4. Test undo/redo for all actions (e.g., revert combat card, Fellowship move).
5. Run `npm test` to ensure coverage.

**Effort**: ~1.5 hours (test creation ~1 hour, running ~30 min).

**Validation**:
- Achieve >90% test coverage (`npm run coverage`).
- Verify no failing tests (`npm test`).
- Test edge cases (e.g., passive chit at `Step_3`, combat card in multi-player siege).
- Simulate full game cycle (setup to victory) to catch desync.

---

## Validation Plan
- **Unit Tests**: Run `npm test` after each task, ensure >90% coverage.
- **Integration Tests**: Simulate 2, 3, 4-player games with Jest (`tests/integration.test.js`):
  - Setup: Initialize state, verify `playerAreas`, `tableCardsArea`, `huntBox.diceArea`.
  - Combat: Play “Heroic_Stand,” resolve siege, check hits, discard.
  - Hunt: Move Fellowship, place “Character” die, trigger “Eye,” apply tile.
  - Political: Flip Gondor active, advance to “At_War” (active only).
  - Undo: Revert combat card, Fellowship move, chit flip, verify state.
- **UI Tests**: Render `GameBoard.js`, verify `tableCardsArea`, `huntBox.diceArea`, `politicalTrack.face` display.
- **Multi-Player Sync**: Use WebSocket to simulate 4-player game, ensure `owner` fields (cards, figures) sync across clients.
- **Performance**: Measure logic runtime (`resolveCombat`, `computeVP`), ensure <10ms per call (Node.js v18).
- **Desync Check**: Validate no stale flags (e.g., `grep -r "siegeStatus" src/` returns empty).

## Effort Summary
- Task 1 (Schema): ~1 hour
- Task 2 (Initialization): ~1 hour
- Task 3 (Combat/Siege): ~1.5 hours
- Task 4 (Cards): ~1.5 hours
- Task 5 (Hunt Box/Tiles): ~1.5 hours
- Task 6 (Political Track): ~1 hour
- Task 7 (Fellowship/Hunt): ~1.5 hours
- Task 8 (Figures): ~1 hour
- Task 9 (Undo/Redo): ~1.5 hours
- Task 10 (Other Areas): ~1.5 hours
- Task 11 (Frontend): ~1.5 hours
- Task 12 (Tests): ~1.5 hours
- **Total**: ~9-11 hours

## Post-Refactoring Steps
1. **Deploy**: Push to staging (`git push staging`), run `docker-compose up`.
2. **Monitor**: Check Redis for session sync, MongoDB for state persistence.
3. **Review**: Generate diff (`git diff v2.6 original`), verify no flags reintroduced.
4. **Document**: Update README with new areas (`tableCardsArea`, `reservedHuntTilesArea`).
5. **Test Expansion**: Run *Lords of Middle-earth* scenario to confirm compatibility.

## Notes for Windsurf AI
- **Priority**: Start with Task 1 (schema) to align codebase, then Tasks 3-7 (core logic), Task 11 (frontend), and Task 12 (tests).
- **Error Handling**: If schema conflicts arise, prioritize new fields (`tableCardsArea`), merge manually.
- **Mock Data**: Use `characters.json`, mock `cards.json`, `tiles.json` until full data available.
- **Logging**: Add debug logs (`console.log`) for each action push to `history`.
- **Fallback**: If tests fail, isolate to specific module (e.g., `resolveCombat`), rerun with `--watch`.

---

This guide equips Windsurf AI to refactor the v2.6 implementation systematically, ensuring a desync-free, piece-based game state with robust multi-player support and simplified undo/redo, aligned with the physical *War of the Ring* and our 3D model. If you need a specific task expanded (e.g., detailed test cases), a prototype for Windsurf AI to run, or a simulation log, let me know!