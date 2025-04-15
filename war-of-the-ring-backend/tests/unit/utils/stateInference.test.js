/**
 * Tests for the state inference utility functions
 */

const stateInference = require('../../../utils/stateInference');
const gameSetup = require('../../../utils/gameSetup');

// Mock the fs and path modules for gameSetup
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => JSON.stringify([]))
}));

jest.mock('path', () => ({
  join: jest.fn(() => '')
}));

// Helper function to create a deep copy of state with Maps
function deepCopyState(state) {
  const newState = JSON.parse(JSON.stringify(state, (key, value) => {
    if (value instanceof Map) {
      return { __type: 'Map', data: Array.from(value.entries()) };
    }
    return value;
  }));
  
  // Restore Maps
  const restoreMaps = (obj) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        if (obj[key].__type === 'Map') {
          obj[key] = new Map(obj[key].data);
        } else {
          restoreMaps(obj[key]);
        }
      }
    }
    return obj;
  };
  
  return restoreMaps(newState);
}

describe('State Inference Utilities', () => {
  let gameState;

  beforeEach(() => {
    // Create a simple game state for testing
    gameState = {
      gameId: 'test-game',
      players: [
        { id: 'p1', team: 'Free', role: 'FreeAll' },
        { id: 'p2', team: 'Shadow', role: 'Sauron' }
      ],
      board: {
        regions: new Map(),
        actionDiceArea: {
          free: [{ type: 'Character' }, { type: 'Army' }, { type: 'Muster' }, { type: 'Will' }],
          shadow: [{ type: 'Character' }, { type: 'Army' }, { type: 'Muster' }, { type: 'Eye' }, { type: 'Eye' }, { type: 'Eye' }, { type: 'Event' }]
        },
        selectedDiceArea: {
          free: [],
          shadow: []
        },
        usedDiceArea: {
          free: [],
          shadow: []
        },
        huntBox: {
          diceArea: [],
          tile: null
        },
        huntPool: {
          tiles: [{ id: 'reveal_1' }, { id: 'damage_1' }, { id: 'eye_0' }],
          regular: 6,
          eye: 2
        },
        reservedHuntTilesArea: new Map(),
        tableCardsArea: new Map(),
        fellowshipTrack: {
          progress: { value: 0 },
          corruption: 0
        },
        politicalTrack: new Map(),
        fellowshipBox: {
          companions: []
        },
        guideBox: {
          companion: null
        }
      },
      offBoard: {
        free: {
          hand: [],
          discards: [],
          reserves: new Map(),
          graveyard: []
        },
        shadow: {
          hand: [],
          discards: [],
          reserves: new Map(),
          graveyard: []
        },
        playerAreas: new Map()
      }
    };
    
    // Set up a test region
    gameState.board.regions.set('test-region', {
      name: 'Test Region',
      control: 'Free',
      nation: 'test-nation',
      deployments: [],
      characters: [],
      structure: {
        type: 'stronghold',
        category: 'fortification',
        canMuster: true,
        vp: 1
      }
    });
    
    // Set up political track
    gameState.board.politicalTrack.set('3', { position: 0, face: 'passive' }); // Gondor
    gameState.board.politicalTrack.set('7', { position: 3, face: 'active' });  // Sauron
    
    // Set up player areas
    gameState.offBoard.playerAreas.set('p1', { hand: [], reserved: [] });
    gameState.offBoard.playerAreas.set('p2', { hand: [], reserved: [] });
  });

  test('hasSiege should correctly identify siege status', () => {
    const regionId = 'test-region';
    const region = gameState.board.regions.get(regionId);
    
    // Initially no siege
    expect(stateInference.hasSiege(gameState, regionId)).toBe(false);
    
    // Add deployments with siege groups
    region.deployments = [
      {
        group: 'besieged',
        units: {
          regular: 3,
          elite: 1,
          owner: 'p1'
        },
        leaders: 0
      },
      {
        group: 'sieging',
        units: {
          regular: 4,
          elite: 2,
          owner: 'p2'
        },
        leaders: 0
      }
    ];
    
    // Now should detect siege
    expect(stateInference.hasSiege(gameState, regionId)).toBe(true);
    
    // Change one group to normal
    region.deployments[0].group = 'normal';
    
    // Should no longer detect siege
    expect(stateInference.hasSiege(gameState, regionId)).toBe(false);
  });

  test('isFellowshipHidden should correctly identify fellowship visibility', () => {
    // Initially fellowship should be hidden (no hunt tile)
    expect(stateInference.isFellowshipHidden(gameState)).toBe(true);
    
    // Add a hunt tile
    gameState.board.huntBox.tile = 'reveal_1';
    
    // Fellowship should now be visible
    expect(stateInference.isFellowshipHidden(gameState)).toBe(false);
    
    // Remove hunt tile
    gameState.board.huntBox.tile = null;
    
    // Fellowship should be hidden again
    expect(stateInference.isFellowshipHidden(gameState)).toBe(true);
  });

  test('isAtWar should correctly identify political status', () => {
    // Get a nation that starts passive
    const passiveNationId = '3'; // Gondor
    
    // Initially should not be at war
    expect(stateInference.isAtWar(gameState, passiveNationId)).toBe(false);
    
    // Change to active
    gameState.board.politicalTrack.get(passiveNationId).face = 'active';
    
    // Should now be at war
    expect(stateInference.isAtWar(gameState, passiveNationId)).toBe(true);
    
    // Get a nation that starts active
    const activeNationId = '7'; // Sauron
    
    // Should be at war
    expect(stateInference.isAtWar(gameState, activeNationId)).toBe(true);
  });

  test('initiateSiege should update deployment groups', () => {
    const regionId = 'test-region';
    const region = gameState.board.regions.get(regionId);
    
    // Add deployments with normal groups
    region.deployments = [
      {
        group: 'normal',
        units: {
          regular: 3,
          elite: 1,
          owner: 'p1'
        },
        leaders: 0
      },
      {
        group: 'normal',
        units: {
          regular: 4,
          elite: 2,
          owner: 'p2'
        },
        leaders: 0
      }
    ];
    
    // Initialize reserves
    gameState.offBoard.free.reserves.set('test-nation', { regular: 0, elite: 0 });
    
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Initiate siege
    const updatedState = stateInference.initiateSiege(stateCopy, regionId);
    
    // Check that groups were updated
    const updatedRegion = updatedState.board.regions.get(regionId);
    const freeDeployment = updatedRegion.deployments.find(d => d.units.owner === 'p1');
    const shadowDeployment = updatedRegion.deployments.find(d => d.units.owner === 'p2');
    
    expect(freeDeployment.group).toBe('besieged');
    expect(shadowDeployment.group).toBe('sieging');
  });

  test('initiateSiege should enforce stacking limits', () => {
    const regionId = 'test-region';
    const region = gameState.board.regions.get(regionId);
    
    // Add deployments with excessive units for besieged
    region.deployments = [
      {
        group: 'normal',
        units: {
          regular: 4,
          elite: 3, // Total 7 units, exceeds limit of 5
          owner: 'p1'
        },
        leaders: 0
      },
      {
        group: 'normal',
        units: {
          regular: 4,
          elite: 2,
          owner: 'p2'
        },
        leaders: 0
      }
    ];
    
    // Initialize reserves
    gameState.offBoard.free.reserves.set('test-nation', { regular: 0, elite: 0 });
    
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Initiate siege
    const updatedState = stateInference.initiateSiege(stateCopy, regionId);
    
    // Check that units were moved to reserves
    const updatedRegion = updatedState.board.regions.get(regionId);
    const freeDeployment = updatedRegion.deployments.find(d => d.units.owner === 'p1');
    
    // Total units should be 5 or less
    const totalUnits = freeDeployment.units.regular + freeDeployment.units.elite;
    expect(totalUnits).toBeLessThanOrEqual(5);
    
    // Check that excess units were added to reserves
    const reserves = updatedState.offBoard.free.reserves.get('test-nation');
    expect(reserves.regular + reserves.elite).toBe(2); // 7 - 5 = 2 excess units
  });

  test('playCardToTable should move card from hand to table', () => {
    // Add a card to player's hand
    gameState.offBoard.free.hand.push({ id: 'card1' });
    
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Play card to table
    const updatedState = stateInference.playCardToTable(stateCopy, 'p1', 'card1', 'event');
    
    // Card should be on table with correct owner and type
    expect(updatedState.board.tableCardsArea.get('card1')).toEqual({
      id: 'card1',
      owner: 'p1',
      type: 'event'
    });
    
    // Card should be removed from hand
    expect(updatedState.offBoard.free.hand.find(c => c.id === 'card1')).toBeUndefined();
  });

  test('discardCardFromTable should move card from table to discard pile', () => {
    // Set up table cards area
    gameState.board.tableCardsArea.set('card1', {
      id: 'card1',
      owner: 'p1',
      type: 'event'
    });
    
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Discard card
    const updatedState = stateInference.discardCardFromTable(stateCopy, 'card1');
    
    // Card should be removed from table
    expect(updatedState.board.tableCardsArea.has('card1')).toBe(false);
    
    // Card should be in discard pile
    expect(updatedState.offBoard.free.discards.find(c => c.id === 'card1')).toBeDefined();
  });

  test('selectActionDie should add die to selected dice area', () => {
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Select a die
    const updatedState = stateInference.selectActionDie(stateCopy, 'free', 0);
    
    // Die should be in selected dice area
    expect(updatedState.board.selectedDiceArea.free.length).toBe(1);
    expect(updatedState.board.selectedDiceArea.free[0].index).toBe(0);
    expect(updatedState.board.selectedDiceArea.free[0].type).toBe(gameState.board.actionDiceArea.free[0].type);
  });

  test('useSelectedDie should move die to used dice area', () => {
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // First select a die
    let updatedState = stateInference.selectActionDie(stateCopy, 'free', 0);
    
    // Then use the selected die
    updatedState = stateInference.useSelectedDie(updatedState, 'free', 0);
    
    // Die should be removed from selected dice area
    expect(updatedState.board.selectedDiceArea.free.length).toBe(0);
    
    // Die should be in used dice area
    expect(updatedState.board.usedDiceArea.free.length).toBe(1);
    expect(updatedState.board.usedDiceArea.free[0].type).toBe(gameState.board.actionDiceArea.free[0].type);
  });

  test('placeHuntBoxDie should add die to hunt box', () => {
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Place a die in the hunt box
    const updatedState = stateInference.placeHuntBoxDie(stateCopy, 'free', 'Character');
    
    // Die should be in hunt box
    expect(updatedState.board.huntBox.diceArea.length).toBe(1);
    expect(updatedState.board.huntBox.diceArea[0]).toEqual({
      type: 'Character',
      team: 'free'
    });
  });

  test('removeHuntBoxDie should remove die from hunt box', () => {
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // First place a die in the hunt box
    let updatedState = stateInference.placeHuntBoxDie(stateCopy, 'free', 'Character');
    
    // Then remove it
    updatedState = stateInference.removeHuntBoxDie(updatedState, 0);
    
    // Hunt box should be empty
    expect(updatedState.board.huntBox.diceArea.length).toBe(0);
  });

  test('drawHuntTile should move a tile from pool to hunt box', () => {
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Draw a tile
    const updatedState = stateInference.drawHuntTile(stateCopy);
    
    // Hunt box should have a tile
    expect(updatedState.board.huntBox.tile).toBeDefined();
    
    // Hunt pool should have one less tile
    expect(updatedState.board.huntPool.tiles.length).toBe(2);
  });

  test('reserveHuntTile should add tile to reserved area', () => {
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Reserve a tile
    const updatedState = stateInference.reserveHuntTile(stateCopy, 'reveal_1', 'special');
    
    // Tile should be in reserved area
    expect(updatedState.board.reservedHuntTilesArea.has('special')).toBe(true);
    expect(updatedState.board.reservedHuntTilesArea.get('special').length).toBe(1);
    expect(updatedState.board.reservedHuntTilesArea.get('special')[0].id).toBe('reveal_1');
  });

  test('moveFellowship should update progress and visibility', () => {
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Move fellowship
    const updatedState = stateInference.moveFellowship(stateCopy, 2, true);
    
    // Progress should be updated
    expect(updatedState.board.fellowshipTrack.progress.value).toBe(2);
    
    // Fellowship should be visible (hunt tile added)
    expect(updatedState.board.huntBox.tile).toBeDefined();
    expect(stateInference.isFellowshipHidden(updatedState)).toBe(false);
  });

  test('advancePoliticalTrack should update nation status', () => {
    // Create a deep copy for testing
    const stateCopy = deepCopyState(gameState);
    
    // Get a passive nation
    const nationId = '3'; // Gondor
    
    // Initially should be passive
    expect(stateCopy.board.politicalTrack.get(nationId).face).toBe('passive');
    
    // Advance to position 2
    let updatedState = stateInference.advancePoliticalTrack(stateCopy, nationId);
    updatedState = stateInference.advancePoliticalTrack(updatedState, nationId);
    
    // Should still be passive
    expect(updatedState.board.politicalTrack.get(nationId).face).toBe('passive');
    expect(updatedState.board.politicalTrack.get(nationId).position).toBe(2);
    
    // Advance to position 3
    updatedState = stateInference.advancePoliticalTrack(updatedState, nationId);
    
    // Should now be active (at war)
    expect(updatedState.board.politicalTrack.get(nationId).face).toBe('active');
    expect(updatedState.board.politicalTrack.get(nationId).position).toBe(3);
  });
});
