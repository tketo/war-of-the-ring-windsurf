Below is the updated **War of the Ring Implementation TODO List v1.9**, designed to provide a detailed, step-by-step guide for creating the War of the Ring Web App. This version builds upon the provided v1.8 list, incorporating refinements and additional details to ensure a structured development process from project setup to final testing and deployment. It aligns with PRD v1.3, Rules Guide v1.4, and Implementation Guide v2.2, addressing all requirements including AI automation, undo/redo functionality, schema sharing, multiplayer support, and separate region/army setup files.

---

# War of the Ring Implementation TODO List v1.9

*Updated for AI Automation, Undo/Redo, Schema Sharing, Multiplayer, Utility Functions, and Separate Region/Army Setup Files*

**Note**: Version 1.9 aligns with PRD v1.3, Rules Guide v1.4, and Implementation Guide v2.2. This list provides a comprehensive, step-by-step guide to developing the War of the Ring Web App, covering project setup, backend and frontend development, game logic, state management, multiplayer functionality, AI integration, and testing. It ensures compliance with all requirements, including undo/redo functionality, schema sharing via Quicktype, 3/4-player rules, shared Action Dice pools (`actionDiceArea.free` for Free Peoples with 4 dice, `actionDiceArea.shadow` for Shadow with 7 dice), and siege stacking (max 5 units, excess to `offBoard.reserves`). Separate files (`regions.json` for static region data and `initial_army_setup.json` for starting units and control) enhance modularity.

---

## 1. Project Setup
- [ ] **Initialize Backend Project**
  - [ ] Create a directory named `war-of-the-ring-backend`.
  - [ ] Run `npm init -y` to initialize the project with default settings.
  - [ ] Install dependencies: `npm install express socket.io mongoose redis crypto clerk-sdk-node`.
  - [ ] Set up `server.js` with Express and HTTPS, using self-signed certificates for development.
- [ ] **Initialize Frontend Project**
  - [ ] Create a directory named `war-of-the-ring-frontend`.
  - [ ] Create an `index.html` file in the frontend directory.
  - [ ] Add CDN links for React (`cdn.jsdelivr.net/npm/react@18`), React DOM (`react-dom@18`), Babel, `react-i18next`, `reduxjs/toolkit`, and Tailwind CSS.
  - [ ] Add a `<div id="root">` element in `index.html` as the mount point for React.

---

## 2. Backend Setup
- [ ] **Configure Server**
  - [ ] Enforce HTTPS for both Express and `socket.io` to secure communication.
  - [ ] Integrate Clerk for authentication using `clerk-sdk-node`.
  - [ ] Implement rate limiting and logging to mitigate DDoS attacks.
- [ ] **Database Setup**
  - [ ] Configure MongoDB with AES-256 encryption for secure data storage.
  - [ ] Define Mongoose schemas for:
    - Game state (including `history` with `committed: Boolean`, `actionDiceArea`, `siegeStatus`, `offBoard.reserves`).
    - Cards (event and combat).
    - Characters (with `playableBy` field distinct from nations).
  - [ ] Seed MongoDB with:
    - 96 event cards from `eventcards.json`.
    - 62 combat cards from `combatcards.json`.
    - 13 characters from `characters.json`.
    - Static region data from `regions.json` (names, nation codes).
    - Base game army setup from `initial_army_setup.json` (units, leaders, control, siege status).
  - [ ] Validate that `initial_army_setup.json` references valid region IDs from `regions.json`.
  - [ ] Set up Redis for session management to support multiplayer functionality.
- [ ] **Encryption**
  - [ ] Implement AES-256 encryption and decryption functions using the `crypto` module.
  - [ ] Test encryption with a sample game state to verify data security.
- [ ] **Schema Sharing**
  - [ ] Install Quicktype globally: `npm install -g quicktype`.
  - [ ] Create a script to generate TypeScript types from the game state schema (refer to Implementation Guide v2.2, Game State Model).

---

## 3. Game State and Rules Engine
- [ ] **Define Game State**
  - [ ] Create a Mongoose schema for the game state with:
    - `actionDiceArea` for shared dice pools (`free` for Free Peoples with 4 dice, `shadow` for Shadow with 7 dice).
    - `siegeStatus` for regions.
    - `offBoard.reserves` for excess siege units.
    - `history` with `committed: Boolean`.
    - `playerCount` for 1-4 players.
  - [ ] Ensure no `owner` field exists in `actionDiceArea` to enforce shared pool logic.
  - [ ] Initialize `board.regions` by merging:
    - `regions.json` (static data: names, nation codes).
    - `initial_army_setup.json` (units, leaders, control, siege status).
    - Place the Fellowship in Rivendell with all base game Companions.
  - [ ] Set up the Redux store with the initial game state, using generated TypeScript types for consistency.
- [ ] **Implement Rules Engine**
  - [ ] Develop a `validateMove` function to check action legality, using `actionDiceArea.free` or `actionDiceArea.shadow`, with:
    - `playableBy` restrictions for 3/4-player character plays.
    - Siege stacking rules (max 5 units, excess to `offBoard.reserves` immediately upon siege start).
  - [ ] Create a `resolveAction` utility function to:
    - Process actions.
    - Update shared dice pools.
    - Advance turn order.
    - Transition game state (e.g., to "Military Victory" when both pools are empty).
  - [ ] Manage persistent card states (e.g., 4-player hand size limit of 4 cards).
  - [ ] Enforce 3-player Free Peoples restriction: no consecutive actions with the same nation or army.
  - [ ] Test the rules engine with scenarios from Implementation Guide v2.2 (siege stacking, shared dice pools, character abilities).

---

## 4. API and WebSocket
- [ ] **REST API Endpoints (HTTPS)**
  - [ ] `POST /game/start`: Initialize a new game, supporting 1-4 players with role assignments.
  - [ ] `POST /game/move`: Handle game actions, validating `playableBy` and siege stacking.
  - [ ] `GET /game/state`: Return the decrypted game state.
  - [ ] `POST /game/save` and `POST /game/load`: Save and load the game state.
  - [ ] `POST /game/undo` and `POST /game/redo`:
    - **Rules Enforced**: Limit to current phase before actions are committed.
    - **Unrestricted**: Allow full history access.
  - [ ] `POST /game/replay`: Replay actions from history.
  - [ ] `POST /player/register` and `GET /player/:id`: Manage player profiles.
  - [ ] `POST /lobby/create` and `GET /lobby/join`: Handle lobby and matchmaking.
  - [ ] `POST /card/play`: Process card actions, enforcing 4-player draw rules.
- [ ] **WebSocket Setup (HTTPS)**
  - [ ] Configure `socket.io` with events: `move`, `chat`, `stateUpdate`, `undo`, `redo` for real-time updates.

---

## 5. Multiplayer and Player Options
- [ ] **Player Configurations**
  - [ ] Support 1-4 players with roles: "FreeAll" (3-player), "GondorElves", "RohanNorthDwarves", "Sauron", "Saruman".
  - [ ] Implement turn order logic for 3/4-player games using shared dice pools (see Implementation Guide v2.2, Rules Engine).
- [ ] **Lobby/Matchmaking**
  - [ ] Use a Redis queue to manage lobbies and support team assignments.
- [ ] **Spectator Mode**
  - [ ] Provide a read-only WebSocket feed for spectators.
- [ ] **Chat**
  - [ ] Implement an encrypted WebSocket channel for in-game communication.

---

## 6. Game Modes and Expansions
- [ ] **Game Modes**
  - [ ] Implement Full, Unrestricted, and Companion modes, each with tailored undo/redo support.
- [ ] **Expansions**
  - [ ] Add placeholder JSON configurations for future expansions (e.g., *Lords of Middle-earth*).
- [ ] **Scenarios**
  - [ ] Add placeholder JSON configurations for future scenarios (e.g., "Breaking of the Fellowship").

---

## 7. State Management
- [ ] **Redux Setup**
  - [ ] Configure the Redux store for game state and settings, using generated TypeScript types.
- [ ] **Save/Load**
  - [ ] Implement encrypted game state storage and retrieval in MongoDB.
- [ ] **Undo/Redo**
  - [ ] **Rules Enforced**: Limit to current phase, tracking `committed` in `history`.
  - [ ] **Unrestricted**: Use `redux-undo` for full history access.
- [ ] **Replay**
  - [ ] Enable a system to step through the game’s action history.

---

## 8. AI System
- [ ] **Plugin System**
  - [ ] Define an AI strategy interface, ensuring awareness of `playableBy` restrictions.
- [ ] **Implement AI**
  - [ ] Develop a "Random" AI strategy and create a stub for advanced strategies like "Queller".
- [ ] **Test AI**
  - [ ] Create a `/game/test` endpoint to validate AI behavior, including undo/redo and multiplayer interactions.

---

## 9. Frontend Setup
- [ ] **Initialize React**
  - [ ] Set up React with Redux and `react-i18next`, using generated TypeScript types.
- [ ] **Build UI Components**
  - [ ] Create an SVG map of the game board.
  - [ ] Develop components like `ActionDiceArea` (showing shared pools) and `SiegeArea` (displaying siege status and unit limits).

---

## 10. Asset Preparation
- [ ] **Prepare Assets**
  - [ ] Source or create SVG assets for the map, icons, and card images, including i18n placeholders.

---

## 11. Interactivity
- [ ] **Backend Integration**
  - [ ] Connect the frontend to the API and WebSocket, supporting `undo`, `redo`, and other events.
- [ ] **Frontend Logic**
  - [ ] Add interactivity for moves, card plays, undo/redo, animations, `playableBy` restrictions, and siege stacking visuals.

---

## 12. Testing
- [ ] **Backend Tests**
  - [ ] Use Jest to test:
    - Rules engine (shared dice pools, siege stacking, `playableBy` validation).
    - Undo/redo functionality.
    - Initial army setup against `initial_army_setup.json` (units, leaders, control, Fellowship in Rivendell).
    - Static region data against `regions.json` (names, nation codes).
    - Validation of `initial_army_setup.json` region IDs against `regions.json`.
- [ ] **Frontend Tests**
  - [ ] Test Redux, undo/redo, i18n, multiplayer UI, shared dice pools, and siege stacking visuals.
- [ ] **Playtesting**
  - [ ] Simulate full games with 3/4 players, testing undo/redo in both modes, siege stacking, and character abilities.

---

## 13. Optional Enhancements
- [ ] **Visuals and Audio**
  - [ ] Add animations and audio cues for an enhanced experience.
- [ ] **Achievements**
  - [ ] Implement a Redux-based system to track player achievements.
- [ ] **Help System**
  - [ ] Develop a `/help/card/:id` endpoint with i18n support for card details.

---

## Milestones
1. **M1: Core Game** (3 months): Complete tasks 1-3, 7, and 9.
2. **M2: Multiplayer** (2 months): Complete tasks 4-5 and refine task 3.
3. **M3: AI and Companion Mode** (2 months): Complete task 8 and refine tasks 3 and 9.
4. **M4: Full Release** (2 months): Complete tasks 10-13.

---

## Constraints
- No local file I/O; all communication must use HTTPS.
- Initial language support: English, Spanish, French, German, and Italian.

---

This TODO list provides a clear, step-by-step roadmap for developing the War of the Ring Web App, ensuring all requirements are met and the process is structured and manageable. Each task builds upon the previous one, guiding the development from initial setup to a fully functional game with multiplayer, AI, and robust testing. Let me know if you need further details or adjustments!