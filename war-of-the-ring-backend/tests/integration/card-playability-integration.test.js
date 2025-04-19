/**
 * Integration Tests for Card Playability Checker
 * 
 * These tests verify that the card playability checker correctly integrates
 * with the condition evaluator to determine if cards can be played based on
 * game state conditions.
 */

const { evaluateCondition } = require('../../utils/conditionEvaluator');
const { isCardPlayable, hasEnoughActionDice } = require('../../utils/cardPlayabilityChecker');

// Create a realistic game state for testing
const createGameState = () => ({
  turnState: {
    round: 3,
    phase: 'Action',
    activeTeam: 'Free',
    step: 'character',
    selectedDie: { type: 'character', used: false }, // Currently selected die
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
          title: 'Gandalf the White',
          playConditions: {
            $and: [
              { path: 'turnState.activeTeam', $eq: 'Free' },
              { path: 'turnState.phase', $eq: 'Action' }
            ]
          }
        },
        { 
          id: 'card2', 
          type: 'character', 
          title: 'Aragorn',
          playConditions: {
            $and: [
              { path: 'turnState.activeTeam', $eq: 'Free' },
              { path: 'turnState.step', $eq: 'character' }
            ]
          }
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
          playConditions: {
            $and: [
              { path: 'combatState.active', $eq: true },
              { path: 'combatState.currentPlayer', $eq: '$playerId' }
            ]
          }
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

describe('Card Playability Integration', () => {
  let gameState;
  
  beforeEach(() => {
    gameState = createGameState();
    console.log('Game state initialized for test');
  });
  
  describe('Action Dice Requirements', () => {
    test('correctly checks if selected die matches card type', () => {
      console.log('TEST: correctly checks if selected die matches card type');
      
      // Set the selected die to character type
      gameState.turnState.selectedDie = { type: 'character', used: false };
      
      const characterCard = {
        id: 'card2',
        type: 'character',
        title: 'Aragorn'
      };
      
      const context = {
        playerId: 'player1',
        playerTeam: 'Free'
      };
      
      console.log('Card:', JSON.stringify(characterCard));
      console.log('Context:', JSON.stringify(context));
      console.log('Selected die:', JSON.stringify(gameState.turnState.selectedDie));
      
      // Character card should be playable with character die
      const characterResult = hasEnoughActionDice(gameState, characterCard, context);
      console.log('Character card with character die result:', characterResult);
      expect(characterResult).toBe(true);
      
      // Event card should not be playable with character die
      const eventCard = {
        id: 'event1',
        type: 'event',
        title: 'Unexpected Party'
      };
      
      const eventResult = hasEnoughActionDice(gameState, eventCard, context);
      console.log('Event card with character die result:', eventResult);
      expect(eventResult).toBe(false);
      
      // Change selected die to event type
      gameState.turnState.selectedDie = { type: 'event', used: false };
      console.log('Updated selected die:', JSON.stringify(gameState.turnState.selectedDie));
      
      // Now event card should be playable
      const updatedEventResult = hasEnoughActionDice(gameState, eventCard, context);
      console.log('Event card with event die result:', updatedEventResult);
      expect(updatedEventResult).toBe(true);
      
      // But character card should not be playable with event die
      const updatedCharacterResult = hasEnoughActionDice(gameState, characterCard, context);
      console.log('Character card with event die result:', updatedCharacterResult);
      expect(updatedCharacterResult).toBe(false);
    });
    
    test('correctly handles die type matching for different card types', () => {
      console.log('TEST: correctly handles die type matching for different card types');
      
      // Set the selected die to character type
      gameState.turnState.selectedDie = { type: 'character', used: false };
      
      const card = {
        id: 'card2',
        type: 'character',
        title: 'Aragorn'
      };
      
      const context = {
        playerId: 'player1',
        playerTeam: 'Free'
      };
      
      console.log('Card:', JSON.stringify(card));
      console.log('Context:', JSON.stringify(context));
      console.log('Selected die:', JSON.stringify(gameState.turnState.selectedDie));
      
      // Card should be playable with matching die
      const result = hasEnoughActionDice(gameState, card, context);
      console.log('Result with matching die:', result);
      expect(result).toBe(true);
      
      // Change the die type to non-matching
      gameState.turnState.selectedDie = { type: 'event', used: false };
      console.log('Updated selected die:', JSON.stringify(gameState.turnState.selectedDie));
      
      // Now card should not be playable
      const updatedResult = hasEnoughActionDice(gameState, card, context);
      console.log('Result with non-matching die:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
  
  describe('Card Play Conditions', () => {
    test('correctly evaluates simple play conditions', () => {
      console.log('TEST: correctly evaluates simple play conditions');
      
      // Set appropriate selected die for the card type
      gameState.turnState.selectedDie = { type: 'will', used: false };
      
      const card = gameState.players[0].hand[0]; // Gandalf the White
      const context = {
        playerId: 'player1',
        playerTeam: 'Free'
      };
      
      console.log('Card:', JSON.stringify(card));
      console.log('Play conditions:', JSON.stringify(card.playConditions));
      console.log('Game state:', {
        activeTeam: gameState.turnState.activeTeam,
        phase: gameState.turnState.phase
      });
      
      const result = isCardPlayable(gameState, card, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Change game state to make conditions fail
      gameState.turnState.phase = 'Movement';
      console.log('Updated phase:', gameState.turnState.phase);
      
      const updatedResult = isCardPlayable(gameState, card, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('correctly evaluates step-specific play conditions', () => {
      console.log('TEST: correctly evaluates step-specific play conditions');
      
      // Set appropriate selected die for the card type
      gameState.turnState.selectedDie = { type: 'character', used: false };
      
      const card = gameState.players[0].hand[1]; // Aragorn
      const context = {
        playerId: 'player1',
        playerTeam: 'Free'
      };
      
      console.log('Card:', JSON.stringify(card));
      console.log('Play conditions:', JSON.stringify(card.playConditions));
      console.log('Game state:', {
        activeTeam: gameState.turnState.activeTeam,
        step: gameState.turnState.step
      });
      
      const result = isCardPlayable(gameState, card, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Change game state to make conditions fail
      gameState.turnState.step = 'army';
      console.log('Updated step:', gameState.turnState.step);
      
      const updatedResult = isCardPlayable(gameState, card, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('correctly evaluates combat card play conditions', () => {
      console.log('TEST: correctly evaluates combat card play conditions');
      
      // Add combat state
      gameState.combatState = {
        active: true,
        regionId: 'gondor',
        type: 'field',
        currentPlayer: 'player2'
      };
      
      // Set appropriate selected die for the card type
      gameState.turnState.selectedDie = { type: 'event', used: false };
      gameState.turnState.activeTeam = 'Shadow';
      
      const card = gameState.players[1].hand[0]; // Orcish Ferocity
      const context = {
        playerId: 'player2',
        playerTeam: 'Shadow',
        combatType: 'field'
      };
      
      console.log('Card:', JSON.stringify(card));
      console.log('Play conditions:', JSON.stringify(card.playConditions));
      console.log('Combat state:', JSON.stringify(gameState.combatState));
      
      const result = isCardPlayable(gameState, card, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Change combat player to make conditions fail
      gameState.combatState.currentPlayer = 'player1';
      console.log('Updated combat player:', gameState.combatState.currentPlayer);
      
      const updatedResult = isCardPlayable(gameState, card, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('correctly handles cards without explicit play conditions', () => {
      console.log('TEST: correctly handles cards without explicit play conditions');
      
      // Set appropriate selected die for the card type
      gameState.turnState.selectedDie = { type: 'will', used: false };
      
      const card = {
        id: 'basicCard',
        type: 'strategy',
        title: 'Basic Strategy'
        // No playConditions specified
      };
      
      const context = {
        playerId: 'player1',
        playerTeam: 'Free'
      };
      
      console.log('Card:', JSON.stringify(card));
      console.log('Game state:', {
        activeTeam: gameState.turnState.activeTeam,
        phase: gameState.turnState.phase
      });
      
      // Cards without explicit conditions should be playable if basic requirements are met
      const result = isCardPlayable(gameState, card, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Change active team to make basic requirements fail
      gameState.turnState.activeTeam = 'Shadow';
      console.log('Updated active team:', gameState.turnState.activeTeam);
      
      const updatedResult = isCardPlayable(gameState, card, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
  
  describe('Complex Scenarios', () => {
    test('correctly evaluates complex nested conditions', () => {
      console.log('TEST: correctly evaluates complex nested conditions');
      
      // Set appropriate selected die for the card type
      gameState.turnState.selectedDie = { type: 'will', used: false };
      
      const card = {
        id: 'complexCard',
        type: 'strategy',
        title: 'Complex Strategy',
        playConditions: {
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
        }
      };
      
      const context = {
        playerId: 'player1',
        playerTeam: 'Free'
      };
      
      console.log('Card:', JSON.stringify(card));
      console.log('Play conditions:', JSON.stringify(card.playConditions));
      console.log('Game state:', {
        activeTeam: gameState.turnState.activeTeam,
        phase: gameState.turnState.phase,
        step: gameState.turnState.step,
        companions: gameState.fellowship.companions.map(c => c.id)
      });
      
      const result = isCardPlayable(gameState, card, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Remove Frodo from companions to make conditions fail
      gameState.fellowship.companions = gameState.fellowship.companions.filter(c => c.id !== 'frodo');
      console.log('Updated companions:', gameState.fellowship.companions.map(c => c.id));
      
      const updatedResult = isCardPlayable(gameState, card, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
    
    test('correctly evaluates conditions with variable substitution', () => {
      console.log('TEST: correctly evaluates conditions with variable substitution');
      
      // Set appropriate selected die for the card type
      gameState.turnState.selectedDie = { type: 'will', used: false };
      
      const card = {
        id: 'variableCard',
        type: 'strategy',
        title: 'Variable Strategy',
        playConditions: {
          $and: [
            { path: 'turnState.activeTeam', $eq: '$playerTeam' },
            { 
              $contains: {
                path: 'fellowship.companions',
                value: { id: '$characterId' }
              }
            }
          ]
        }
      };
      
      const context = {
        playerId: 'player1',
        playerTeam: 'Free',
        characterId: 'frodo'
      };
      
      console.log('Card:', JSON.stringify(card));
      console.log('Play conditions:', JSON.stringify(card.playConditions));
      console.log('Context:', JSON.stringify(context));
      console.log('Fellowship companions:', gameState.fellowship.companions.map(c => c.id));
      
      // Make sure Frodo is in the companions
      if (!gameState.fellowship.companions.some(c => c.id === 'frodo')) {
        gameState.fellowship.companions.push({ id: 'frodo', exhausted: false });
      }
      
      const result = isCardPlayable(gameState, card, context);
      console.log('Result:', result);
      expect(result).toBe(true);
      
      // Change context to make conditions fail
      context.characterId = 'gandalf';
      console.log('Updated context:', JSON.stringify(context));
      
      const updatedResult = isCardPlayable(gameState, card, context);
      console.log('Updated result:', updatedResult);
      expect(updatedResult).toBe(false);
    });
  });
});
