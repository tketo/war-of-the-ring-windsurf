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
    // Set up a basic 3-player game state for testing
    threePlayerGameState = {
      gameId: 'test-game-3p',
      playerCount: 3,
      turn: {
        phase: 'action',
        activePlayer: 'p1',
        turnOrder: ['p1', 'p2', 'p3']
      },
      players: [
        { id: 'p1', team: 'Free', role: 'FreeAll', isLeading: true, controlledNations: ['1', '2', '3', '4', '5'] },
        { id: 'p2', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'] },
        { id: 'p3', team: 'Shadow', role: 'Saruman', isLeading: false, controlledNations: ['6', '8'] }
      ],
      board: {
        regions: new Map([
          ['rivendell', { characters: ['gandalf_grey'] }],
          ['minas_tirith', { characters: ['boromir'] }],
          ['woodland_realm', { characters: ['legolas'] }],
          ['erebor', { characters: ['gimli'] }],
          ['bree', { characters: ['aragorn'] }],
          ['minas_morgul', { characters: ['witch_king'] }],
          ['orthanc', { characters: ['saruman'] }],
          ['barad_dur', { characters: ['mouth_of_sauron'] }]
        ]),
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
        }
      }
    };

    // Set up a basic 4-player game state for testing
    fourPlayerGameState = {
      gameId: 'test-game-4p',
      playerCount: 4,
      turn: {
        phase: 'action',
        activePlayer: 'p1',
        turnOrder: ['p1', 'p3', 'p2', 'p4']
      },
      players: [
        { id: 'p1', team: 'Free', role: 'GondorElves', isLeading: true, controlledNations: ['2', '3'] },
        { id: 'p2', team: 'Free', role: 'RohanNorthDwarves', isLeading: false, controlledNations: ['1', '4', '5'] },
        { id: 'p3', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'] },
        { id: 'p4', team: 'Shadow', role: 'Saruman', isLeading: false, controlledNations: ['6', '8'] }
      ],
      board: {
        regions: new Map([
          ['rivendell', { characters: ['gandalf_grey'] }],
          ['minas_tirith', { characters: ['boromir'] }],
          ['woodland_realm', { characters: ['legolas'] }],
          ['erebor', { characters: ['gimli'] }],
          ['bree', { characters: ['aragorn'] }],
          ['minas_morgul', { characters: ['witch_king'] }],
          ['orthanc', { characters: ['saruman'] }],
          ['barad_dur', { characters: ['mouth_of_sauron'] }]
        ]),
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
        }
      }
    };
  });

  describe('4-Player Game Character Restrictions', () => {
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

    test('GondorElves player cannot play Dwarven characters', () => {
      const move = {
        type: 'characterAction',
        action: 'move',
        characterId: 'gimli',
        player: 'p1',
        targetRegion: 'iron_hills',
        skipTurnCheck: true
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
        targetRegion: 'mordor',
        skipTurnCheck: true
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
        targetRegion: 'morannon',
        skipTurnCheck: true
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
        targetRegion: 'rivendell',
        skipTurnCheck: true
      };

      const result = rulesEngine.validateCharacterAction(fourPlayerGameState, move);
      expect(result.isValid).toBe(true);

      const move2 = {
        type: 'characterAction',
        action: 'move',
        characterId: 'gandalf_grey',
        player: 'p2',
        targetRegion: 'rivendell',
        skipTurnCheck: true
      };

      const result2 = rulesEngine.validateCharacterAction(fourPlayerGameState, move2);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('3-Player Game Character Restrictions', () => {
    test('FreeAll player can play any Free Peoples character', () => {
      // Mock the getPlayableByFromCharacterId function for this test
      const originalFunction = rulesEngine.getPlayableByFromCharacterId;
      
      // Create a mapping for the test
      const characterMappings = {
        'gandalf_grey': 'Free Peoples',
        'boromir': 'Gondor',
        'legolas': 'Elves',
        'gimli': 'Dwarves',
        'aragorn': 'The North'
      };
      
      rulesEngine.getPlayableByFromCharacterId = jest.fn((characterId) => {
        return characterMappings[characterId] || 'Unknown';
      });
      
      const moves = [
        {
          type: 'characterAction',
          action: 'move',
          characterId: 'gandalf_grey',
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
          characterId: 'aragorn',
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
      rulesEngine.getPlayableByFromCharacterId = originalFunction;
    });

    test('Shadow players have appropriate character restrictions', () => {
      // Mock the getPlayableByFromCharacterId function for this test
      const originalFunction = rulesEngine.getPlayableByFromCharacterId;
      
      // Create a mapping for the test
      const characterMappings = {
        'witch_king': 'Sauron',
        'saruman': 'Saruman',
        'mouth_of_sauron': 'Sauron'
      };
      
      rulesEngine.getPlayableByFromCharacterId = jest.fn((characterId) => {
        return characterMappings[characterId] || null;
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
});
