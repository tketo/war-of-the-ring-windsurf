// Test script for character playability
const { validateCharacterAction } = require('./utils/rulesEngine');

// Create a mock 3-player game state
const threePlayerGameState = {
  gameId: 'test-game-3p',
  playerCount: 3,
  players: [
    { playerId: 'p1', team: 'Free', role: 'FreeAll', isLeading: true, controlledNations: ['1', '2', '3', '4', '5'] },
    { playerId: 'p2', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'] },
    { playerId: 'p3', team: 'Shadow', role: 'Saruman', isLeading: false, controlledNations: ['6', '8'] }
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

// Create a mock 4-player game state
const fourPlayerGameState = {
  gameId: 'test-game-4p',
  playerCount: 4,
  players: [
    { playerId: 'p1', team: 'Free', role: 'GondorElves', isLeading: true, controlledNations: ['2', '3'] },
    { playerId: 'p2', team: 'Free', role: 'RohanNorthDwarves', isLeading: false, controlledNations: ['1', '4', '5'] },
    { playerId: 'p3', team: 'Shadow', role: 'Sauron', isLeading: true, controlledNations: ['7'] },
    { playerId: 'p4', team: 'Shadow', role: 'Saruman', isLeading: false, controlledNations: ['6', '8'] }
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

// Test 3-player game character playability
console.log('===== 3-PLAYER GAME CHARACTER PLAYABILITY TESTS =====');

// Test Free player with Gondor character
const freePlayerGondorChar = validateCharacterAction(threePlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'boromir',
  player: 'p1',
  targetRegion: 'gondor'
});
console.log('Free player can play Gondor character:', freePlayerGondorChar.isValid ? 'PASS' : 'FAIL');

// Test Free player with Elves character
const freePlayerElvesChar = validateCharacterAction(threePlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'legolas',
  player: 'p1',
  targetRegion: 'woodland_realm'
});
console.log('Free player can play Elves character:', freePlayerElvesChar.isValid ? 'PASS' : 'FAIL');

// Test Sauron player with Sauron character
const sauronPlayerSauronChar = validateCharacterAction(threePlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'witch_king',
  player: 'p2',
  targetRegion: 'mordor'
});
console.log('Sauron player can play Sauron character:', sauronPlayerSauronChar.isValid ? 'PASS' : 'FAIL');

// Test Sauron player with Isengard character (should fail)
const sauronPlayerIsengardChar = validateCharacterAction(threePlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'saruman',
  player: 'p2',
  targetRegion: 'isengard'
});
console.log('Sauron player cannot play Isengard character:', !sauronPlayerIsengardChar.isValid ? 'PASS' : 'FAIL');

// Test Saruman player with Isengard character
const sarumanPlayerIsengardChar = validateCharacterAction(threePlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'saruman',
  player: 'p3',
  targetRegion: 'isengard'
});
console.log('Saruman player can play Isengard character:', sarumanPlayerIsengardChar.isValid ? 'PASS' : 'FAIL');

// Test Saruman player with Sauron character (should fail)
const sarumanPlayerSauronChar = validateCharacterAction(threePlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'mouth_of_sauron',
  player: 'p3',
  targetRegion: 'morannon'
});
console.log('Saruman player cannot play Sauron character:', !sarumanPlayerSauronChar.isValid ? 'PASS' : 'FAIL');

console.log('\n===== 4-PLAYER GAME CHARACTER PLAYABILITY TESTS =====');

// Test GondorElves player with Gondor character
const gondorElvesPlayerGondorChar = validateCharacterAction(fourPlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'boromir',
  player: 'p1',
  targetRegion: 'gondor'
});
console.log('GondorElves player can play Gondor character:', gondorElvesPlayerGondorChar.isValid ? 'PASS' : 'FAIL');

// Test GondorElves player with Elves character
const gondorElvesPlayerElvesChar = validateCharacterAction(fourPlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'legolas',
  player: 'p1',
  targetRegion: 'woodland_realm'
});
console.log('GondorElves player can play Elves character:', gondorElvesPlayerElvesChar.isValid ? 'PASS' : 'FAIL');

// Test GondorElves player with Dwarves character (should fail)
const gondorElvesPlayerDwarvesChar = validateCharacterAction(fourPlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'gimli',
  player: 'p1',
  targetRegion: 'erebor'
});
console.log('GondorElves player cannot play Dwarves character:', !gondorElvesPlayerDwarvesChar.isValid ? 'PASS' : 'FAIL');

// Test RohanNorthDwarves player with North character
const rohanNorthDwarvesPlayerNorthChar = validateCharacterAction(fourPlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'strider',
  player: 'p2',
  targetRegion: 'bree'
});
console.log('RohanNorthDwarves player can play North character:', rohanNorthDwarvesPlayerNorthChar.isValid ? 'PASS' : 'FAIL');

// Test RohanNorthDwarves player with Dwarves character
const rohanNorthDwarvesPlayerDwarvesChar = validateCharacterAction(fourPlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'gimli',
  player: 'p2',
  targetRegion: 'erebor'
});
console.log('RohanNorthDwarves player can play Dwarves character:', rohanNorthDwarvesPlayerDwarvesChar.isValid ? 'PASS' : 'FAIL');

// Test Sauron player with Sauron character
const sauronPlayer4pSauronChar = validateCharacterAction(fourPlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'witch_king',
  player: 'p3',
  targetRegion: 'mordor'
});
console.log('Sauron player can play Sauron character:', sauronPlayer4pSauronChar.isValid ? 'PASS' : 'FAIL');

// Test Saruman player with Isengard character
const sarumanPlayer4pIsengardChar = validateCharacterAction(fourPlayerGameState, {
  type: 'characterAction',
  action: 'move',
  characterId: 'saruman',
  player: 'p4',
  targetRegion: 'isengard'
});
console.log('Saruman player can play Isengard character:', sarumanPlayer4pIsengardChar.isValid ? 'PASS' : 'FAIL');

// Import the applyActionDie function
const { applyActionDie } = require('./utils/rulesEngine');

// Create a mock game state with action dice
const mockGameState = {
  gameId: 'test-game',
  playerCount: 4,
  players: [
    { playerId: 'p1', team: 'Free', role: 'GondorElves', isLeading: true },
    { playerId: 'p2', team: 'Free', role: 'RohanNorthDwarves', isLeading: false },
    { playerId: 'p3', team: 'Shadow', role: 'Sauron', isLeading: true },
    { playerId: 'p4', team: 'Shadow', role: 'Saruman', isLeading: false }
  ],
  actionDice: {
    free: [
      { type: 'character', selected: false },
      { type: 'army', selected: false },
      { type: 'muster', selected: false },
      { type: 'event', selected: false },
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

console.log('\n===== ACTION DICE SELECTION TESTS =====');

// Test selecting dice
let updatedState = applyActionDie(mockGameState, { player: 'p1', dieIndex: 0 });

// Check if the first die is selected
const firstDieSelected = updatedState.actionDice.free[0].selected;
console.log('First die is selected:', firstDieSelected ? 'PASS' : 'FAIL');

// Select another die
updatedState = applyActionDie(updatedState, { player: 'p1', dieIndex: 1 });

// Check if the first die is deselected and the second die is selected
const firstDieDeselected = !updatedState.actionDice.free[0].selected;
const secondDieSelected = updatedState.actionDice.free[1].selected;

console.log('First die is deselected when second die is selected:', firstDieDeselected ? 'PASS' : 'FAIL');
console.log('Second die is selected:', secondDieSelected ? 'PASS' : 'FAIL');

console.log('\n===== TEST SUMMARY =====');
console.log('All tests completed. Check the results above to verify character playability rules.');
