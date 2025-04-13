/**
 * Tests for action dice selection in multiplayer games
 */

const rulesEngine = require('../../../utils/rulesEngine');

describe('Action Dice Selection in Multiplayer Games', () => {
  let gameState;

  beforeEach(() => {
    // Initialize a game state for testing
    gameState = {
      gameId: 'test-game',
      playerCount: 4,
      players: [
        { playerId: 'p1', team: 'Free', role: 'GondorElves' },
        { playerId: 'p2', team: 'Free', role: 'RohanNorthDwarves' },
        { playerId: 'p3', team: 'Shadow', role: 'Sauron' },
        { playerId: 'p4', team: 'Shadow', role: 'Saruman' }
      ],
      currentPhase: 'action',
      currentPlayer: 'p1',
      actionDice: {
        free: [
          { type: 'Character', selected: false },
          { type: 'Muster', selected: false },
          { type: 'Army', selected: false },
          { type: 'Will', selected: false }
        ],
        shadow: [
          { type: 'Character', selected: false },
          { type: 'Muster', selected: false },
          { type: 'Army', selected: false },
          { type: 'Eye', selected: false },
          { type: 'Eye', selected: false },
          { type: 'Eye', selected: false },
          { type: 'Event', selected: false }
        ]
      }
    };
  });

  describe('Dice Selection Validation', () => {
    test('Players can select any die from their team pool', () => {
      // Player 1 (Free team) can select any Free die
      const validMove = {
        type: 'useActionDie', 
        player: 'p1', 
        dieIndex: 0
      };

      const validResult = rulesEngine.validateActionDie(gameState, validMove);
      expect(validResult.isValid).toBe(true);

      // Player 1 (Free team) can select another Free die
      const anotherValidMove = {
        type: 'useActionDie', 
        player: 'p1', 
        dieIndex: 2
      };

      const anotherValidResult = rulesEngine.validateActionDie(gameState, anotherValidMove);
      expect(anotherValidResult.isValid).toBe(true);

      // Shadow player can select Shadow dice
      gameState.currentPlayer = 'p3'; // Change to Shadow player
      
      const shadowMove = {
        type: 'useActionDie', 
        player: 'p3', 
        dieIndex: 0
      };

      const shadowResult = rulesEngine.validateActionDie(gameState, shadowMove);
      expect(shadowResult.isValid).toBe(true);
      
      gameState.currentPlayer = 'p1'; // Reset
    });

    test('Player cannot select a die with invalid index', () => {
      const invalidMove = {
        type: 'useActionDie', 
        player: 'p1', 
        dieIndex: 10 // Out of bounds
      };

      const result = rulesEngine.validateActionDie(gameState, invalidMove);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid die index');
    });

    test('Only one die can be selected at a time per team', () => {
      // Set up dice for testing with one already selected
      gameState.actionDice.free[0].selected = true;

      const move = {
        type: 'useActionDie', 
        player: 'p1', 
        dieIndex: 1
      };

      // Validate the move
      const result = rulesEngine.validateActionDie(gameState, move);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Another die is already selected');
    });
  });

  describe('Dice Selection Application', () => {
    test('Applying action die selection updates the game state correctly', () => {
      const move = {
        type: 'useActionDie', 
        player: 'p1', 
        dieIndex: 0
      };

      // Apply the move
      const updatedState = rulesEngine.applyActionDie(gameState, move);

      // Check that the die is selected
      expect(updatedState.actionDice.free[0].selected).toBe(true);
      expect(updatedState.actionDice.free[1].selected).toBe(false);
    });

    test('Selecting a new die deselects previously selected dice for the same team', () => {
      // Set up dice for testing with one already selected
      gameState.actionDice.free[0].selected = true;
      
      // Apply a move to select a different die
      const move = {
        type: 'useActionDie', 
        player: 'p1', 
        dieIndex: 1
      };

      // Apply the move (this should work even though validation would fail)
      const updatedState = rulesEngine.applyActionDie(gameState, move);

      // Check that the new die is selected and the old one is deselected
      expect(updatedState.actionDice.free[0].selected).toBe(false);
      expect(updatedState.actionDice.free[1].selected).toBe(true);
    });

    test('Players from different teams can each have a selected die', () => {
      // Apply a move for Free team player to select a die
      const freeMove = {
        type: 'useActionDie', 
        player: 'p1', 
        dieIndex: 0
      };

      // Apply the Free team move
      const updatedState1 = rulesEngine.applyActionDie(gameState, freeMove);
      
      // Change current player to Shadow team
      updatedState1.currentPlayer = 'p3';
      
      // Apply a move for Shadow team player to select a die
      const shadowMove = {
        type: 'useActionDie', 
        player: 'p3', 
        dieIndex: 0
      };
      
      // Apply the Shadow team move
      const updatedState2 = rulesEngine.applyActionDie(updatedState1, shadowMove);

      // Check that both teams have a selected die
      expect(updatedState2.actionDice.free[0].selected).toBe(true);
      expect(updatedState2.actionDice.shadow[0].selected).toBe(true);
    });
  });
});
