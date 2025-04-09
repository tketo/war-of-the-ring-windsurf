# War of the Ring Implementation TODO List v1.4 (Updated for AI Automation, Undo/Redo, and Schema Sharing)

*Note*: Version 1.4 aligns with PRD v1.3, Rules Guide v1.3, and Implementation Guide v1.4. Designed for AI automation with infrastructure details; game implementation details in Implementation Guide v1.4. Updated for undo/redo per PRD v1.3 and schema sharing via Quicktype.

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
  - [ ] Define schemas for game state, cards, and characters (include `history` with `committed: Boolean`).
  - [ ] Seed MongoDB with 96 event cards, 62 combat cards, and 8 characters.
  - [ ] Set up Redis for session management.
- [ ] **Encryption**
  - [ ] Implement AES-256 `encrypt`/`decrypt` using `crypto`.
  - [ ] Test encryption with sample game state.
- [ ] **Schema Sharing**
  - [ ] Install Quicktype globally: `npm install -g quicktype`.
  - [ ] Add script to generate TypeScript types from game state schema (see Implementation Guide v1.4, Section 7).

## 3. Game State and Rules Engine
- [ ] **Define Game State**
  - [ ] Create game state schema in Mongoose with `history` tracking `committed` status.
  - [ ] Set up Redux store with initial game state using generated TypeScript types.
- [ ] **Implement Rules Engine**
  - [ ] Create `validateMove` function for game actions.
  - [ ] Manage persistent card states.
  - [ ] Test rules engine with sample scenarios.

## 4. API and WebSocket
- [ ] **REST API Endpoints (HTTPS)**
  - [ ] Implement `POST /game/start` to initialize game.
  - [ ] Implement `POST /game/move` for game actions.
  - [ ] Implement `GET /game/state` to return decrypted state.
  - [ ] Add `POST /game/save`, `/load` for state persistence.
  - [ ] Implement `POST /game/undo`, `/redo` with mode-specific logic:
    - Rules Enforced: Limit to current phase before commit.
    - Unrestricted: Full history access.
  - [ ] Implement `POST /game/replay` for action replay.
  - [ ] Set up `POST /player/register` and `GET /player/:id` for profiles.
  - [ ] Create `POST /lobby/create` and `GET /lobby/join` for matchmaking.
  - [ ] Add `POST /card/play` for card actions.
- [ ] **WebSocket Setup (HTTPS)**
  - [ ] Configure `socket.io` with events: `move`, `chat`, `stateUpdate`, `undo`, `redo`.

## 5. Multiplayer and Player Options
- [ ] **Player Configurations**: Support 1-4 players with unique roles.
- [ ] **Lobby/Matchmaking**: Set up Redis queue for lobbies.
- [ ] **Spectator Mode**: Enable read-only WebSocket feed.
- [ ] **Chat**: Implement encrypted WebSocket channel.

## 6. Game Modes and Expansions
- [ ] **Modes**: Implement Full, Unrestricted, and Companion modes with undo/redo support.
- [ ] **Expansions**: Add placeholder JSON configs for future expansions.
- [ ] **Scenarios**: Add placeholder JSON configs for future scenarios.

## 7. State Management
- [ ] **Redux Setup**: Configure store for game and settings with generated types.
- [ ] **Save/Load**: Implement encrypted state storage in MongoDB.
- [ ] **Undo/Redo**:
  - [ ] Rules Enforced: Limit to current phase, track `committed` in `history`.
  - [ ] Unrestricted: Use `redux-undo` for full history.
- [ ] **Replay**: Enable action replay system.

## 8. AI System
- [ ] **Plugin System**: Define AI strategy interface.
- [ ] **Implement AI**: Add "Random" strategy, stub "Queller".
- [ ] **Test AI**: Set up `/game/test` endpoint, validate undo/redo behavior.

## 9. Frontend Setup
- [ ] **Initialize React**: Set up with Redux and `react-i18next` using generated types.
- [ ] **Build UI**: Create SVG map and core components.

## 10. Asset Preparation
- [ ] **Assets**: Prepare SVG map, icons, and card images with i18n placeholders.

## 11. Interactivity
- [ ] **Backend Integration**: Connect frontend to API and WebSocket (include `undo`, `redo` events).
- [ ] **Frontend Logic**: Add interactivity for moves, undo/redo, and animations.

## 12. Testing
- [ ] **Backend Tests**: Test rules engine and undo/redo with Jest.
- [ ] **Frontend Tests**: Test Redux, undo/redo, and i18n functionality.
- [ ] **Playtesting**: Simulate full game turns with undo/redo in both modes.

## 13. Optional Enhancements
- [ ] **Visuals/Audio**: Add animations and audio cues.
- [ ] **Achievements**: Track player achievements in Redux.
- [ ] **Help**: Implement `/help/card/:id` with i18n.

## Milestones
1. **M1: Core Game** (3 months): Tasks 1-3, 7, 9.
2. **M2: Multiplayer** (2 months): Tasks 4-5.
3. **M3: AI/Companion** (2 months): Tasks 8, refine 3 & 9.
4. **M4: Full Release** (2 months): Tasks 10-13.

## Constraints
- No local I/O; HTTPS-only; languages: English, Spanish, French, German, Italian.