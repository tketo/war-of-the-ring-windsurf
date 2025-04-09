/**
 * Test script for AI strategies in War of the Ring
 * 
 * This script tests the different AI strategies against a mock game state
 * to verify their behavior and decision-making.
 */

const RandomStrategy = require('../ai/randomStrategy');
const QuellerStrategy = require('../ai/quellerStrategy');
const FellowshipStrategy = require('../ai/fellowshipStrategy');
const aiManager = require('../ai/aiManager');

// Mock validateMove function to always return valid
const rulesEngine = require('../utils/rulesEngine');
// Make sure validateMove is globally available
global.validateMove = (gameState, move) => ({ isValid: true });
// Also set it on the rulesEngine module
rulesEngine.validateMove = (gameState, move) => ({ isValid: true });

// Create a mock game state for testing
function createMockGameState(faction = 'freePeoples') {
  // Set the current player based on faction
  const currentPlayer = faction === 'freePeoples' ? 'ai_freePeoples' : 'ai_shadow';
  
  // Create a base game state
  const gameState = {
    gameId: 'test-game',
    currentPhase: 'action',
    currentPlayer: currentPlayer,
    players: [
      { playerId: 'ai_freePeoples', faction: 'freePeoples', role: 'ai', isActive: faction === 'freePeoples' },
      { playerId: 'ai_shadow', faction: 'shadow', role: 'ai', isActive: faction === 'shadow' }
    ],
    actionDice: {
      freePeoples: ['character', 'army', 'muster', 'wild', 'will'],
      shadow: ['character', 'army', 'muster', 'event', 'eye']
    },
    fellowship: {
      location: 'rivendell',
      progress: 0,
      corruption: 0,
      status: 'hidden'
    },
    regions: [
      {
        regionId: 'gondor',
        controlledBy: 'freePeoples',
        units: [
          { type: 'regular', count: 2, faction: 'freePeoples' }
        ],
        canMuster: true
      },
      {
        regionId: 'mordor',
        controlledBy: 'shadow',
        units: [
          { type: 'regular', count: 3, faction: 'shadow' }
        ],
        canMuster: true
      },
      {
        regionId: 'rivendell',
        controlledBy: 'freePeoples',
        units: [
          { type: 'regular', count: 1, faction: 'freePeoples' }
        ],
        canMuster: true
      }
    ],
    characters: [
      {
        characterId: 'gandalf',
        faction: 'freePeoples',
        location: 'gondor',
        status: 'active'
      },
      {
        characterId: 'witchKing',
        faction: 'shadow',
        location: 'mordor',
        status: 'active'
      },
      {
        characterId: 'fellowship',
        faction: 'freePeoples',
        location: 'rivendell',
        status: 'hidden',
        progress: 0,
        corruption: 0
      }
    ],
    cards: {
      playerHands: new Map([
        ['ai_freePeoples', [{ id: 'card1', type: 'event' }, { id: 'card2', type: 'combat' }]],
        ['ai_shadow', [{ id: 'card3', type: 'event' }, { id: 'card4', type: 'combat' }]]
      ]),
      eventDiscard: []
    },
    huntPool: {
      regular: 5,
      eye: 2
    },
    huntBox: []
  };
  
  // Disable move validation for testing
  gameState.skipValidation = true;
  
  return gameState;
}

// Test a specific AI strategy
function testStrategy(StrategyClass) {
  console.log(`\n=== ${StrategyClass.name} Strategy ===`);
  
  const strategy = new StrategyClass();
  console.log('Info:', {
    name: strategy.name,
    description: strategy.description,
    difficulty: strategy.difficulty
  });
  
  // Test with Free Peoples faction
  console.log('\nFree Peoples Move:');
  try {
    const freePeoplesState = createMockGameState('freePeoples');
    const possibleFPMoves = strategy.generatePossibleMoves(freePeoplesState, 'freePeoples');
    console.log(`Generated ${possibleFPMoves.length} possible moves for Free Peoples`);
    
    // Debug: Print the first few moves
    if (possibleFPMoves.length > 0) {
      console.log('First few moves:');
      possibleFPMoves.slice(0, 3).forEach((move, i) => {
        console.log(`  [${i}]: ${JSON.stringify(move)}`);
      });
    }
    
    const freePeoplesMove = strategy.determineMove(freePeoplesState, 'freePeoples');
    console.log(freePeoplesMove);
  } catch (error) {
    console.log(`Error with ${strategy.name} Strategy:`, error.message);
  }
  
  // Test with Shadow faction
  console.log('\nShadow Move:');
  try {
    const shadowState = createMockGameState('shadow');
    
    // Debug: Print the raw moves before filtering
    const rawShadowMoves = [];
    
    // Action phase moves
    if (strategy._generateActionMoves) {
      const actionMoves = strategy._generateActionMoves(shadowState, 'shadow');
      rawShadowMoves.push(...actionMoves);
      console.log(`Generated ${actionMoves.length} raw action moves for Shadow`);
    }
    
    // Add pass move
    rawShadowMoves.push({
      type: 'pass',
      faction: 'shadow',
      player: 'ai_shadow',
      phase: shadowState.currentPhase || 'action',
      timestamp: Date.now()
    });
    
    console.log(`Total raw moves: ${rawShadowMoves.length}`);
    
    // Get filtered moves
    const possibleShadowMoves = strategy.generatePossibleMoves(shadowState, 'shadow');
    console.log(`Generated ${possibleShadowMoves.length} possible moves for Shadow after filtering`);
    
    // Debug: Print the first few moves
    if (possibleShadowMoves.length > 0) {
      console.log('First few moves:');
      possibleShadowMoves.slice(0, 3).forEach((move, i) => {
        console.log(`  [${i}]: ${JSON.stringify(move)}`);
      });
    }
    
    const shadowMove = strategy.determineMove(shadowState, 'shadow');
    console.log(shadowMove);
  } catch (error) {
    console.log(`Error with ${strategy.name} Strategy:`, error.message);
  }
}

// Test the AI Manager
function testAIManager() {
  console.log('\n=== AI Manager ===');
  
  console.log('Available Strategies:', Object.keys(aiManager.strategies));
  
  // Test Free Peoples AI
  const fpGameId = 'test-game-fp';
  const fpFaction = 'freePeoples';
  const fpAI = aiManager.createAI(fpGameId, fpFaction, 'fellowship');
  console.log('\nCreated Free Peoples AI:', {
    name: fpAI.name,
    description: fpAI.description,
    difficulty: fpAI.difficulty
  });
  
  const fpMove = aiManager.determineMove(fpGameId, fpFaction, createMockGameState('freePeoples'));
  console.log('Free Peoples AI Move:', fpMove);
  
  // Test Shadow AI
  const shadowGameId = 'test-game-shadow';
  const shadowFaction = 'shadow';
  const shadowAI = aiManager.createAI(shadowGameId, shadowFaction, 'fellowship');
  console.log('\nCreated Shadow AI:', {
    name: shadowAI.name,
    description: shadowAI.description,
    difficulty: shadowAI.difficulty
  });
  
  const shadowState = createMockGameState('shadow');
  const possibleShadowMoves = shadowAI.generatePossibleMoves(shadowState, 'shadow');
  console.log(`Generated ${possibleShadowMoves.length} possible moves for Shadow AI`);
  
  const shadowMove = aiManager.determineMove(shadowGameId, shadowFaction, shadowState);
  console.log('Shadow AI Move:', shadowMove);
  
  // Clean up
  aiManager.removeAI(fpGameId, fpFaction);
  aiManager.removeAI(shadowGameId, shadowFaction);
  console.log('\nAI instances removed');
}

// Main test function
function runTests() {
  console.log('Testing AI Strategies...');
  
  // Test each strategy
  testStrategy(RandomStrategy);
  testStrategy(QuellerStrategy);
  testStrategy(FellowshipStrategy);
  
  // Test the AI Manager
  testAIManager();
}

// Run the tests
runTests();
