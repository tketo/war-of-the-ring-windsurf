/**
 * Advanced AI Testing Script
 * 
 * This script tests AI strategies in various game scenarios
 */

const AIManager = require('../ai/aiManager');
const RandomStrategy = require('../ai/randomStrategy');
const QuellerStrategy = require('../ai/quellerStrategy');
const FellowshipStrategy = require('../ai/fellowshipStrategy');

// Create mock game states for different scenarios
const createEarlyGameState = () => ({
  gameId: 'test-early-game',
  currentPhase: 'action',
  currentPlayer: 'ai_freePeoples',
  skipValidation: true, // Skip validation for testing
  players: [
    { playerId: 'ai_freePeoples', faction: 'freePeoples', role: 'player', isActive: true },
    { playerId: 'ai_shadow', faction: 'shadow', role: 'player', isActive: true }
  ],
  characters: [
    { 
      characterId: 'fellowship', 
      location: 'rivendell', 
      status: 'hidden',
      corruption: 0,
      position: 0
    },
    {
      characterId: 'gandalf',
      type: 'companion',
      location: 'rivendell',
      status: 'active'
    },
    {
      characterId: 'witchKing',
      type: 'nazgul',
      location: 'mordor',
      status: 'active'
    }
  ],
  regions: [
    {
      regionId: 'rivendell',
      controlledBy: 'freePeoples',
      units: [
        { type: 'regular', count: 2, faction: 'freePeoples', nation: 'elves', active: true },
        { type: 'elite', count: 1, faction: 'freePeoples', nation: 'elves', active: true }
      ]
    },
    {
      regionId: 'gondor',
      controlledBy: 'freePeoples',
      units: [
        { type: 'regular', count: 3, faction: 'freePeoples', nation: 'gondor', active: true },
        { type: 'elite', count: 1, faction: 'freePeoples', nation: 'gondor', active: true }
      ]
    },
    {
      regionId: 'mordor',
      controlledBy: 'shadow',
      units: [
        { type: 'regular', count: 4, faction: 'shadow', nation: 'southEast', active: true },
        { type: 'elite', count: 2, faction: 'shadow', nation: 'southEast', active: true }
      ]
    },
    {
      regionId: 'moria',
      controlledBy: 'shadow',
      units: [
        { type: 'regular', count: 2, faction: 'shadow', nation: 'southEast', active: true }
      ]
    }
  ],
  nations: {
    north: { status: 0, active: false },
    rohan: { status: 0, active: false },
    gondor: { status: 0, active: false },
    elves: { status: 2, active: true },
    dwarves: { status: 0, active: false },
    southEast: { status: -2, active: true }
  },
  huntBox: ['eye', 'eye'],
  huntPool: {
    regular: 12,
    eye: 0
  },
  huntHistory: []
});

const createMidGameState = () => ({
  gameId: 'test-mid-game',
  currentPhase: 'action',
  currentPlayer: 'ai_freePeoples',
  skipValidation: true, // Skip validation for testing
  players: [
    { playerId: 'ai_freePeoples', faction: 'freePeoples', role: 'player', isActive: true },
    { playerId: 'ai_shadow', faction: 'shadow', role: 'player', isActive: true }
  ],
  characters: [
    { 
      characterId: 'fellowship', 
      location: 'moria', 
      status: 'revealed',
      corruption: 3,
      position: 4
    },
    {
      characterId: 'gandalf',
      type: 'companion',
      location: 'moria',
      status: 'active'
    },
    {
      characterId: 'witchKing',
      type: 'nazgul',
      location: 'gondor',
      status: 'active'
    }
  ],
  regions: [
    {
      regionId: 'rivendell',
      controlledBy: 'freePeoples',
      units: [
        { type: 'regular', count: 1, faction: 'freePeoples', nation: 'elves', active: true }
      ]
    },
    {
      regionId: 'gondor',
      controlledBy: 'contested',
      units: [
        { type: 'regular', count: 2, faction: 'freePeoples', nation: 'gondor', active: true },
        { type: 'regular', count: 2, faction: 'shadow', nation: 'southEast', active: true },
        { type: 'elite', count: 1, faction: 'shadow', nation: 'southEast', active: true }
      ]
    },
    {
      regionId: 'mordor',
      controlledBy: 'shadow',
      units: [
        { type: 'regular', count: 3, faction: 'shadow', nation: 'southEast', active: true },
        { type: 'elite', count: 1, faction: 'shadow', nation: 'southEast', active: true }
      ]
    },
    {
      regionId: 'moria',
      controlledBy: 'shadow',
      units: [
        { type: 'regular', count: 1, faction: 'shadow', nation: 'southEast', active: true }
      ]
    }
  ],
  nations: {
    north: { status: 0, active: false },
    rohan: { status: 1, active: false },
    gondor: { status: 1, active: false },
    elves: { status: 2, active: true },
    dwarves: { status: 0, active: false },
    southEast: { status: -2, active: true }
  },
  huntBox: ['eye', 'eye', 'eye'],
  huntPool: {
    regular: 9,
    eye: 0
  },
  huntHistory: [
    { type: 'regular', value: 1 },
    { type: 'corruption', value: 2 }
  ]
});

const createLateGameState = () => ({
  gameId: 'test-late-game',
  currentPhase: 'action',
  currentPlayer: 'ai_freePeoples',
  skipValidation: true, // Skip validation for testing
  players: [
    { playerId: 'ai_freePeoples', faction: 'freePeoples', role: 'player', isActive: true },
    { playerId: 'ai_shadow', faction: 'shadow', role: 'player', isActive: true }
  ],
  characters: [
    { 
      characterId: 'fellowship', 
      location: 'mordor', 
      status: 'revealed',
      corruption: 7,
      position: 8
    },
    {
      characterId: 'aragorn',
      type: 'companion',
      location: 'gondor',
      status: 'active'
    },
    {
      characterId: 'witchKing',
      type: 'nazgul',
      location: 'mordor',
      status: 'active'
    }
  ],
  regions: [
    {
      regionId: 'rivendell',
      controlledBy: 'freePeoples',
      units: [
        { type: 'regular', count: 1, faction: 'freePeoples', nation: 'elves', active: true }
      ]
    },
    {
      regionId: 'gondor',
      controlledBy: 'freePeoples',
      units: [
        { type: 'regular', count: 4, faction: 'freePeoples', nation: 'gondor', active: true },
        { type: 'elite', count: 2, faction: 'freePeoples', nation: 'gondor', active: true }
      ]
    },
    {
      regionId: 'mordor',
      controlledBy: 'shadow',
      units: [
        { type: 'regular', count: 5, faction: 'shadow', nation: 'southEast', active: true },
        { type: 'elite', count: 3, faction: 'shadow', nation: 'southEast', active: true }
      ]
    },
    {
      regionId: 'moria',
      controlledBy: 'shadow',
      units: [
        { type: 'regular', count: 2, faction: 'shadow', nation: 'southEast', active: true }
      ]
    }
  ],
  nations: {
    north: { status: 1, active: false },
    rohan: { status: 2, active: true },
    gondor: { status: 2, active: true },
    elves: { status: 2, active: true },
    dwarves: { status: 1, active: false },
    southEast: { status: -2, active: true }
  },
  huntBox: ['eye', 'eye', 'eye', 'eye'],
  huntPool: {
    regular: 5,
    eye: 0
  },
  huntHistory: [
    { type: 'regular', value: 1 },
    { type: 'corruption', value: 2 },
    { type: 'corruption', value: 3 },
    { type: 'regular', value: 1 }
  ]
});

// Mock validateMove function that always returns valid for testing
const validateMove = (gameState, move) => {
  return { isValid: true };
};

// Test a strategy with different game states
const testStrategyWithScenarios = (StrategyClass, strategyName) => {
  console.log(`\n=== Testing ${strategyName} Strategy with Different Scenarios ===`);
  
  const strategy = new StrategyClass();
  
  // Test with early game state
  console.log("\nEarly Game Scenario:");
  const earlyGameState = createEarlyGameState();
  
  console.log("Free Peoples Move:");
  const fpEarlyMove = strategy.determineMove(earlyGameState, 'freePeoples');
  console.log(fpEarlyMove);
  
  console.log("\nShadow Move:");
  const shadowEarlyMove = strategy.determineMove(earlyGameState, 'shadow');
  console.log(shadowEarlyMove);
  
  // Test with mid game state
  console.log("\nMid Game Scenario:");
  const midGameState = createMidGameState();
  
  console.log("Free Peoples Move:");
  const fpMidMove = strategy.determineMove(midGameState, 'freePeoples');
  console.log(fpMidMove);
  
  console.log("\nShadow Move:");
  const shadowMidMove = strategy.determineMove(midGameState, 'shadow');
  console.log(shadowMidMove);
  
  // Test with late game state
  console.log("\nLate Game Scenario:");
  const lateGameState = createLateGameState();
  
  console.log("Free Peoples Move:");
  const fpLateMove = strategy.determineMove(lateGameState, 'freePeoples');
  console.log(fpLateMove);
  
  console.log("\nShadow Move:");
  const shadowLateMove = strategy.determineMove(lateGameState, 'shadow');
  console.log(shadowLateMove);
};

// Test all strategies
console.log("Testing AI Strategies in Different Game Scenarios...\n");

testStrategyWithScenarios(RandomStrategy, "Random");
testStrategyWithScenarios(QuellerStrategy, "Queller");
testStrategyWithScenarios(FellowshipStrategy, "Fellowship Focus");

// Test AI Manager
console.log("\n=== Testing AI Manager with Different Scenarios ===");
const aiManager = require('../ai/aiManager');

console.log("\nEarly Game Scenario:");
const earlyGameState = createEarlyGameState();
const fpAI = aiManager.createAI('test-game', 'freePeoples', 'fellowship');
const shadowAI = aiManager.createAI('test-game', 'shadow', 'queller');

console.log(`Free Peoples AI (${fpAI.name}) Move:`);
const fpMove = fpAI.determineMove(earlyGameState, 'freePeoples');
console.log(fpMove);

console.log(`Shadow AI (${shadowAI.name}) Move:`);
const shadowMove = shadowAI.determineMove(earlyGameState, 'shadow');
console.log(shadowMove);

// Clean up
aiManager.removeAI('test-game', 'freePeoples');
aiManager.removeAI('test-game', 'shadow');
console.log("\nAI instances removed");

console.log("\nTesting complete!");
