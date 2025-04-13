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
      players: [
        { playerId: 'p1', team: 'Free', role: 'GondorElves', isLeading: true, controlledNations: ['2', '3'] },
        { playerId: 'p2', team: 'Free', role: 'RohanNorthDwarves', isLeading: false, controlledNations: ['1', '4', '5'] },
        { playerId: 'p3', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'] },
        { playerId: 'p4', team: 'Shadow', role: 'Saruman', isLeading: false, controlledNations: ['6', '8'] }
      ],
      currentPhase: 'action',
      currentPlayer: 'p1',
      turnOrder: ['p1', 'p3', 'p2', 'p4'],
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
      },
      characters: [
        { characterId: 'boromir', location: 'minas_tirith', status: 'active' },
        { characterId: 'legolas', location: 'woodland_realm', status: 'active' },
        { characterId: 'gimli', location: 'erebor', status: 'active' },
        { characterId: 'strider', location: 'bree', status: 'active' },
        { characterId: 'gandalf', location: 'rivendell', status: 'active' },
        { characterId: 'witch_king', location: 'minas_morgul', status: 'active' },
        { characterId: 'saruman', location: 'orthanc', status: 'active' },
        { characterId: 'mouth_of_sauron', location: 'barad_dur', status: 'active' }
      ]
    };

    // Initialize a 3-player game state for testing
    threePlayerGameState = {
      gameId: 'test-game-3p',
      playerCount: 3,
      players: [
        { playerId: 'p1', team: 'Free', role: 'FreeAll', isLeading: true, controlledNations: ['1', '2', '3', '4', '5'] },
        { playerId: 'p2', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'] },
        { playerId: 'p3', team: 'Shadow', role: 'Saruman', isLeading: false, controlledNations: ['6', '8'] }
      ],
      currentPhase: 'action',
      currentPlayer: 'p1',
      turnOrder: ['p1', 'p2', 'p3'],
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
      },
      characters: [
        { characterId: 'boromir', location: 'minas_tirith', status: 'active' },
        { characterId: 'legolas', location: 'woodland_realm', status: 'active' },
        { characterId: 'gimli', location: 'erebor', status: 'active' },
        { characterId: 'strider', location: 'bree', status: 'active' },
        { characterId: 'gandalf', location: 'rivendell', status: 'active' },
        { characterId: 'witch_king', location: 'minas_morgul', status: 'active' },
        { characterId: 'saruman', location: 'orthanc', status: 'active' },
        { characterId: 'mouth_of_sauron', location: 'barad_dur', status: 'active' }
      ]
    };
  });

  describe('Character Playability in 4-Player Game', () => {
    test('GondorElves player can play Gondor characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'boromir',
        player: 'p1',
        targetRegion: 'osgiliath'
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
        targetRegion: 'lorien'
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
        targetRegion: 'iron_hills'
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);
    });

    test('RohanNorthDwarves player can play Northern characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'strider',
        player: 'p2',
        targetRegion: 'weather_hills'
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);
    });

    test('Sauron player can play Sauron characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'witch_king',
        player: 'p3',
        targetRegion: 'mordor'
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);
    });

    test('Saruman player can play Isengard characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'saruman',
        player: 'p4',
        targetRegion: 'isengard'
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);
    });

    test('Saruman player cannot play Sauron characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'mouth_of_sauron',
        player: 'p4',
        targetRegion: 'morannon'
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be played by');
    });
  });

  describe('Character Playability in 3-Player Game', () => {
    test('FreeAll player can play any Free Peoples character', () => {
      const moves = [
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'boromir',
          player: 'p1',
          targetRegion: 'osgiliath'
        },
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'legolas',
          player: 'p1',
          targetRegion: 'lorien'
        },
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'gimli',
          player: 'p1',
          targetRegion: 'iron_hills'
        },
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'strider',
          player: 'p1',
          targetRegion: 'weather_hills'
        }
      ];

      moves.forEach(move => {
        const result = rulesEngine.validateCharacterAction(threePlayerGameState, move);
        expect(result.isValid).toBe(true);
      });
    });

    test('Shadow players have appropriate character restrictions', () => {
      // Sauron player can play Sauron characters
      const sauronMove = {
        type: 'characterAction',
        action: 'move',
        characterId: 'witch_king',
        player: 'p2',
        targetRegion: 'mordor'
      };

      const sauronResult = rulesEngine.validateCharacterAction(threePlayerGameState, sauronMove);
      expect(sauronResult.isValid).toBe(true);

      // Saruman player can play Isengard characters
      const isengardMove = {
        type: 'characterAction',
        action: 'move',
        characterId: 'saruman',
        player: 'p3',
        targetRegion: 'isengard'
      };

      const isengardResult = rulesEngine.validateCharacterAction(threePlayerGameState, isengardMove);
      expect(isengardResult.isValid).toBe(true);

      // Saruman player cannot play Sauron characters
      const invalidMove = {
        type: 'characterAction',
        action: 'move',
        characterId: 'mouth_of_sauron',
        player: 'p3',
        targetRegion: 'morannon'
      };

      const invalidResult = rulesEngine.validateCharacterAction(threePlayerGameState, invalidMove);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('cannot be played by');
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

      const anotherValidResult = rulesEngine.validateActionDie(fourPlayerGameState, anotherValidMove);
      expect(anotherValidResult.isValid).toBe(true);

      // Shadow players can select Shadow dice
      fourPlayerGameState.currentPlayer = 'p3'; // Change to Shadow player
      
      const shadowMove = {
        type: 'useActionDie',
        player: 'p3',
        dieIndex: 0
      };

      const shadowResult = rulesEngine.validateActionDie(fourPlayerGameState, shadowMove);
      expect(shadowResult.isValid).toBe(true);
      
      fourPlayerGameState.currentPlayer = 'p1'; // Reset
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
      expect(updatedState.actionDice.free[0].selected).toBe(true);
      expect(updatedState.actionDice.free[1].selected).toBe(false);
    });

    test('Only one die can be selected at a time per team', () => {
      // Set up dice for testing with one already selected
      fourPlayerGameState.actionDice.free[0].selected = true;

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
