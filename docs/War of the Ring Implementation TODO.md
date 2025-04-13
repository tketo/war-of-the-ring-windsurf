# War of the Ring Implementation TODO List v1.8

*Updated for AI Automation, Undo/Redo, Schema Sharing, Multiplayer, Utility Functions, and Separate Region/Army Setup Files*

*Note*: Version 1.8 aligns with PRD v1.3, Rules Guide v1.4, and Implementation Guide v2.2. Designed for AI automation with infrastructure details; game implementation details in Implementation Guide v2.2. Updated for undo/redo per PRD v1.3, schema sharing via Quicktype, 3/4-player rules per Chapter XI, and `characters.json` integration with `playableBy` (distinct from nations). Reflects shared Action Dice pools (`actionDiceArea`) for Free Peoples (4 dice) and Shadow (7 dice) with no individual ownership. Clarified Siege Stacking: max 5 units, excess to reinforcements immediately upon siege start. Uses separate `regions.json` (static region data) and `initial_army_setup.json` (starting units, control) for modularity.

## 1. Project Setup
- [ ] **Initialize Backend Project**
  - [ ] Create `war-of-the-ring-backend` directory.
  - [ ] Run `npm init -y` and install `express socket.io mongoose redis crypto clerk-sdk-node`.
  - [ ] Set up `server.js` with Express and HTTPS (self-signed certs for dev).
- [ ] **Initialize Frontend Project**
  - [ ] Create `war-of-the-ring-frontend/index.html`.
  - [ ] Add CDNs: `cdn.jsdelivr.net/npm/react@18`, `react-dom@18`, `babel`, `react-i18next`, `reduxjs/toolkit`, Tailwind CSS.
  - [ ] Set up `<div id="root">` for React mount.

## 2. Backend Setup
- [ ] **Configure Server**
  - [ ] Enforce HTTPS for Express and `socket.io`.
  - [ ] Integrate Clerk for authentication (use `clerk-sdk-node`).
  - [ ] Add rate limiting and logging for DDoS protection.
- [ ] **Database Setup**
  - [ ] Configure MongoDB with AES-256 encryption.
  - [ ] Define schemas for game state, cards, and characters (include `history` with `committed: Boolean`, `playableBy` for characters, `siegeStatus` and `reserves` for siege stacking).
  - [ ] Seed MongoDB with 96 event cards from `eventcards.json`, 62 combat cards from `combatcards.json`, 13 characters from `characters.json`, static region data from `regions.json`, and base game army setup from `initial_army_setup.json`.
  - [ ] Validate that `initial_army_setup.json` references valid region IDs from `regions.json`.
  - [ ] Set up Redis for session management.
- [ ] **Encryption**
  - [ ] Implement AES-256 `encrypt`/`decrypt` using `crypto`.
  - [ ] Test encryption with sample game state.
- [ ] **Schema Sharing**
  - [ ] Install Quicktype globally: `npm install -g quicktype`.
  - [ ] Add script to generate TypeScript types from game state schema (see Implementation Guide v2.2, Game State Model).

## 3. Game State and Rules Engine
- [ ] **Define Game State**
  - [ ] Create game state schema in Mongoose with `actionDiceArea` tracking shared pools (`free`, `shadow`), `siegeStatus` for regions, and `offBoard.reserves` for excess siege units; include `history` with `committed` status and `playerCount` for 1-4 players.
  - [ ] Remove `owner` field from `actionDiceArea` if present in existing code; ensure shared pool logic (Free: 4 dice, Shadow: 7 dice).
  - [ ] Initialize `board.regions` by combining `regions.json` (static data: names, nation codes) and `initial_army_setup.json` (units, leaders, control, siege status), placing Fellowship in Rivendell with all base game Companions.
  - [ ] Set up Redux store with initial game state reflecting shared dice pools and siege stacking reserves using generated TypeScript types.
- [ ] **Implement Rules Engine**
  - [ ] Create `validateMove` function for game actions, using `actionDiceArea.free` or `actionDiceArea.shadow`, including `playableBy` checks for 3/4-player character plays and siege stacking (max 5 units, excess to `offBoard.reserves`).
  - [ ] Implement `resolveAction` utility function to process actions, update shared dice pools, advance turn order, and manage game state transitions (e.g., to "Military Victory" when dice pools are empty).
  - [ ] Manage persistent card states (e.g., 4-player hand size limit of 4).
  - [ ] Implement 3-player Free player restriction: no consecutive actions with same nation/army.
  - [ ] Test rules engine with sample scenarios from Guide v2.2, including siege stacking, shared dice pools, and character abilities.

## 4. API and WebSocket
- [ ] **REST API Endpoints (HTTPS)**
  - [ ] Implement `POST /game/start` to initialize game (support 1-4 players with role assignments).
  - [ ] Implement `POST /game/move` for game actions (validate `playableBy` for characters, siege stacking).
  - [ ] Implement `GET /game/state` to return decrypted state.
  - [ ] Add `POST /game/save`, `/load` for state persistence.
  - [ ] Implement `POST /game/undo`, `/redo` with mode-specific logic:
    - Rules Enforced: Limit to current phase before commit.
    - Unrestricted: Full history access.
  - [ ] Implement `POST /game/replay` for action replay.
  - [ ] Set up `POST /player/register` and `GET /player/:id` for profiles.
  - [ ] Create `POST /lobby/create` and `GET /lobby/join` for matchmaking.
  - [ ] Add `POST /card/play` for card actions (enforce 4-player draw rules).
- [ ] **WebSocket Setup (HTTPS)**
  - [ ] Configure `socket.io` with events: `move`, `chat`, `stateUpdate`, `undo`, `redo`.

## 5. Multiplayer and Player Options
- [ ] **Player Configurations**:
  - [ ] Support 1-4 players with roles: "FreeAll" (3-player), "GondorElves", "RohanNorthDwarves", "Sauron", "Saruman".
  - [ ] Implement turn order for 3/4-player games using shared dice pools (see Guide v2.2, Rules Engine).
- [ ] **Lobby/Matchmaking**: Set up Redis queue for lobbies, support team assignments.
- [ ] **Spectator Mode**: Enable read-only WebSocket feed.
- [ ] **Chat**: Implement encrypted WebSocket channel.

## 6. Game Modes and Expansions
- [ ] **Modes**: Implement Full, Unrestricted, and Companion modes with undo/redo support.
- [ ] **Expansions**: Add placeholder JSON configs for future expansions (e.g., *Lords of Middle-earth*).
- [ ] **Scenarios**: Add placeholder JSON configs for future scenarios.

## 7. State Management
- [ ] **Redux Setup**: Configure store for game and settings with generated types.
- [ ] **Save/Load**: Implement encrypted state storage in MongoDB.
- [ ] **Undo/Redo**:
  - [ ] Rules Enforced: Limit to current phase, track `committed` in `history`.
  - [ ] Unrestricted: Use `redux-undo` for full history.
- [ ] **Replay**: Enable action replay system.

## 8. AI System
- [ ] **Plugin System**: Define AI strategy interface, include `playableBy` awareness.
- [ ] **Implement AI**: Add "Random" strategy, stub "Queller".
- [ ] **Test AI**: Set up `/game/test` endpoint, validate undo/redo and multiplayer behavior.

## 9. Frontend Setup
- [ ] **Initialize React**: Set up with Redux and `react-i18next` using generated types.
- [ ] **Build UI**: Create SVG map and core components (e.g., `ActionDiceArea` displaying shared `actionDiceArea` pools, `SiegeArea` showing max 5 units with excess to reserves).

## 10. Asset Preparation
- [ ] **Assets**: Prepare SVG map, icons, and card images with i18n placeholders.

## 11. Interactivity
- [ ] **Backend Integration**: Connect frontend to API and WebSocket (include `undo`, `redo` events).
- [ ] **Frontend Logic**: Add interactivity for moves, undo/redo, animations, `playableBy` restrictions, and siege stacking visuals.

## 12. Testing
- [ ] **Backend Tests**:
  - [ ] Test rules engine, undo/redo, `playableBy` validation, shared dice pools, siege stacking (excess to reserves), and utility functions with Jest.
  - [ ] Validate initial army setup against `initial_army_setup.json`, ensuring correct units, leaders, control, and Fellowship placement in Rivendell.
  - [ ] Validate static region data (names, nation codes) against `regions.json`.
  - [ ] Verify that `initial_army_setup.json` references valid region IDs from `regions.json`.
- [ ] **Frontend Tests**: Test Redux, undo/redo, i18n, multiplayer UI, shared dice pools, and siege stacking visuals.
- [ ] **Playtesting**: Simulate full game turns with 3/4 players, undo/redo in both modes, siege stacking scenarios, and character ability validation.

## 13. Optional Enhancements
- [ ] **Visuals/Audio**: Add animations and audio cues.
- [ ] **Achievements**: Track player achievements in Redux.
- [ ] **Help**: Implement `/help/card/:id` with i18n.

## Milestones
1. **M1: Core Game** (3 months): Tasks 1-3, 7, 9.
2. **M2: Multiplayer** (2 months): Tasks 4-5, refine 3.
3. **M3: AI/Companion** (2 months): Tasks 8, refine 3 & 9.
4. **M4: Full Release** (2 months): Tasks 10-13.

## Constraints
- No local I/O; HTTPS-only; languages: English, Spanish, French, German, Italian.