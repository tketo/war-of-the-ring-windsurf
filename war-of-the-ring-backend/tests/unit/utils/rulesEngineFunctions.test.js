/**
 * Simple tests for specific rules engine functions
 */
const rulesEngine = require('../../../utils/rulesEngine');

describe('Rules Engine Functions', () => {
  test('getValidActionsForDie should return valid actions for character die', () => {
    const actions = rulesEngine.getValidActionsForDie('character', 'Free', {});
    expect(Array.isArray(actions)).toBe(true);
  });

  test('drawHuntTile should return a hunt tile', () => {
    const mockGameState = {
      board: {
        huntPool: {
          tiles: ['reveal_0', 'damage_1', 'eye_0'],
          count: 3
        }
      }
    };
    const tile = rulesEngine.drawHuntTile(mockGameState);
    expect(typeof tile).toBe('string');
    expect(mockGameState.board.huntPool.count).toBe(2);
  });

  test('activateNationUnits should handle empty gameState', () => {
    const gameState = {
      board: {
        regions: new Map(),
        politicalTrack: new Map([
          ['3', { position: 'passive', active: false }]
        ])
      }
    };
    
    // Mock the necessary methods
    gameState.addToHistory = jest.fn();
    
    const result = rulesEngine.activateNationUnits(gameState, '3');
    expect(result).toBe(gameState);
    expect(gameState.board.politicalTrack.get('3').active).toBe(true);
  });
});
