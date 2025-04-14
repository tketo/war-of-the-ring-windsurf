Below is the updated **Product Requirements Document (PRD)** for the *War of the Ring Web Application v1.3*, incorporating the specified updates to the **State Management** section to reflect the detailed requirements for Redux and React Hooks. The updates ensure clarity on how Redux manages the global game state with `reduxjs/toolkit` and how React Hooks handle local UI state for component-specific interactions. I’ve integrated these changes into the existing PRD structure, maintaining its high-level focus and ensuring all other sections remain consistent with the original document, including the emphasis on multi-language support via `react-i18next`.

---

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
- **Frontend**: 
  - Built with **React** using **JSX** for dynamic user interfaces and styled with **Tailwind CSS** for efficient, responsive design.
  - Libraries such as React and Redux are hosted via a **CDN** (e.g., `cdn.jsdelivr.net`) to optimize load times and reduce local storage needs.
  - Utilizes `react-i18next` for multi-language support, ensuring all text is localized dynamically.
- **State Management**: 
  - **Redux**: Manages the global game state, including the board, dice, players, action history, and more, utilizing **`reduxjs/toolkit`** to simplify setup and minimize boilerplate code. Global state encompasses all shared game data required for synchronization and persistence, including settings such as language and security tokens.
  - **React Hooks**: Handles local UI state for component-specific interactions, such as dice roll animations or hover effects, using **`useState`** and **`useReducer`** to manage transient, client-side behaviors efficiently.
- **Backend**: 
  - Powered by **Node.js** with **Express** to manage game logic, state persistence, and multiplayer synchronization.
  - Employs **`crypto`** for encryption to secure state and communication.
- **Database**: 
  - **MongoDB** stores game states, player profiles, and multilingual card rules, providing a flexible and scalable solution for data persistence.
- **Communication**: 
  - **WebSocket** enables real-time updates, dispatching Redux actions to ensure all clients remain synchronized with the latest game state.
  - All communication (WebSocket, API) must use **HTTPS** for encryption to protect data integrity.

### 3.2 Frontend Components
- **Board**: 
  - A React component that renders the game map, directly connected to the Redux store to reflect real-time state changes, with localized names via i18n.
- **Dice Roller**: 
  - An animated component managing visual roll effects locally, with final results synchronized to the Redux store after server validation.
- **Card Display**: 
  - Components for deck, hand, and discard piles, driven by Redux state to reflect the current game situation, with text localized via i18n and tooltips managed locally.
- **Player HUD**: 
  - Displays turn information, available actions, and chat functionality, powered by Redux for core data, with local UI toggles (e.g., chat visibility) handled by React Hooks.

### 3.3 Backend Modules
- **Game Engine**: 
  - Validates player moves and updates the game state, dispatching Redux-compatible actions to all connected clients to maintain consistency.
- **Card Database**: 
  - Stores card rules and metadata with multilingual support, queried by the backend to provide updates to the Redux store as needed during gameplay.
- **AI Plugin Loader**: 
  - Loads modular AI strategies, enabling AI opponents to dispatch validated actions to the Redux store, supporting both solo play and testing.
- **State Manager**: 
  - Manages save/load functionality, undo/redo operations, and replay capabilities by leveraging encrypted Redux action logs for state tracking and persistence.

### 3.4 Data Models
- **Redux Store**:
  - A centralized structure capturing the game’s global state, including board configuration, dice results, player details, action history, and settings like language and security tokens.
- **Player Profile**: 
  - Stores user-specific data such as ID, username, statistics, achievements, preferred language, and session tokens for secure authentication.
- **Replay File**: 
  - An encrypted sequential list of actions from the Redux history, enabling playback of game sessions.

### 3.5 State Management Details
- **Redux Usage**:
  - Manages the global game state through actions (e.g., moving armies, changing languages), ensuring tamper-protection via server-side validation.
  - Organizes reducers by domain (e.g., board, players) for modularity, combined into a single store.
  - Supports asynchronous operations (e.g., real-time multiplayer sync) through middleware.
  - Undo/redo functionality:
    - **Rules Enforced Mode**: Limited to the current turn’s phase before actions are committed, tracked securely in the Redux action history with server validation.
    - **Unrestricted Mode**: Provides full access to the game’s history for unlimited undo/redo, using encrypted action logs.
- **Hooks Usage**:
  - Manages local UI state for dynamic, component-specific interactions (e.g., toggling audio, animating dice rolls).
  - Handles transient effects to enhance user experience without affecting the global state.
- **Security**:
  - Employs AES-256 encryption for storing game states in MongoDB and securing WebSocket communications.
  - Assigns UUID session tokens per client, validated server-side to ensure authorized access.
  - Validates all Redux actions server-side to maintain game integrity and prevent unauthorized modifications.
  - Logs suspicious activity to monitor and maintain multiplayer reliability.

---

## 4. Development Plan

### 4.1 Phases
1. **Phase 1: Core Game**
   - Set up Redux with multi-language support and security measures, implement base game rules and UI.
   - Add encrypted save/load and phase-limited undo/redo for rules-enforced mode via Redux.
2. **Phase 2: Multiplayer and Expansions**
   - Integrate encrypted WebSocket with Redux for real-time synchronization.
   - Add modular, multilingual reducers for expansions.
3. **Phase 3: AI and Companion Mode**
   - Develop secure AI plugins dispatching Redux actions.
   - Build companion mode with localized Redux state and Hooks-based UI toggles.
4. **Phase 4: Polish and Features**
   - Enhance graphics and audio, using Hooks for controls and Redux for secure state management.
   - Add player profiles, chat, and replay features with full language and security support, including unlimited undo/redo for unrestricted mode.

### 4.2 Milestones
- **M1**: Secure base game playable with Redux and multi-language support (3 months).
- **M2**: Multiplayer and expansions functional (2 months).
- **M3**: AI and companion mode complete (2 months).
- **M4**: Full release with all features, languages, and security measures (2 months).

---

## 5. Assumptions and Constraints
- **Assumption**: Players select a language at startup and trust server-side validation for secure gameplay.
- **Constraint**: No local file I/O; encrypted state persists in MongoDB via Redux.
- **Constraint**: Browser-only application, initially supporting English, Spanish, French, German, and Italian with lightweight security measures (AES, tokens).

---

## 6. Acceptance Criteria
- The game enforces rules and expansions accurately with a secure, localized UI powered by Redux.
- Multiplayer functionality synchronizes state across clients using encrypted WebSocket and token validation.
- AI plugins dispatch valid, secure Redux actions to support solo and multiplayer scenarios.
- Undo/redo functionality:
  - In Rules Enforced Mode, limited to the current phase before action commitment, seamlessly integrated with encrypted Redux history.
  - In Unrestricted Mode, allows unlimited navigation across the game’s history, adapting to the selected language.
- Replay feature enables stepping through encrypted Redux action history, with UI adapting to the user’s language.
- Companion mode tracks secure state via Redux, with UI toggles managed by Hooks.
- Client data integrity is maintained through encryption, session tokens, and server-side validation.

---

## Key Changes
1. **Multi-Language Support**:
   - Incorporated i18n with `react-i18next` for UI, cards, and rules (Sections 2.1, 2.6).
   - Added language selection stored in Redux settings (Sections 2.6, 3.4).
   - Specified initial languages: English, Spanish, French, German, Italian (Section 2.7).
2. **Security Enhancements**:
   - Integrated AES-256 encryption for state and communication (Sections 2.7, 3.5).
   - Added session tokens in Redux with server-side validation (Sections 2.4, 3.4).
   - Ensured tamper protection for state management and multiplayer synchronization (Sections 2.1, 3.5).
   - Required HTTPS for all communication (Section 3.1).
   - Included managed authentication for player profiles and endpoints (Sections 2.4, 2.6).
   - Specified DDoS protection and monitoring for multiplayer uptime (Section 1.3).
   - Added logging of suspicious activity for multiplayer integrity (Section 2.7).
3. **Undo/Redo Restriction**:
   - Updated Sections 2.1.4 and 3.5 to limit undo/redo in "rules enforced" mode to a player’s turn within a phase before actions commit, while allowing full undo/redo in "unrestricted" mode.
4. **State Management Update**:
   - Enhanced Section 3.1 to specify that Redux uses `reduxjs/toolkit` to manage global state (board, dice, players, action history, etc.), encompassing all shared game data for synchronization and persistence.
   - Clarified that React Hooks handle local UI state for component-specific interactions (e.g., dice roll animations, hover effects) using `useState` and `useReducer`.

---

### Notes on Additions
- **State Management Update**: Modified Section 3.1 ("Architecture") to provide detailed requirements for Redux and React Hooks, ensuring clarity on their roles in managing global and local state, respectively. The update emphasizes `reduxjs/toolkit` for streamlined Redux setup and specifies that Hooks handle dynamic UI interactions, aligning with the app’s performance and usability goals.
- **Preservation of Existing Structure**: All other sections, including multi-language support, security measures, and feature details, remain unchanged to maintain consistency with the original PRD, focusing on high-level requirements without introducing unnecessary changes.
- **Multi-Language Support**: Retained as a core feature, ensuring that UI, cards, and rules are localized via `react-i18next`, supporting the global audience as outlined in Sections 1.3, 1.4, and 2.6.

This updated PRD serves as a comprehensive guide for the development team, ensuring the *War of the Ring Web App* meets all technical and functional requirements while maintaining a clear, high-level focus. Let me know if you need further refinements or additional details!