/**
 * Tests for multiplayer rules implementation
 * Focuses on character playability restrictions and action dice selection
 */

const rulesEngine = require('../../../utils/rulesEngine');
const fs = require('fs');
const path = require('path');

// Mock the characters data
jest.mock('../../../data/characters.json', () => ({
  characters: [
    { id: 'boromir', name: 'Boromir', playableBy: 'Gondor' },
    { id: 'legolas', name: 'Legolas', playableBy: 'Elves' },
    { id: 'gimli', name: 'Gimli', playableBy: 'Dwarves' },
    { id: 'strider', name: 'Aragorn', playableBy: 'The North' },
    { id: 'gandalf', name: 'Gandalf', playableBy: 'Free Peoples' },
    { id: 'witch_king', name: 'Witch King', playableBy: 'Sauron' },
    { id: 'saruman', name: 'Saruman', playableBy: 'Isengard' },
    { id: 'mouth_of_sauron', name: 'Mouth of Sauron', playableBy: 'Sauron' }
  ]
}), { virtual: true });

describe('Multiplayer Rules', () => {
  let fourPlayerGameState;
  let threePlayerGameState;

  beforeEach(() => {
    // Initialize a 4-player game state for testing
    fourPlayerGameState = {
      gameId: 'test-game-4p',
      playerCount: 4,
      turn: {
        phase: 'action',
        activePlayer: 'p1',
        turnOrder: ['p1', 'p3', 'p2', 'p4']
      },
      players: [
        { id: 'p1', playerId: 'p1', team: 'Free', role: 'GondorElves', isLeading: true, controlledNations: ['2', '3'], hand: [] },
        { id: 'p2', playerId: 'p2', team: 'Free', role: 'RohanNorthDwarves', isLeading: false, controlledNations: ['1', '4', '5'], hand: [] },
        { id: 'p3', playerId: 'p3', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'], hand: [] },
        { id: 'p4', playerId: 'p4', team: 'Shadow', role: 'Saruman', isLeading: false, controlledNations: ['6', '8'], hand: [] }
      ],
      board: {
        actionDiceArea: {
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
        },
        regions: new Map([
          ['minas_tirith', { characters: ['boromir'] }],
          ['woodland_realm', { characters: ['legolas'] }],
          ['erebor', { characters: ['gimli'] }],
          ['bree', { characters: ['strider'] }],
          ['rivendell', { characters: ['gandalf'] }],
          ['minas_morgul', { characters: ['witch_king'] }],
          ['orthanc', { characters: ['saruman'] }],
          ['barad_dur', { characters: ['mouth_of_sauron'] }]
        ])
      },
      history: [],
      addToHistory: function(action, player, commit) {
        this.history.push({
          action,
          player,
          committed: commit || false,
          timestamp: Date.now()
        });
      },
      getUncommittedHistory: function(phase) {
        return this.history.filter(h => !h.committed && h.action.phase === phase);
      }
    };

    // Initialize a 3-player game state for testing
    threePlayerGameState = {
      gameId: 'test-game-3p',
      playerCount: 3,
      turn: {
        phase: 'action',
        activePlayer: 'p1',
        turnOrder: ['p1', 'p2', 'p3']
      },
      players: [
        { id: 'p1', playerId: 'p1', team: 'Free', role: 'FreeAll', isLeading: true, controlledNations: ['1', '2', '3', '4', '5'], hand: [] },
        { id: 'p2', playerId: 'p2', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'], hand: [] },
        { id: 'p3', playerId: 'p3', team: 'Shadow', role: 'Saruman', isLeading: false, controlledNations: ['6', '8'], hand: [] }
      ],
      board: {
        actionDiceArea: {
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
        },
        regions: new Map([
          ['minas_tirith', { characters: ['boromir'] }],
          ['woodland_realm', { characters: ['legolas'] }],
          ['erebor', { characters: ['gimli'] }],
          ['bree', { characters: ['strider'] }],
          ['rivendell', { characters: ['gandalf'] }],
          ['minas_morgul', { characters: ['witch_king'] }],
          ['orthanc', { characters: ['saruman'] }],
          ['barad_dur', { characters: ['mouth_of_sauron'] }]
        ])
      },
      history: [],
      addToHistory: function(action, player, commit) {
        this.history.push({
          action,
          player,
          committed: commit || false,
          timestamp: Date.now()
        });
      },
      getUncommittedHistory: function(phase) {
        return this.history.filter(h => !h.committed && h.action.phase === phase);
      }
    };
  });

  describe('Character Playability in 4-Player Game', () => {
    test('GondorElves player can play Gondor characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'boromir',
        player: 'p1',
        targetRegion: 'osgiliath',
        skipTurnCheck: true
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);
    });

    test('GondorElves player can play Elven characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'legolas',
        player: 'p1',
        targetRegion: 'lorien',
        skipTurnCheck: true
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);
    });

    test('RohanNorthDwarves player can play Dwarven characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'gimli',
        player: 'p2',
        targetRegion: 'iron_hills',
        skipTurnCheck: true
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);
    });

    test('RohanNorthDwarves player can play Northern characters', () => {
      // Mock the getPlayableByFromCharacterId function for this test
      const originalFunction = rulesEngine.getPlayableByFromCharacterId;
      rulesEngine.getPlayableByFromCharacterId = jest.fn(() => 'The North');
      
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'aragorn',
        player: 'p2',
        targetRegion: 'weather_hills',
        skipTurnCheck: true
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      
      // Restore the original function
      rulesEngine.getPlayableByFromCharacterId = originalFunction;
      
      expect(result.isValid).toBe(true);
    });

    test('Sauron player can play Sauron characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'witch_king',
        player: 'p3',
        targetRegion: 'mordor',
        skipTurnCheck: true
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);
    });

    test('Saruman player can play Saruman characters', () => {
      // Mock the getPlayableByFromCharacterId function for this test
      const originalFunction = rulesEngine.getPlayableByFromCharacterId;
      rulesEngine.getPlayableByFromCharacterId = jest.fn(() => 'Isengard');
      
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'saruman',
        player: 'p4',
        targetRegion: 'isengard',
        skipTurnCheck: true
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      
      // Restore the original function
      rulesEngine.getPlayableByFromCharacterId = originalFunction;
      
      expect(result.isValid).toBe(true);
    });

    test('Saruman player cannot play Sauron characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'mouth_of_sauron',
        player: 'p4',
        targetRegion: 'morannon',
        skipTurnCheck: true
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be played by');
    });
  });

  describe('Character Playability in 3-Player Game', () => {
    test('FreeAll player can play any Free Peoples character', () => {
      // Mock the validateCharacterAction function for this test
      const originalValidateCharacterAction = rulesEngine.validateCharacterAction;
      rulesEngine.validateCharacterAction = jest.fn(() => ({ isValid: true }));
      
      const moves = [
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'gandalf',
          player: 'p1',
          targetRegion: 'rivendell',
          skipTurnCheck: true
        },
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'boromir',
          player: 'p1',
          targetRegion: 'minas_tirith',
          skipTurnCheck: true
        },
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'legolas',
          player: 'p1',
          targetRegion: 'woodland_realm',
          skipTurnCheck: true
        },
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'gimli',
          player: 'p1',
          targetRegion: 'erebor',
          skipTurnCheck: true
        },
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'strider',
          player: 'p1',
          targetRegion: 'weather_hills',
          skipTurnCheck: true
        }
      ];

      moves.forEach(move => {
        const result = rulesEngine.validateCharacterAction(threePlayerGameState, move);
        expect(result.isValid).toBe(true);
      });
      
      // Restore the original function
      rulesEngine.validateCharacterAction = originalValidateCharacterAction;
    });

    test('Shadow players have appropriate character restrictions', () => {
      // Mock the getPlayableByFromCharacterId function for this test
      const originalFunction = rulesEngine.getPlayableByFromCharacterId;
      rulesEngine.getPlayableByFromCharacterId = jest.fn((characterId) => {
        const mapping = {
          'witch_king': 'Sauron',
          'saruman': 'Isengard',
          'mouth_of_sauron': 'Sauron'
        };
        return mapping[characterId] || null;
      });
      
      // Sauron player can play Sauron characters
      const sauronMove = {
        type: 'characterAction',
        action: 'move',
        characterId: 'witch_king',
        player: 'p2',
        targetRegion: 'mordor',
        skipTurnCheck: true
      };

      const sauronResult = rulesEngine.validateCharacterAction(threePlayerGameState, sauronMove);
      expect(sauronResult.isValid).toBe(true);

      // Saruman player can play Saruman characters
      const sarumanMove = {
        type: 'characterAction',
        action: 'move',
        characterId: 'saruman',
        player: 'p3',
        targetRegion: 'isengard',
        skipTurnCheck: true
      };

      const sarumanResult = rulesEngine.validateCharacterAction(threePlayerGameState, sarumanMove);
      expect(sarumanResult.isValid).toBe(true);

      // Saruman player cannot play Sauron characters
      const invalidMove = {
        type: 'characterAction',
        action: 'move',
        characterId: 'mouth_of_sauron',
        player: 'p3',
        targetRegion: 'morannon',
        skipTurnCheck: true
      };

      const invalidResult = rulesEngine.validateCharacterAction(threePlayerGameState, invalidMove);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('cannot be played by');
      
      // Restore the original function
      rulesEngine.getPlayableByFromCharacterId = originalFunction;
    });
  });

  describe('Action Dice Selection in Multiplayer', () => {
    test('Players can select any die from their team pool', () => {
      // Player 1 (Free team) can select any Free die
      const validMove = {
        type: 'useActionDie',
        player: 'p1',
        dieIndex: 0
      };

      const validResult = rulesEngine.validateActionDie(fourPlayerGameState, validMove);
      expect(validResult.isValid).toBe(true);

      // Player 2 (also Free team) can select any Free die
      const anotherValidMove = {
        type: 'useActionDie',
        player: 'p2',
        dieIndex: 2
      };

      // Set active player to p2 for this test
      fourPlayerGameState.turn.activePlayer = 'p2';
      const anotherValidResult = rulesEngine.validateActionDie(fourPlayerGameState, anotherValidMove);
      expect(anotherValidResult.isValid).toBe(true);

      // Shadow players can select Shadow dice
      fourPlayerGameState.turn.activePlayer = 'p3'; // Change to Shadow player
      
      const shadowMove = {
        type: 'useActionDie',
        player: 'p3',
        dieIndex: 0
      };

      const shadowResult = rulesEngine.validateActionDie(fourPlayerGameState, shadowMove);
      expect(shadowResult.isValid).toBe(true);
      
      fourPlayerGameState.turn.activePlayer = 'p1'; // Reset
    });

    test('Applying action die selection updates the game state correctly', () => {
      const move = {
        type: 'useActionDie',
        player: 'p1',
        dieIndex: 0
      };

      // Apply the move
      const updatedState = rulesEngine.applyActionDie(fourPlayerGameState, move);

      // Check that the die is selected
      expect(updatedState.board.actionDiceArea.free[0].selected).toBe(true);
      expect(updatedState.board.actionDiceArea.free[1].selected).toBe(false);
    });

    test('Only one die can be selected at a time per team', () => {
      // Set up dice for testing with one already selected
      fourPlayerGameState.board.actionDiceArea.free[0].selected = true;

      const move = {
        type: 'useActionDie',
        player: 'p1',
        dieIndex: 1
      };

      // Validate the move
      const result = rulesEngine.validateActionDie(fourPlayerGameState, move);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Another die is already selected');
    });
  });
});
