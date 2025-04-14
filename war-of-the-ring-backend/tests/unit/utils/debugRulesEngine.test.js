/**
 * Debug tests for the Rules Engine
 */
const rulesEngine = require('../../../utils/rulesEngine');

// Create a simplified mock game state
const mockGameState = {
  gameId: 'test-game',
  turn: {
    phase: 'action',
    activePlayer: 'player1',
    turnOrder: ['player1', 'player2']
  },
  players: [
    { id: 'player1', playerId: 'player1', team: 'Free', role: 'GondorElves', isLeading: true, hand: [] },
    { id: 'player2', playerId: 'player2', team: 'Shadow', role: 'Sauron', isLeading: true, hand: [] }
  ],
  board: {
    actionDiceArea: {
      free: [
        { type: 'Character', selected: false },
        { type: 'Army', selected: false },
        { type: 'Muster', selected: false },
        { type: 'Will', selected: false }
      ],
      shadow: [
        { type: 'Character', selected: false },
        { type: 'Army', selected: false },
        { type: 'Muster', selected: false },
        { type: 'Event', selected: false },
        { type: 'Eye', selected: false },
        { type: 'Eye', selected: false },
        { type: 'Eye', selected: false }
      ]
    }
  },
  addToHistory: function(action, player, commit) {
    // Mock function for testing
  }
};

describe('Debug Rules Engine', () => {
  test('validateActionDie should reject unavailable die', () => {
    const move = { 
      type: 'useActionDie', 
      player: 'player1', 
      dieIndex: 10, // Out of bounds
      action: 'moveCharacter' 
    };
    
    console.log('Testing validateActionDie with:', JSON.stringify(move));
    console.log('Game state actionDiceArea:', JSON.stringify(mockGameState.board.actionDiceArea));
    
    const result = rulesEngine.validateActionDie(mockGameState, move);
    
    console.log('Result:', JSON.stringify(result));
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid die index');
  });
});
