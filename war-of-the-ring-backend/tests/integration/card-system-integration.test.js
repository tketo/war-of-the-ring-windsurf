/**
 * Integration Tests for Card System with Condition Evaluator
 * 
 * These tests verify that the card system correctly integrates with the condition evaluator
 * to enforce game rules for card playability and effects.
 */

const cardPlayabilityChecker = require('../../utils/cardPlayabilityChecker');
const { evaluateCondition } = require('../../utils/conditionEvaluator');

// Create a realistic game state for testing
const createGameState = () => ({
  turnState: {
    round: 3,
    phase: 'Action',
    activeTeam: 'Free',
    step: 'character',
    selectedDie: { type: 'character' }, // Selected die for the current action
    actionDice: {
      Free: [
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
          title: 'Gandalf the White', 
          playabilityConditions: [
            { 
              condition: { path: 'turnState.activeTeam', $eq: 'Free' },
              failureMessage: 'Can only be played during the Free Peoples turn'
            }
          ]
        },
        { 
          id: 'card2', 
          type: 'character', 
          title: 'Aragorn', 
          playabilityConditions: [
            {
              condition: { path: 'turnState.selectedDie.type', $eq: 'character' },
              failureMessage: 'Requires a character die'
            }
          ]
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
          combatTypes: ['all'],
          playabilityConditions: [
            {
              condition: { 
                $and: [
                  { path: 'combatState.active', $eq: true },
                  { path: 'combatState.currentPlayer', $eq: '$playerId' }
                ]
              },
              failureMessage: 'Can only be played during your combat turn'
            }
          ]
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

describe('Card System Integration', () => {
  let gameState;
  
  beforeEach(() => {
    gameState = createGameState();
    console.log('Game state initialized for test');
  });
  
  describe('Card Playability with Condition Evaluator', () => {
    test('correctly identifies playable cards based on game state conditions', () => {
      console.log('Starting test: correctly identifies playable cards based on game state conditions');
      const card = gameState.players[0].hand[0]; // Gandalf the White
      const context = {
        playerId: 'player1',
        team: 'Free'
      };
      
      console.log('Card:', card.title);
      console.log('Card condition:', JSON.stringify(card.playabilityConditions[0].condition));
      console.log('Game state activeTeam:', gameState.turnState.activeTeam);
      
      // Check if card is playable
      const result = cardPlayabilityChecker.checkCardPlayability(gameState, card, context);
      console.log('Result:', result);
      
      // Verify result
      expect(result.isPlayable).toBe(true);
      expect(result.reasons).toHaveLength(0);
      
      // Change game state to make card unplayable
      gameState.turnState.activeTeam = 'Shadow';
      console.log('Updated game state activeTeam:', gameState.turnState.activeTeam);
      
      // Check again with updated state
      const updatedResult = cardPlayabilityChecker.checkCardPlayability(gameState, card, context);
      console.log('Updated result:', updatedResult);
      
      // Verify updated result
      expect(updatedResult.isPlayable).toBe(false);
      expect(updatedResult.reasons).toHaveLength(1);
      expect(updatedResult.reasons[0]).toBe('Can only be played during the Free Peoples turn');
    });
    
    test('integrates with combat state for combat cards', () => {
      console.log('Starting test: integrates with combat state for combat cards');
      const card = gameState.players[1].hand[0]; // Orcish Ferocity
      const context = {
        playerId: 'player2',
        team: 'Shadow'
      };
      
      console.log('Card:', card.title);
      console.log('Card condition:', JSON.stringify(card.playabilityConditions[0].condition));
      console.log('Initial combat state:', gameState.combatState);
      
      // Initially not playable - no active combat
      const initialResult = cardPlayabilityChecker.checkCardPlayability(gameState, card, context);
      console.log('Initial result:', initialResult);
      expect(initialResult.isPlayable).toBe(false);
      
      // Add an active combat with player2 as current player
      gameState.combatState = {
        active: true,
        regionId: 'gondor',
        type: 'field',
        currentPlayer: 'player2'
      };
      console.log('Updated combat state:', gameState.combatState);
      
      // Now should be playable
      const combatResult = cardPlayabilityChecker.checkCardPlayability(gameState, card, context);
      console.log('Combat result:', combatResult);
      expect(combatResult.isPlayable).toBe(true);
      
      // Change current player
      gameState.combatState.currentPlayer = 'player1';
      console.log('Updated combat state with different player:', gameState.combatState);
      
      // Should no longer be playable
      const wrongPlayerResult = cardPlayabilityChecker.checkCardPlayability(gameState, card, context);
      console.log('Wrong player result:', wrongPlayerResult);
      expect(wrongPlayerResult.isPlayable).toBe(false);
    });
  });
  
  describe('Complex Game Scenarios', () => {
    test('handles character placement with region control conditions', () => {
      console.log('Starting test: handles character placement with region control conditions');
      const card = gameState.players[0].hand[1]; // Aragorn character card
      const context = {
        playerId: 'player1',
        team: 'Free'
      };
      
      console.log('Card:', card.title);
      console.log('Card type:', card.type);
      console.log('Gondor control:', gameState.regions.gondor.control);
      console.log('Mordor control:', gameState.regions.mordor.control);
      console.log('Player team:', context.team);
      
      // Check if character can be played in Free-controlled region
      const canPlayInGondor = cardPlayabilityChecker.canPlayCharacterInRegion(
        gameState, card, 'gondor', context
      );
      console.log('Can play in Gondor:', canPlayInGondor);
      expect(canPlayInGondor).toBe(true);
      
      // Check if character can be played in Shadow-controlled region
      const canPlayInMordor = cardPlayabilityChecker.canPlayCharacterInRegion(
        gameState, card, 'mordor', context
      );
      console.log('Can play in Mordor:', canPlayInMordor);
      expect(canPlayInMordor).toBe(false);
    });
    
    test('integrates action dice requirements with card playability', () => {
      console.log('Starting test: integrates action dice requirements with card playability');
      const card = gameState.players[0].hand[1]; // Aragorn (character)
      const context = {
        playerId: 'player1',
        team: 'Free'
      };
      
      console.log('Card:', card.title);
      console.log('Card type:', card.type);
      console.log('Required die type:', cardPlayabilityChecker.getDieTypeForCard(card));
      console.log('Selected die:', JSON.stringify(gameState.turnState.selectedDie));
      
      // Initially has character die selected
      const initialResult = cardPlayabilityChecker.hasEnoughActionDice(
        gameState, card, context
      );
      console.log('Initial result:', initialResult);
      expect(initialResult).toBe(true);
      
      // Change selected die to a non-matching type
      gameState.turnState.selectedDie = { type: 'army' };
      console.log('Updated selected die:', JSON.stringify(gameState.turnState.selectedDie));
      
      // Now should not have enough dice
      const updatedResult = cardPlayabilityChecker.hasEnoughActionDice(
        gameState, card, context
      );
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
  
  describe('Direct Condition Evaluator Tests', () => {
    test('evaluates simple conditions correctly', () => {
      console.log('Starting test: evaluates simple conditions correctly');
      const condition = { path: 'turnState.activeTeam', $eq: 'Free' };
      console.log('Condition:', JSON.stringify(condition));
      console.log('Game state activeTeam:', gameState.turnState.activeTeam);
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.turnState.activeTeam = 'Shadow';
      console.log('Updated game state activeTeam:', gameState.turnState.activeTeam);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates conditions with variable substitution', () => {
      console.log('Starting test: evaluates conditions with variable substitution');
      const condition = { path: 'turnState.activeTeam', $eq: '$playerTeam' };
      const context = { playerTeam: 'Free' };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Context:', JSON.stringify(context));
      console.log('Game state activeTeam:', gameState.turnState.activeTeam);
      
      gameState.turnState.activeTeam = 'Free';
      const result = evaluateCondition(condition, gameState, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.turnState.activeTeam = 'Shadow';
      console.log('Updated game state activeTeam:', gameState.turnState.activeTeam);
      
      const updatedResult = evaluateCondition(condition, gameState, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('evaluates complex logical conditions', () => {
      console.log('Starting test: evaluates complex logical conditions');
      const condition = {
        $and: [
          { path: 'turnState.activeTeam', $eq: 'Free' },
          { path: 'turnState.phase', $eq: 'Action' },
          { 
            $or: [
              { path: 'turnState.step', $eq: 'character' },
              { path: 'turnState.step', $eq: 'army' }
            ]
          }
        ]
      };
      
      console.log('Condition:', JSON.stringify(condition));
      console.log('Game state:', {
        activeTeam: gameState.turnState.activeTeam,
        phase: gameState.turnState.phase,
        step: gameState.turnState.step
      });
      
      const result = evaluateCondition(condition, gameState, {});
      console.log('Result:', result);
      expect(result).toBe(true);
      
      gameState.turnState.step = 'muster';
      console.log('Updated game state step:', gameState.turnState.step);
      
      const updatedResult = evaluateCondition(condition, gameState, {});
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
});
