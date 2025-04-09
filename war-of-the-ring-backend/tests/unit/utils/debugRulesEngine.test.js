/**
 * Debug tests for the Rules Engine
 */
const rulesEngine = require('../../../utils/rulesEngine');

// Create a simplified mock game state
const mockGameState = {
  players: [
    { playerId: 'player1', faction: 'freePeoples', role: 'player', isActive: true },
    { playerId: 'player2', faction: 'shadow', role: 'player', isActive: true }
  ],
  actionDice: {
    freePeoples: ['character', 'army', 'muster', 'event', 'will'],
    shadow: ['character', 'army', 'muster', 'event', 'eye']
  }
};

describe('Debug Rules Engine', () => {
  test('validateActionDie should reject unavailable die', () => {
    const move = { 
      type: 'useActionDie', 
      player: 'player1', 
      faction: 'freePeoples',
      dieType: 'unavailableDie', 
      action: 'moveCharacter' 
    };
    
    console.log('Testing validateActionDie with:', JSON.stringify(move));
    console.log('Game state actionDice:', JSON.stringify(mockGameState.actionDice));
    
    const result = rulesEngine.validateActionDie(mockGameState, move);
    
    console.log('Result:', JSON.stringify(result));
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('No unavailableDie die available');
  });
});
