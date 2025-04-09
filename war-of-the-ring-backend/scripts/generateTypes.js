/**
 * Script to generate TypeScript types from Mongoose schemas
 * Uses Quicktype to convert JSON schema to TypeScript
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const GameState = require('../models/gameState');

// Directory to save generated types
const outputDir = path.join(__dirname, '../../war-of-the-ring-frontend/src/types');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create a sample game state object
const sampleGameState = {
  gameId: 'sample-game-123',
  players: [
    { playerId: 'player1', faction: 'freePeoples', role: 'gondor', isActive: true },
    { playerId: 'player2', faction: 'shadow', role: 'mordor', isActive: true }
  ],
  currentPhase: 'setup',
  currentTurn: 1,
  currentPlayer: 'player1',
  actionDice: {
    freePeoples: ['character', 'army', 'muster'],
    shadow: ['character', 'army', 'muster', 'event']
  },
  characters: [
    { characterId: 'frodo', location: 'shire', status: 'active', modifiers: [] },
    { characterId: 'gandalf', location: 'rivendell', status: 'active', modifiers: ['leader'] }
  ],
  regions: [
    {
      regionId: 'gondor',
      controlledBy: 'freePeoples',
      units: [
        { type: 'regular', count: 3, faction: 'freePeoples' },
        { type: 'elite', count: 1, faction: 'freePeoples' }
      ]
    },
    {
      regionId: 'mordor',
      controlledBy: 'shadow',
      units: [
        { type: 'regular', count: 5, faction: 'shadow' },
        { type: 'elite', count: 2, faction: 'shadow' }
      ]
    }
  ],
  cards: {
    eventDeck: ['card1', 'card2', 'card3'],
    eventDiscard: [],
    combatDeck: ['combat1', 'combat2'],
    combatDiscard: [],
    playerHands: new Map([
      ['player1', ['hand1', 'hand2']],
      ['player2', ['hand3', 'hand4']]
    ])
  },
  history: [
    {
      state: {},
      action: { type: 'setup', player: 'player1' },
      player: 'player1',
      committed: true,
      timestamp: Date.now()
    }
  ],
  settings: {
    mode: 'full',
    expansions: [],
    scenario: 'standard'
  }
};

// Convert Map to object for JSON serialization
const prepareForJson = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  }));
};

// Save sample game state as JSON
const sampleGameStateJson = JSON.stringify(prepareForJson(sampleGameState), null, 2);
const sampleFilePath = path.join(outputDir, 'sampleGameState.json');
fs.writeFileSync(sampleFilePath, sampleGameStateJson);

console.log(`Sample game state saved to ${sampleFilePath}`);

// Generate TypeScript types using Quicktype
const generateTypes = () => {
  const command = `npx quicktype ${sampleFilePath} -o ${path.join(outputDir, 'gameState.ts')} --lang typescript --just-types --acronym-style original`;
  
  console.log(`Executing: ${command}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating types: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`Quicktype stderr: ${stderr}`);
    }
    
    console.log(`TypeScript types generated successfully: ${stdout}`);
    console.log(`Types saved to ${path.join(outputDir, 'gameState.ts')}`);
  });
};

// Run the type generation
generateTypes();

// Generate additional types for other models
// This could be expanded to include other models as needed
