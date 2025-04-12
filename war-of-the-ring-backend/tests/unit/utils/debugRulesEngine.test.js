/**
 * Debug tests for the Rules Engine
 */
const rulesEngine = require('../../../utils/rulesEngine');

// Create a simplified mock game state
const mockGameState = {
  players: [
    { playerId: 'player1', team: 'Free', role: 'GondorElves', isActive: true },
    { playerId: 'player2', team: 'Shadow', role: 'Sauron', isActive: true }
  ],
  actionDice: {
    free: [
      { type: 'character', selected: false },
      { type: 'army', selected: false },
      { type: 'muster', selected: false },
      { type: 'will', selected: false }
    ],
    shadow: [
      { type: 'character', selected: false },
      { type: 'army', selected: false },
      { type: 'muster', selected: false },
      { type: 'event', selected: false },
      { type: 'eye', selected: false },
      { type: 'eye', selected: false },
      { type: 'eye', selected: false }
    ]
  }
};

describe('Debug Rules Engine', () => {
  test('validateActionDie should reject unavailable die', () => {
    const move = { 
      type: 'useActionDie', 
      player: 'player1', 
      team: 'Free',
      dieIndex: 10, // Out of bounds
      action: 'moveCharacter' 
    };
    
    console.log('Testing validateActionDie with:', JSON.stringify(move));
    console.log('Game state actionDice:', JSON.stringify(mockGameState.actionDice));
    
    const result = rulesEngine.validateActionDie(mockGameState, move);
    
    console.log('Result:', JSON.stringify(result));
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid die index');
  });
});
