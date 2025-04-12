/**
 * Tests for character playability in multiplayer games
 */

// Mock the fs and path modules
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => JSON.stringify({
    characters: [
      {
        id: 'boromir',
        name: 'Boromir',
        playableBy: 'Gondor'
      },
      {
        id: 'legolas',
        name: 'Legolas',
        playableBy: 'Elves'
      },
      {
        id: 'gimli',
        name: 'Gimli',
        playableBy: 'Dwarves'
      },
      {
        id: 'strider',
        name: 'Strider',
        playableBy: 'The North'
      },
      {
        id: 'witch_king',
        name: 'Witch-king',
        playableBy: 'Sauron'
      },
      {
        id: 'saruman',
        name: 'Saruman',
        playableBy: 'Isengard'
      },
      {
        id: 'mouth_of_sauron',
        name: 'Mouth of Sauron',
        playableBy: 'Sauron'
      },
      {
        id: 'gandalf_grey',
        name: 'Gandalf the Grey',
        playableBy: 'Free Peoples'
      }
    ]
  }))
}));

jest.mock('path', () => ({
  join: jest.fn(() => 'mocked/path/to/characters.json')
}));

// Import the module after mocking
const rulesEngine = require('../../../utils/rulesEngine');

describe('Character Playability in Multiplayer Games', () => {
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
        { playerId: 'p4', team: 'Shadow', role: 'IsengardSouthrons', isLeading: false, controlledNations: ['6', '8'] }
      ],
      characters: [
        { characterId: 'boromir', location: 'minas_tirith', status: 'active' },
        { characterId: 'legolas', location: 'woodland_realm', status: 'active' },
        { characterId: 'gimli', location: 'erebor', status: 'active' },
        { characterId: 'strider', location: 'bree', status: 'active' },
        { characterId: 'witch_king', location: 'minas_morgul', status: 'active' },
        { characterId: 'saruman', location: 'orthanc', status: 'active' },
        { characterId: 'mouth_of_sauron', location: 'barad_dur', status: 'active' },
        { characterId: 'gandalf_grey', location: 'rivendell', status: 'active' }
      ]
    };

    // Initialize a 3-player game state for testing
    threePlayerGameState = {
      gameId: 'test-game-3p',
      playerCount: 3,
      players: [
        { playerId: 'p1', team: 'Free', role: 'FreeAll', isLeading: true, controlledNations: ['1', '2', '3', '4', '5'] },
        { playerId: 'p2', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'] },
        { playerId: 'p3', team: 'Shadow', role: 'IsengardSouthrons', isLeading: false, controlledNations: ['6', '8'] }
      ],
      characters: [...fourPlayerGameState.characters]
    };
  });

  describe('4-Player Game Character Restrictions', () => {
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

    test('GondorElves player cannot play Dwarven characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'gimli',
        player: 'p1',
        targetRegion: 'iron_hills'
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be played by');
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

    test('IsengardSouthrons player cannot play Sauron characters', () => {
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

    test('Any Free player can play Free Peoples characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'gandalf_grey',
        player: 'p1',
        targetRegion: 'rivendell'
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);

      const move2 = {
        type: 'characterAction',
        action: 'move',
        characterId: 'gandalf_grey',
        player: 'p2',
        targetRegion: 'rivendell'
      };

      const result2 = rulesEngine.validateCharacterAction(fourPlayerGameState, move2);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('3-Player Game Character Restrictions', () => {
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

      // IsengardSouthrons player can play Isengard characters
      const isengardMove = {
        type: 'characterAction',
        action: 'move',
        characterId: 'saruman',
        player: 'p3',
        targetRegion: 'isengard'
      };

      const isengardResult = rulesEngine.validateCharacterAction(threePlayerGameState, isengardMove);
      expect(isengardResult.isValid).toBe(true);

      // IsengardSouthrons player cannot play Sauron characters
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
});
