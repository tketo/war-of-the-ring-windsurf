# Product Requirements Document (PRD): War of the Ring Web Application v1.3

## 1. Overview

### 1.1 Product Name
War of the Ring Web App

### 1.2 Purpose
The War of the Ring Web App is a digital adaptation of the "War of the Ring, 2nd Edition" board game, supporting its expansions ("Lords of Middle-earth," "Warriors of Middle-earth," "Kings of Middle-earth") and additional scenarios (e.g., "Breaking of the Fellowship", "Treebeard"). The app delivers an interactive, secure, and multilingual online multiplayer experience with enforced rules, state persistence, and optional companion app functionality for physical gameplay assistance. It leverages Redux for global state management, React Hooks for local UI state, `react-i18next` for multi-language support, and lightweight security measures to ensure client data integrity. Advanced features include AI opponents, replay functionality, and a modular plugin system for expansions and AI strategies.

### 1.3 Objectives
- Deliver a secure, multilingual online board game experience with real-time multiplayer support.
- Enforce "War of the Ring, 2nd Edition" rules and expansions accurately across languages.
- Provide toggleable "rules enforced" and "unrestricted" modes.
- Support companion app mode for secure, localized physical gameplay assistance.
- Enable extensibility for expansions and scenarios via modular design.
- Include robust, tamper-proof state management with save/load, undo/redo, and replay using Redux.
- Offer a rich, secure user experience with graphics, audio, player profiles, matchmaking, and AI opponents.
- Ensure reliable multiplayer uptime with DDoS protection and monitoring.

### 1.4 Target Audience
- Global fans of "War of the Ring" across multiple languages.
- Tabletop gamers seeking a secure, digital adaptation.
- Players desiring online multiplayer or solo AI experiences.
- Physical game owners needing a multilingual companion app.

---

## 2. Features

### 2.1 Core Game Features
#### 2.1.1 Game Board Representation
- **Visual Map**: Graphical Middle-earth map with regions, strongholds, cities, and settlements, region names localized via i18n.
- **Tracks and Boxes**:
  - Hunt Box: Displays Shadow Action Dice allocated for the Hunt, labels translated.
  - Political Track: Shows nation status (Passive, Active, At War), localized.
  - Victory Track: Tracks Victory Points for Free Peoples (FP) and Shadow Players (SP), text via i18n.
  - Corruption Track: Monitors Ring-bearers’ Corruption (0-12), labels localized.
  - Fellowship Progress Track: Tracks Fellowship movement (Hidden/Revealed), translated.
  - Elven Rings Box: Displays available Elven Rings (3 for FP initially), text via i18n.
  - Guide of the Fellowship Box: Shows current Guide and Companion cards/counters, localized.
  - Mordor Track: Displays Fellowship progress in Mordor, steps and tiles translated.
  - Reserve Boxes: Separate boxes for FP (permanently removed) and SP (returned to reserve) pieces, labels via i18n.
- **Draw Piles**: FP and SP Character and Strategy Event card decks with discard piles visible per rules, card text translated.
- **Hunt Pool**: Virtual "bag" with Standard (beige) and Special (blue/red) Hunt tiles, descriptions localized.

#### 2.1.2 Gameplay Mechanics
- **Turn Structure**: Follows six phases (Recover Action Dice/Draw Event Cards, Fellowship Phase, Hunt Allocation, Action Roll, Action Resolution, Victory Check), phase names and prompts localized.
- **Action Dice**: 
  - FP starts with 4 blue dice, SP with 7 red dice, dice result descriptions translated.
  - Dice added/removed based on character events (e.g., Aragorn, Gandalf the White), tamper-protected.
  - Displays valid actions (e.g., Character, Army, Muster, Event, Will of the West, Eye) in selected language.
- **Movement**:
  - Army movement restricted to adjacent regions, validated server-side for connectivity and stacking limits (max 10 units).
  - Fellowship movement validated by distance (Progress Counter + Guide Level), region connectivity, and stopping conditions, tamper-proof.
  - Nazgûl/Minions move freely, validated server-side.
- **Combat**:
  - Enforces Combat Strength (max 5 dice), Leadership re-rolls (max 5), and hit rules (5+ normally, 6+ for sieges), server-validated.
  - Supports Combat Card play with initiative timing and effects, translated.
- **Fellowship and Hunt**:
  - Tracks Fellowship position (hidden/revealed), resolves Hunt Rolls (max 5 dice, 6+ success), and applies Hunt Damage, feedback localized.
  - Manages Companion separation and Guide changes, tamper-protected.
- **Victory Conditions**:
  - Ring-based: FP wins if Ring destroyed (Crack of Doom, <12 Corruption); SP wins if Corruption ≥ 12, messages translated.
  - Military: SP wins with 10+ VP; FP wins with 4+ VP, validated and localized.

#### 2.1.3 Rules Enforcement
- **Default Mode**: Enforces rules and expansions with errata, violation messages localized and tamper-proof.
- **Unrestricted Mode**: Allows free movement without validation, toggle UI translated.
- **Card Management**: Codifies card rules in backend and Redux with multilingual text for automated enforcement.

#### 2.1.4 State Management
- **Redux Store**: Centralizes global game state (board, dice, players, history, settings including language and security token), tamper-protected.
- **Save/Load**: Persists encrypted state to backend via Redux actions.
- **Undo/Redo**: 
  - **Rules Enforced Mode**: Limited to a player’s turn within a phase (e.g., before Action Resolution commits actions), leveraging secure Redux action history, validated server-side.
  - **Unrestricted Mode**: Unlimited undo/redo across the entire game, using encrypted Redux action history (e.g., `redux-undo`).
- **Replay**: Steps through encrypted actions stored in Redux history.

### 2.2 Expansions and Scenarios
- **Modular Design**: Redux reducers for enabling/disabling expansions, translated content (e.g., `lordsReducer`).
- **Options**:
  - Base Game: "War of the Ring, 2nd Edition."
  - Expansions: "Lords of Middle-earth," "Warriors of Middle-earth," "Kings of Middle-earth."
  - Additional Content: Treebeard, "Breaking of the Fellowship" scenario.
- **Expansion Rules**:
  - **Lords of Middle-earth**: Adds Sméagol, Balrog, Witch-king variants, Keeper/Minion dice, new Event cards, all translated.
  - **Warriors of Middle-earth**: Adds Faction dice, figures, Call to Battle cards, new Event decks, localized.
  - **Kings of Middle-earth**: Adds Sovereigns, Corruption mechanics, Ruler dice, Kings Hunt tiles, text via i18n.
- **Scenarios**: Pre-configured setups (e.g., "Breaking of the Fellowship"), translated and secured.

### 2.3 Companion App Mode
- **Purpose**: Abridged version to assist physical gameplay with secure, multilingual state tracking.
- **Features**:
  - Tracks dice rolls, Hunt Pool, Political Track, Victory Points, Corruption, and Fellowship progress, UI localized.
  - Displays valid actions without enforcement, translated.
  - Omits full board graphics, uses Redux for secure state and Hooks for toggles.

### 2.4 Multiplayer and Player Options
- **Player Configurations**:
  - 1 Player: FP or SP (AI opponent).
  - 2 Players: FP vs. SP.
  - 3 Players: Combo 1 (Shadow, Gondor, Rohan) or Combo 2 (FP, Witch King, Saruman).
  - 4 Players: Gondor, Rohan, Witch King, Saruman.
- **Selection**: Dynamic UI updates for role selection, names localized, token-assigned.
- **Lobby/Matchmaking**: Players join via a lobby with encrypted WebSocket updates synced via Redux, protected by managed authentication (e.g., Clerk) for player identification and public endpoint security.
- **Spectator Mode**: Read-only game view, UI translated.
- **Chat**: In-game text chat, messages localized and encrypted.

### 2.5 AI Implementation
- **Plugin System**: AI strategies (e.g., Queller Bot) as Redux action dispatchers, names translated.
- **Options**: Players select AI at start, supports multiple AI players, actions validated.
- **Behavior**: AI respects rules in "rules enforced" mode, prioritizes objectives, logs localized.

### 2.6 User Interface and Experience
- **Graphics**: High-quality map with animated pieces, labels localized, state tamper-protected.
- **Audio**: Background music and effects, controlled with Hooks (e.g., `useState` for mute), cues translated.
- **Player Profiles**: Tracks stats, achievements, language preferences, secured with tokens and managed authentication (e.g., Clerk) in Redux.
- **Help System**: Multilingual rulebook and tooltips via i18n.
- **Achievements**: Unlockable rewards (e.g., "Destroy the Ring"), translated, earned via Redux actions.
- **Language Selection**: UI toggle for languages (e.g., English, Spanish, French, German, Italian), stored in Redux.

### 2.7 Additional Features
- **Visibility**: Players inspect discard piles, reserves, Hunt Pool per rules, UI localized.
- **Reserves**: Tracks FP (removed) and SP (returned) pieces, labels via i18n.
- **Validation**: Ensures valid moves (e.g., connectivity, siege rules), server-enforced.
- **Security**: AES-256 encryption for state/communication, session tokens, server-side validation, logging of suspicious activity for multiplayer integrity.

---

## 3. Technical Specifications

### 3.1 Architecture
- **Frontend**: React with JSX, Tailwind CSS, `react-i18next` for i18n, hosted via CDN (e.g., `cdn.jsdelivr.net`). All communication (WebSocket, API) must use HTTPS for encryption.
- **State Management**:
  - **Redux**: Manages global game state with `reduxjs/toolkit`, including `settings.language` and `settings.securityToken`.
  - **React Hooks**: Handles local UI state (e.g., animations, toggles) with `useState` and `useReducer`.
- **Backend**: Node.js with Express and `crypto` for encryption, managing game logic and persistence.
- **Database**: MongoDB with encrypted game states and multilingual card rules.
- **Communication**: WebSocket with encrypted payloads and token-based validation.

### 3.2 Frontend Components
- **Board**: Renders map with localized names, connected to Redux, token-verified state.
- **Dice Roller**: Animated with `useState`, results synced to Redux after server validation.
- **Card Display**: Deck/hand/discard with Redux state, text via i18n, tooltips via `useState`.
- **Player HUD**: Displays turn/actions/chat, driven by Redux, localized, Hooks for toggles.

### 3.3 Backend Modules
- **Game Engine**: Validates moves, checks tokens, dispatches Redux actions.
- **Card Database**: Stores multilingual card rules (e.g., `{ en: {}, es: {} }`), queried for Redux.
- **AI Plugin Loader**: Loads AI strategies, dispatches validated actions.
- **State Manager**: Encrypts/decrypts state, manages save/load/undo/redo/replay with token validation.

### 3.4 Data Models
- **Redux Store**:
  ```javascript
  {
    game: {
      board: { regions: { MT: { army: [3, 1, 2] } }, tracks: { political: {}, victory: {} } },
      dice: { FP: [], SP: [] },
      players: { FP: {}, SP: {} },
      fellowship: { position: 'Rivendell', corruption: 0 },
      hunt: { pool: [], box: [] },
      history: [{ type: 'MOVE_ARMY', payload: {} }, ...],
      settings: { language: 'en', securityToken: 'uuid' }
    }
  }
  ```
- **Player Profile**: `{ userId, username, stats, achievements, preferredLanguage, sessionToken }`.
- **Replay File**: Encrypted sequential action list from Redux history.

### 3.5 State Management Details
- **Redux Usage**:
  - Centralized store updated via actions (e.g., `MOVE_ARMY`, `SET_LANGUAGE`), tamper-protected.
  - Reducers split by domain (e.g., `boardReducer`), combined with `combineReducers`.
  - Async actions (e.g., WebSocket sync) via `redux-thunk`.
  - Undo/redo:
    - **Rules Enforced**: Limited to current turn’s phase before commit, tracked in Redux history with server validation.
    - **Unrestricted**: Full history access with `redux-undo` or equivalent, encrypted.
- **Hooks Usage**:
  - Local state (e.g., `const [isMuted, setIsMuted] = useState(false)`).
  - Transient UI effects (e.g., dice animations).
- **Security**:
  - AES-256 encryption for state in MongoDB and WebSocket messages.
  - UUID session tokens assigned per client, validated server-side.
  - Server validates all Redux actions for integrity.

---

## 4. Development Plan

### 4.1 Phases
1. **Phase 1: Core Game**
   - Set up Redux with i18n and security, implement base game rules and UI.
   - Add encrypted save/load and phase-limited undo/redo (rules enforced) via Redux.
2. **Phase 2: Multiplayer and Expansions**
   - Integrate encrypted WebSocket with Redux for sync.
   - Add modular, multilingual reducers for expansions.
3. **Phase 3: AI and Companion Mode**
   - Develop secure AI plugins dispatching Redux actions.
   - Build companion mode with localized Redux state and Hooks UI.
4. **Phase 4: Polish and Features**
   - Enhance graphics/audio (Hooks for controls, Redux for secure state).
   - Add profiles, chat, replay with full language/security support, unlimited undo/redo for unrestricted mode.

### 4.2 Milestones
- **M1**: Secure base game playable with Redux/i18n (3 months).
- **M2**: Multiplayer and expansions functional (2 months).
- **M3**: AI and companion mode complete (2 months).
- **M4**: Full release with all features, languages, and security (2 months).

---

## 5. Assumptions and Constraints
- **Assumption**: Players select a language at startup, trust server validation.
- **Constraint**: No local file I/O; encrypted state persists in MongoDB via Redux.
- **Constraint**: Browser-only, initial languages (English, Spanish, French, German, Italian), lightweight security (AES, tokens).

---

## 6. Acceptance Criteria
- Game enforces rules/expansions with secure, localized UI via Redux.
- Multiplayer syncs state across clients with encrypted WebSocket and token validation.
- AI plugins dispatch valid, secure Redux actions.
- Undo/redo:
  - Rules Enforced: Limited to current phase before commit, works seamlessly with encrypted Redux history.
  - Unrestricted: Unlimited across game, UI adapts to language.
- Replay works with encrypted Redux history, UI adapts to language.
- Companion mode tracks secure state with Redux, toggled via Hooks.
- Client data integrity maintained via encryption, tokens, and server validation.

---

## Key Changes
1. **Multi-Language Support**:
   - Added i18n with `react-i18next` for UI, cards, and rules (2.1, 2.6).
   - Included language selection in Redux settings (2.6, 3.4).
   - Specified initial languages: English, Spanish, French, German, Italian (2.7).
2. **Security Enhancements**:
   - Integrated AES-256 encryption for state and communication (2.7, 3.5).
   - Added session tokens in Redux and server-side validation (2.4, 3.4).
   - Ensured tamper protection for state management and multiplayer sync (2.1, 3.5).
   - Added HTTPS requirement for all communication (3.1).
   - Included managed authentication for player profiles and endpoints (2.4, 2.6).
   - Specified DDoS protection and monitoring for multiplayer uptime (1.3).
   - Added logging of suspicious activity for integrity (2.7).
3. **Undo/Redo Restriction**:
   - Updated 2.1.4 and 3.5 to limit undo/redo in "rules enforced" mode to a player’s turn within a phase before actions commit, while allowing full undo/redo in "unrestricted" mode.

---

### Notes on Additions
- **Undo/Redo Change**: Modified in Section 2.1.4 ("State Management") and 3.5 ("State Management Details") to reflect the new restriction, ensuring rules enforcement aligns with gameplay integrity while unrestricted mode retains flexibility.
- **Use HTTPS exclusively**: Added to Section 3.1 ("Architecture") as a fundamental requirement for all communication, complementing AES encryption.
- **Use managed auth solutions securely**: Integrated into Section 2.4 ("Lobby/Matchmaking") and 2.6 ("Player Profiles") to protect endpoints and enhance token-based security with a service like Clerk.
- **Set up DDoS protection and monitoring**: Added to Section 1.3 ("Objectives") to ensure multiplayer reliability, a high-level goal.
- **Log and monitor suspicious activity**: Included in Section 2.7 ("Additional Features") as a security feature supporting multiplayer integrity, tied to gameplay.

These changes enhance the PRD’s clarity and security posture without altering its core structure, keeping it focused on requirements. Let me know if you’d like further refinements!