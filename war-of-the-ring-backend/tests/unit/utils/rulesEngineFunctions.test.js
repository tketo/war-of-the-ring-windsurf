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
    const tile = rulesEngine.drawHuntTile({});
    expect(tile).toHaveProperty('type');
    expect(tile).toHaveProperty('value');
  });

  test('activateNationUnits should handle empty gameState', () => {
    const gameState = {};
    const result = rulesEngine.activateNationUnits(gameState, 'gondor');
    expect(result).toBe(gameState);
  });
});
