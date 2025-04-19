/**
 * Integration Tests for Condition Evaluator
 * 
 * These tests verify that the condition evaluator correctly evaluates
 * different types of conditions in realistic game scenarios.
 */

const { evaluateCondition } = require('../../utils/conditionEvaluator');

// Create a realistic game state for testing
const createGameState = () => ({
  turnState: {
    round: 3,
    phase: 'Action',
    activeTeam: 'Free',
    step: 'character',
    actionDice: {
      Free: [
        { type: 'character', used: false },
        { type: 'army', used: false },
        { type: 'muster', used: true },
        { type: 'event', used: false },
        { type: 'will', used: false }
      ],
      Shadow: [
        { type: 'army', used: false },
        { type: 'muster', used: false },
        { type: 'character', used: true },
        { type: 'army', used: true },
        { type: 'eye', used: false },
        { type: 'eye', used: false },
        { type: 'event', used: true }
      ]
    }
  },
  players: [
    { 
      id: 'player1', 
      team: 'Free',
      hand: [
        { 
          id: 'card1', 
          type: 'strategy', 
          title: 'Gandalf the White'
        },
        { 
          id: 'card2', 
          type: 'character', 
          title: 'Aragorn'
        }
      ]
    },
    { 
      id: 'player2', 
      team: 'Shadow',
      hand: [
        { 
          id: 'card3', 
          type: 'combat', 
          title: 'Orcish Ferocity', 
          combatTypes: ['all']
        }
      ]
    }
  ],
  fellowship: {
    location: 'mordor',
    revealed: false,
    corruption: 6,
    companions: [
      { id: 'frodo', exhausted: false },
      { id: 'sam', exhausted: false },
      { id: 'aragorn', exhausted: false }
    ]
  },
  regions: {
    mordor: {
      armies: {
        Shadow: [{ type: 'regular', count: 5 }],
        Free: []
      },
      control: 'Shadow',
      settlement: 'stronghold'
    },
    gondor: {
      armies: {
        Shadow: [{ type: 'regular', count: 2 }],
        Free: [{ type: 'regular', count: 3 }]
      },
      control: 'Free',
      settlement: 'city'
    }
  },
  combatState: null, // No active combat initially
  log: []
});

describe('Condition Evaluator Integration', () => {
  let gameState;
  
  beforeEach(() => {
    gameState = createGameState();
    console.log('Game state initialized for test');
  });
  
  describe('Comparison Operations', () => {
    test('evaluates equality condition correctly', () => {
      console.log('TEST: evaluates equality condition correctly');
      // Format: { path: 'path.to.value', $eq: value }
      const condition = { path: 'turnState.activeTeam', $eq: 'Free' };
      console.log('Condition:', JSON.stringify(condition));
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.turnState.activeTeam = 'Shadow';
      console.log('Updated activeTeam:', gameState.turnState.activeTeam);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates inequality condition correctly', () => {
      console.log('TEST: evaluates inequality condition correctly');
      const condition = { path: 'turnState.round', $ne: 4 };
      console.log('Condition:', JSON.stringify(condition));
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.turnState.round = 4;
      console.log('Updated round:', gameState.turnState.round);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates greater than condition correctly', () => {
      console.log('TEST: evaluates greater than condition correctly');
      const condition = { path: 'turnState.round', $gt: 2 };
      console.log('Condition:', JSON.stringify(condition));
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.turnState.round = 1;
      console.log('Updated round:', gameState.turnState.round);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
  
  describe('Variable Substitution', () => {
    test('substitutes variables in conditions correctly', () => {
      console.log('TEST: substitutes variables in conditions correctly');
      const condition = { path: 'turnState.activeTeam', $eq: '$playerTeam' };
      const context = { playerTeam: 'Free' };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Context:', JSON.stringify(context));
      
      const result = evaluateCondition(condition, gameState, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      context.playerTeam = 'Shadow';
      console.log('Updated context:', JSON.stringify(context));
      
      const updatedResult = evaluateCondition(condition, gameState, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('substitutes nested variables correctly', () => {
      console.log('TEST: substitutes nested variables correctly');
      // For dynamic property access, we need to use string template literals
      const regionId = 'gondor';
      const path = `regions.${regionId}.control`;
      const condition = { path, $eq: '$playerTeam' };
      
      const context = { playerTeam: 'Free' };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Context:', JSON.stringify(context));
      console.log('Path:', path);
      
      const result = evaluateCondition(condition, gameState, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Test with different region
      const mordorPath = 'regions.mordor.control';
      const mordorCondition = { path: mordorPath, $eq: '$playerTeam' };
      
      console.log('Mordor condition:', JSON.stringify(mordorCondition));
      console.log('Mordor path:', mordorPath);
      
      const updatedResult = evaluateCondition(mordorCondition, gameState, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
  
  describe('Array Operations', () => {
    test('evaluates contains condition correctly', () => {
      console.log('TEST: evaluates contains condition correctly');
      // Format: { $contains: { path: 'path.to.array', value: value } }
      const condition = {
        $contains: {
          path: 'fellowship.companions',
          value: { id: 'frodo' }
        }
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Companions:', JSON.stringify(gameState.fellowship.companions));
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.fellowship.companions = gameState.fellowship.companions.filter(c => c.id !== 'frodo');
      console.log('Updated companions:', JSON.stringify(gameState.fellowship.companions));
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates containsAll condition correctly', () => {
      console.log('TEST: evaluates containsAll condition correctly');
      // Format: { $containsAll: { path: 'path.to.array', values: [value1, value2] } }
      const condition = {
        $containsAll: {
          path: 'fellowship.companions',
          values: [{ id: 'frodo' }, { id: 'sam' }]
        }
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Companions:', JSON.stringify(gameState.fellowship.companions));
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.fellowship.companions = gameState.fellowship.companions.filter(c => c.id !== 'sam');
      console.log('Updated companions:', JSON.stringify(gameState.fellowship.companions));
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates size condition correctly', () => {
      console.log('TEST: evaluates size condition correctly');
      // Format: { path: 'path.to.array', $size: exactValue }
      const condition = {
        path: 'fellowship.companions',
        $size: 3
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Companions length:', gameState.fellowship.companions.length);
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.fellowship.companions.push({ id: 'gandalf', exhausted: false });
      console.log('Updated companions length:', gameState.fellowship.companions.length);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates size comparison correctly', () => {
      console.log('TEST: evaluates size comparison correctly');
      // Format: { path: 'path.to.array', $size: { $gt: value } }
      const condition = {
        path: 'fellowship.companions',
        $size: {
          $gt: 2
        }
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Companions length:', gameState.fellowship.companions.length);
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.fellowship.companions = gameState.fellowship.companions.slice(0, 2);
      console.log('Updated companions length:', gameState.fellowship.companions.length);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
  
  describe('Logical Operations', () => {
    test('evaluates AND condition correctly', () => {
      console.log('TEST: evaluates AND condition correctly');
      // Format: { $and: [condition1, condition2] }
      const condition = {
        $and: [
          { path: 'turnState.activeTeam', $eq: 'Free' },
          { path: 'turnState.phase', $eq: 'Action' }
        ]
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Game state:', {
        activeTeam: gameState.turnState.activeTeam,
        phase: gameState.turnState.phase
      });
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.turnState.phase = 'Movement';
      console.log('Updated phase:', gameState.turnState.phase);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates OR condition correctly', () => {
      console.log('TEST: evaluates OR condition correctly');
      // Format: { $or: [condition1, condition2] }
      const condition = {
        $or: [
          { path: 'turnState.step', $eq: 'character' },
          { path: 'turnState.step', $eq: 'army' }
        ]
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Step:', gameState.turnState.step);
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.turnState.step = 'muster';
      console.log('Updated step:', gameState.turnState.step);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates NOT condition correctly', () => {
      console.log('TEST: evaluates NOT condition correctly');
      // Format: { $not: condition }
      const condition = {
        $not: { path: 'fellowship.revealed', $eq: true }
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Revealed:', gameState.fellowship.revealed);
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.fellowship.revealed = true;
      console.log('Updated revealed:', gameState.fellowship.revealed);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
  
  describe('Complex Game Scenarios', () => {
    test('evaluates complex nested conditions correctly', () => {
      console.log('TEST: evaluates complex nested conditions correctly');
      // Complex nested condition combining multiple operations
      const condition = {
        $and: [
          { path: 'turnState.activeTeam', $eq: 'Free' },
          { path: 'turnState.phase', $eq: 'Action' },
          { 
            $or: [
              { path: 'turnState.step', $eq: 'character' },
              { path: 'turnState.step', $eq: 'army' }
            ]
          },
          {
            $contains: {
              path: 'fellowship.companions',
              value: { id: 'frodo' }
            }
          }
        ]
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Game state:', {
        activeTeam: gameState.turnState.activeTeam,
        phase: gameState.turnState.phase,
        step: gameState.turnState.step,
        companions: gameState.fellowship.companions.map(c => c.id)
      });
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.fellowship.companions = gameState.fellowship.companions.filter(c => c.id !== 'frodo');
      console.log('Updated companions:', gameState.fellowship.companions.map(c => c.id));
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates card playability conditions correctly', () => {
      console.log('TEST: evaluates card playability conditions correctly');
      // Condition to check if a character card can be played
      const condition = {
        $and: [
          // Must be the Free Peoples turn
          { path: 'turnState.activeTeam', $eq: 'Free' },
          // Must have an unused character die
          {
            $contains: {
              path: 'turnState.actionDice.Free',
              value: { type: 'character', used: false }
            }
          },
          // Must be in the character step
          { path: 'turnState.step', $eq: 'character' }
        ]
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Game state:', {
        activeTeam: gameState.turnState.activeTeam,
        step: gameState.turnState.step,
        actionDice: gameState.turnState.actionDice.Free
      });
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Use all character dice
      gameState.turnState.actionDice.Free = gameState.turnState.actionDice.Free.map(die => {
        if (die.type === 'character') {
          return { ...die, used: true };
        }
        return die;
      });
      
      console.log('Updated action dice:', gameState.turnState.actionDice.Free);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates combat card conditions correctly', () => {
      console.log('TEST: evaluates combat card conditions correctly');
      // Add combat state
      gameState.combatState = {
        active: true,
        regionId: 'gondor',
        type: 'field',
        currentPlayer: 'player1'
      };
      
      // Add card to game state
      gameState.card = {
        id: 'card3',
        type: 'combat',
        title: 'Orcish Ferocity',
        combatTypes: ['all', 'field']
      };
      
      const context = {
        playerId: 'player1',
        combatType: 'field'
      };
      
      console.log('Combat state:', JSON.stringify(gameState.combatState));
      console.log('Card:', JSON.stringify(gameState.card));
      console.log('Context:', JSON.stringify(context));
      
      // Condition to check if a combat card can be played
      const condition = {
        $and: [
          // Must be an active combat
          { path: 'combatState.active', $eq: true },
          // Must be the player's turn in combat
          { path: 'combatState.currentPlayer', $eq: '$playerId' },
          // Combat type must be in card's supported types or card supports all types
          { 
            $or: [
              { 
                $contains: {
                  path: 'card.combatTypes',
                  value: 'all'
                }
              },
              { 
                $contains: {
                  path: 'card.combatTypes',
                  value: '$combatType'
                }
              }
            ]
          }
        ]
      };
      
      console.log('Condition:', JSON.stringify(condition));
      
      const result = evaluateCondition(condition, gameState, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Change combat player
      gameState.combatState.currentPlayer = 'player2';
      console.log('Updated combat player:', gameState.combatState.currentPlayer);
      
      const updatedResult = evaluateCondition(condition, gameState, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
});
