const express = require('express');
const router = express.Router();
const { validateCharacterAction } = require('../utils/rulesEngine');

// Test endpoint for character playability in 3-player game
router.get('/characterPlayability/3player', (req, res) => {
  // Create a mock 3-player game state
  const mockGameState = {
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

  // Test various character actions
  const testResults = {
    // Free player tests
    freePlayerGondorChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'boromir',
      player: 'p1',
      targetRegion: 'gondor'
    }),
    freePlayerElvesChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'legolas',
      player: 'p1',
      targetRegion: 'woodland_realm'
    }),
    
    // Sauron player tests
    sauronPlayerSauronChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'witch_king',
      player: 'p2',
      targetRegion: 'mordor'
    }),
    sauronPlayerIsengardChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'saruman',
      player: 'p2',
      targetRegion: 'isengard'
    }),
    
    // Saruman player tests
    sarumanPlayerIsengardChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'saruman',
      player: 'p3',
      targetRegion: 'isengard'
    }),
    sarumanPlayerSauronChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'mouth_of_sauron',
      player: 'p3',
      targetRegion: 'morannon'
    })
  };

  res.json({
    message: 'Character Playability Test Results for 3-Player Game',
    results: testResults
  });
});

// Test endpoint for character playability in 4-player game
router.get('/characterPlayability/4player', (req, res) => {
  // Create a mock 4-player game state
  const mockGameState = {
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

  // Test various character actions
  const testResults = {
    // GondorElves player tests
    gondorElvesPlayerGondorChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'boromir',
      player: 'p1',
      targetRegion: 'gondor'
    }),
    gondorElvesPlayerElvesChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'legolas',
      player: 'p1',
      targetRegion: 'woodland_realm'
    }),
    gondorElvesPlayerDwarvesChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'gimli',
      player: 'p1',
      targetRegion: 'erebor'
    }),
    
    // RohanNorthDwarves player tests
    rohanNorthDwarvesPlayerRohanChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'theoden', // Assuming theoden is a Rohan character
      player: 'p2',
      targetRegion: 'rohan'
    }),
    rohanNorthDwarvesPlayerNorthChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'strider',
      player: 'p2',
      targetRegion: 'bree'
    }),
    rohanNorthDwarvesPlayerDwarvesChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'gimli',
      player: 'p2',
      targetRegion: 'erebor'
    }),
    
    // Sauron player tests
    sauronPlayerSauronChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'witch_king',
      player: 'p3',
      targetRegion: 'mordor'
    }),
    
    // Saruman player tests
    sarumanPlayerIsengardChar: validateCharacterAction(mockGameState, {
      type: 'characterAction',
      action: 'move',
      characterId: 'saruman',
      player: 'p4',
      targetRegion: 'isengard'
    })
  };

  res.json({
    message: 'Character Playability Test Results for 4-Player Game',
    results: testResults
  });
});

// Test endpoint for action dice selection
router.get('/actionDiceSelection', (req, res) => {
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

  // Import the applyActionDie function
  const { applyActionDie } = require('../utils/rulesEngine');

  // Test selecting dice
  let updatedState = applyActionDie(mockGameState, { player: 'p1', dieIndex: 0 });
  
  // Check if the first die is selected
  const firstDieSelected = updatedState.actionDice.free[0].selected;
  
  // Select another die
  updatedState = applyActionDie(updatedState, { player: 'p1', dieIndex: 1 });
  
  // Check if the first die is deselected and the second die is selected
  const firstDieDeselected = !updatedState.actionDice.free[0].selected;
  const secondDieSelected = updatedState.actionDice.free[1].selected;

  res.json({
    message: 'Action Dice Selection Test Results',
    results: {
      firstDieSelected,
      firstDieDeselected,
      secondDieSelected
    }
  });
});

module.exports = router;
