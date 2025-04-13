project_folder/
├── data/                # Contains JSON data files
│   ├── eventcards.json  # Definitions for event cards
│   ├── combatcards.json # Definitions for combat cards associated with events
│   ├── characters.json  # Definitions for characters with playableBy attribute for multiplayer
│   ├── regions.json     # Definitions for static region data (names, nation codes)
│   └── initial_army_setup.json # Definitions for starting units, leaders, and control
├── docs/                # Contains documentation files
│   ├── Product Requirements Document (PRD).md          # Product Requirements Document v1.3
│   ├── War of the Ring Rules Guide.md                  # Game rules and mechanics v1.4
│   ├── War of the Ring Implementation TODO.md          # List of tasks and pending work v1.8
│   └── War of the Ring Implementation Guide.md         # Implementation details and notes v2.2
├── war-of-the-ring-backend/  # Backend Node.js application
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Utility functions including rules engine
│   ├── middleware/      # Express middleware
│   ├── ai/              # AI strategy implementations
│   ├── tests/           # Unit and integration tests
│   └── server.js        # Main server file
├── war-of-the-ring-frontend/ # Frontend React application
│   ├── src/             # Source code
│   │   ├── components/  # React components
│   │   ├── redux/       # Redux state management
│   │   ├── i18n/        # Internationalization
│   │   └── types/       # TypeScript type definitions
│   └── index.html       # Main HTML file
└── README.md            # Project overview

## Project Overview
War of the Ring is a multiplayer online board game that enforces the rules of *War of the Ring, 2nd Edition*. The project supports 1-4 players, with state saving, undo/redo, replay, and detailed combat/siege mechanics.

## Technology Stack
- **Backend**: Node.js (v18+), Express, MongoDB, Redis, Socket.io
- **Frontend**: React, JSX, Tailwind CSS, Redux Toolkit, React-i18next
- **Security**: HTTPS, AES-256 encryption, Clerk authentication
- **Development**: Jest for testing, Quicktype for schema sharing

## Folder Details

### `data/`
This folder contains the JSON files that define the game's core elements:
- **`eventcards.json`**: Defines the 96 event cards, including their properties and any links to combat cards.
- **`combatcards.json`**: Defines the 62 combat cards, which are associated with events.
- **`characters.json`**: Contains 13 character definitions with attributes including `playableBy` for multiplayer role restrictions.
- **`regions.json`**: Defines the static region data including names, nation codes, and adjacency relationships.
- **`initial_army_setup.json`**: Defines the starting units, leaders, control, and siege status for each region, separate from the static region data for better modularity.

### `docs/`
This folder contains markdown files with essential documentation:
- **`Product Requirements Document (PRD).md` (v1.3)**: Outlines the project's goals, features, and requirements.
- **`War of the Ring Rules Guide.md` (v1.4)**: Details the game rules and mechanics, including 3/4-player rules.
- **`War of the Ring Implementation TODO.md` (v1.8)**: Lists tasks and pending work, updated for AI automation, undo/redo, schema sharing, and multiplayer.
- **`War of the Ring Implementation Guide.md` (v2.2)**: Provides technical implementation details, including game state schema, rules engine, and multiplayer support.

### `war-of-the-ring-backend/`
The Node.js backend application:
- **Models**: MongoDB schemas for game state, including history tracking with committed status.
- **Routes**: API endpoints for game actions, player management, and lobby functionality.
- **Utils**: Includes the rules engine with move validation and character playability checks.
- **AI**: Plugin system for AI strategies with different difficulty levels.
- **Tests**: Unit and integration tests for rules engine, API endpoints, and multiplayer functionality.

### `war-of-the-ring-frontend/`
The React frontend application:
- **Components**: UI elements for the game board, dice, cards, and player information.
- **Redux**: State management with support for undo/redo and action replay.
- **i18n**: Internationalization support for multiple languages.
- **Types**: TypeScript definitions generated from backend schemas using Quicktype.

## Key Features

### Multiplayer Support (1-4 Players)
- **Player Roles**: 
  - 3-Player: "FreeAll" (single Free player), two Shadow players
  - 4-Player: Two Free players ("GondorElves", "RohanNorthDwarves"), two Shadow players ("Sauron", "Saruman")
- **Character Restrictions**: Characters have `playableBy` attribute determining which roles can use them
- **Turn Order**: Specific turn order rules for 3/4-player games

### Game Modes
- **Full**: Standard game with rules enforcement
- **Unrestricted**: Flexible mode for custom scenarios
- **Companion**: Simplified mode for learning

### State Management
- **Undo/Redo**: 
  - Rules Enforced: Limited to current phase before commit
  - Unrestricted: Full history access
- **Save/Load**: Encrypted state storage in MongoDB
- **Replay**: Action replay system for reviewing games

### AI System
- **Plugin Architecture**: Modular AI strategies
- **Difficulty Levels**: From "Random" to advanced strategies

## Development Priorities
1. **Core Game** (M1): Basic game functionality, rules engine
2. **Multiplayer** (M2): WebSocket integration, lobby system
3. **AI/Companion** (M3): AI strategies, companion mode
4. **Full Release** (M4): Polishing, additional features

## Code Review Guidelines
- Clarity
- Efficiency
- Simplicity
- Consistency
- Organization
- Maintainability
- Best practices adherence