# Project Overview

This project is a game or simulation that utilizes event cards, combat cards, characters, and regions. The core data and documentation are organized into two main folders: `data` and `docs`. This README provides a guide to the project structure and key files.

## Project Structure

```
project_folder/
├── data/                # Contains JSON data files
│   ├── eventcards.json  # Definitions for event cards
│   ├── combatcards.json # Definitions for combat cards associated with events
│   ├── characters.json  # Definitions for characters
│   └── regions.json     # Definitions for regions
├── docs/                # Contains documentation files
│   ├── Product Requirements Document (PRD).md          # Product Requirements Document
│   ├── War of the Ring Rules Guide.md                  # Game rules and mechanics
│   ├── War of the Ring Implementation TODO.md          # List of tasks and pending work
│   └── War of the Ring Implementation Guide.md         # Implementation details and notes
└── README.md            # This file
```

## Folder Details

### `data/`
This folder contains the JSON files that define the game’s core elements:
- **`eventcards.json`**: Defines the event cards, including their properties and any links to combat cards. Refer to this file for event-related data structures.
- **`combatcards.json`**: Defines the combat cards, which are associated with events. Use this file to understand combat mechanics tied to events.
- **`characters.json`**: Contains character definitions, such as attributes, roles, or stats. Check this for character-specific data.
- **`regions.json`**: Defines the regions in the game, including their properties or relationships. Use this for spatial or regional logic.

### `docs/`
This folder contains markdown files with essential documentation:
- **`Product Requirements Document (PRD).md`**: The Product Requirements Document outlines the project’s goals, features, and requirements. Refer to this for high-level guidance.
- **`War of the Ring Rules Guide.md`**: Details the game rules and mechanics. Consult this for how events, combat, characters, and regions interact.
- **`War of the Ring Implementation TODO.md`**: Lists tasks and pending work. Check this for what still needs to be implemented or refined.
- **`War of the Ring Implementation Guide.md`**: Provides technical notes on how the project is being built. Look here for coding details or existing implementation decisions.

## Usage
To generate code or work on this project:
1. Start with `docs/Product Requirements Document (PRD).md` to understand the project’s purpose and requirements.
2. Review `docs/War of the Ring Rules Guide.md` for the game mechanics and how the data files are intended to be used.
3. Load data from the `data/` folder (e.g., `eventcards.json`, `combatcards.json`, etc.) as needed.
4. Check `docs/War of the Ring Implementation Guide.md` for existing technical details or patterns.
5. Refer to `docs/War of the Ring Implementation TODO.md` to prioritize tasks or identify gaps.

## Notes for AI Code Generation
- Use the JSON files in `data/` as the source of truth for event cards, combat cards, characters, and regions.
- Cross-reference `docs/War of the Ring Rules Guide.md` to ensure generated code aligns with game mechanics.
- If specific implementation details are needed, consult `docs/War of the Ring Implementation Guide.md` first.