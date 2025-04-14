/**
 * Game Setup Utility for War of the Ring
 * Handles initializing game state for different player counts and configurations
 */

const GameState = require('../models/gameState');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Initialize a new game state
 * @param {Object} options - Game initialization options
 * @param {Number} options.playerCount - Number of players (1-4)
 * @param {Array} options.players - Array of player IDs and their roles
 * @param {String} options.mode - Game mode ('Full', 'Companion')
 * @param {Boolean} options.rulesEnforced - Whether rules are enforced
 * @param {Array} options.expansions - Array of enabled expansions
 * @param {String} options.scenario - Scenario name
 * @returns {Object} - Initialized game state
 */
function initializeGameState(options) {
  const {
    playerCount = 2,
    players = [],
    mode = 'Full',
    rulesEnforced = true,
    expansions = [],
    scenario = 'Base'
  } = options;

  // Generate a unique game ID
  const gameId = crypto.randomBytes(8).toString('hex');

  // Create base game state
  const gameState = new GameState({
    gameId,
    playerCount,
    mode,
    rulesEnforced,
    expansions,
    scenario
  });

  // Set up players based on player count
  setupPlayers(gameState, players, playerCount);

  // Initialize action dice
  setupActionDice(gameState);

  // Set initial turn order
  setupTurnOrder(gameState);

  // Initialize regions and deployments
  setupRegions(gameState);

  // Initialize event decks
  setupEventDecks(gameState);

  // Initialize hunt pool
  setupHuntPool(gameState);

  // Initialize fellowship
  setupFellowship(gameState);

  // Initialize political track
  setupPoliticalTrack(gameState);

  return gameState;
}

/**
 * Set up players based on player count
 * @param {Object} gameState - Game state to modify
 * @param {Array} players - Array of player IDs and their roles
 * @param {Number} playerCount - Number of players (1-4)
 */
function setupPlayers(gameState, players, playerCount) {
  gameState.players = [];

  switch (playerCount) {
    case 1:
      // Single player (Free Peoples vs AI Shadow)
      const singlePlayer = players[0] || { id: 'p1' };
      gameState.players.push({
        id: singlePlayer.id,
        team: 'Free',
        role: 'FreeAll',
        isLeading: true,
        isAI: false,
        controlledNations: ['1', '2', '3', '4', '5'], // All Free nations
        hand: []
      });

      // AI opponent
      gameState.players.push({
        id: 'ai',
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: true,
        aiStrategy: 'random',
        controlledNations: ['6', '7', '8'], // All Shadow nations
        hand: []
      });
      break;

    case 2:
      // Traditional 2-player game
      const freePlayer = players.find(p => p.team === 'Free') || { id: 'p1', team: 'Free' };
      const shadowPlayer = players.find(p => p.team === 'Shadow') || { id: 'p2', team: 'Shadow' };

      gameState.players.push({
        id: freePlayer.id,
        team: 'Free',
        role: 'FreeAll',
        isLeading: true,
        isAI: freePlayer.isAI || false,
        aiStrategy: freePlayer.aiStrategy,
        controlledNations: ['1', '2', '3', '4', '5'], // All Free nations
        hand: []
      });

      gameState.players.push({
        id: shadowPlayer.id,
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: shadowPlayer.isAI || false,
        aiStrategy: shadowPlayer.aiStrategy,
        controlledNations: ['6', '7', '8'], // All Shadow nations
        hand: []
      });
      break;

    case 3:
      // 3-player game: 1 Free Peoples, 2 Shadow
      const freePlayerThree = players.find(p => p.team === 'Free') || { id: 'p1', team: 'Free' };
      const sauronPlayer = players.find(p => p.role === 'Sauron') || { id: 'p2', team: 'Shadow', role: 'Sauron' };
      const sarumanPlayer = players.find(p => p.role === 'Saruman') || { id: 'p3', team: 'Shadow', role: 'Saruman' };

      gameState.players.push({
        id: freePlayerThree.id,
        team: 'Free',
        role: 'FreeAll',
        isLeading: true,
        isAI: freePlayerThree.isAI || false,
        aiStrategy: freePlayerThree.aiStrategy,
        controlledNations: ['1', '2', '3', '4', '5'], // All Free nations
        hand: []
      });

      gameState.players.push({
        id: sauronPlayer.id,
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: sauronPlayer.isAI || false,
        aiStrategy: sauronPlayer.aiStrategy,
        controlledNations: ['7'], // Sauron
        hand: []
      });

      gameState.players.push({
        id: sarumanPlayer.id,
        team: 'Shadow',
        role: 'Saruman',
        isLeading: false,
        isAI: sarumanPlayer.isAI || false,
        aiStrategy: sarumanPlayer.aiStrategy,
        controlledNations: ['6', '8'], // Isengard, Southrons
        hand: []
      });
      break;

    case 4:
      // 4-player game: 2 Free Peoples, 2 Shadow
      const gondorElvesPlayer = players.find(p => p.role === 'GondorElves') || { id: 'p1', team: 'Free', role: 'GondorElves' };
      const rohanNorthDwarvesPlayer = players.find(p => p.role === 'RohanNorthDwarves') || { id: 'p2', team: 'Free', role: 'RohanNorthDwarves' };
      const sauronPlayerFour = players.find(p => p.role === 'Sauron') || { id: 'p3', team: 'Shadow', role: 'Sauron' };
      const sarumanPlayerFour = players.find(p => p.role === 'Saruman') || { id: 'p4', team: 'Shadow', role: 'Saruman' };

      gameState.players.push({
        id: gondorElvesPlayer.id,
        team: 'Free',
        role: 'GondorElves',
        isLeading: true,
        isAI: gondorElvesPlayer.isAI || false,
        aiStrategy: gondorElvesPlayer.aiStrategy,
        controlledNations: ['2', '3'], // Elves, Gondor
        hand: []
      });

      gameState.players.push({
        id: rohanNorthDwarvesPlayer.id,
        team: 'Free',
        role: 'RohanNorthDwarves',
        isLeading: false,
        isAI: rohanNorthDwarvesPlayer.isAI || false,
        aiStrategy: rohanNorthDwarvesPlayer.aiStrategy,
        controlledNations: ['1', '4', '5'], // Dwarves, Rohan, North
        hand: []
      });

      gameState.players.push({
        id: sauronPlayerFour.id,
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: sauronPlayerFour.isAI || false,
        aiStrategy: sauronPlayerFour.aiStrategy,
        controlledNations: ['7'], // Sauron
        hand: []
      });

      gameState.players.push({
        id: sarumanPlayerFour.id,
        team: 'Shadow',
        role: 'Saruman',
        isLeading: false,
        isAI: sarumanPlayerFour.isAI || false,
        aiStrategy: sarumanPlayerFour.aiStrategy,
        controlledNations: ['6', '8'], // Isengard, Southrons
        hand: []
      });
      break;
  }
}

/**
 * Set up action dice based on player count
 * @param {Object} gameState - Game state to modify
 */
function setupActionDice(gameState) {
  // Initialize shared dice pools
  gameState.board = gameState.board || {};
  gameState.board.actionDiceArea = {
    free: [],
    shadow: []
  };

  // Free Peoples always gets 4 dice
  for (let i = 0; i < 4; i++) {
    const dieType = getDieType('Free', i);
    gameState.board.actionDiceArea.free.push({
      type: dieType,
      selected: false
    });
  }

  // Shadow always gets 7 dice
  for (let i = 0; i < 7; i++) {
    const dieType = getDieType('Shadow', i);
    gameState.board.actionDiceArea.shadow.push({
      type: dieType,
      selected: false
    });
  }
}

/**
 * Get die type based on faction and index
 * @param {String} team - 'Free' or 'Shadow'
 * @param {Number} index - Die index
 * @returns {String} - Die type
 */
function getDieType(team, index) {
  // Default distribution of die types
  const freeDieTypes = ['Character', 'Muster', 'Army', 'Will'];
  const shadowDieTypes = ['Character', 'Muster', 'Army', 'Army', 'Muster', 'Character', 'Eye'];

  if (team === 'Free') {
    return freeDieTypes[index % freeDieTypes.length];
  } else {
    return shadowDieTypes[index % shadowDieTypes.length];
  }
}

/**
 * Set up initial turn order
 * @param {Object} gameState - Game state to modify
 */
function setupTurnOrder(gameState) {
  // For 3-4 player games, we need a specific turn order
  if (gameState.playerCount > 2) {
    // Example turn order for 4-player game (can be randomized)
    // Free (GondorElves) -> Shadow (Saruman) -> Free (RohanNorthDwarves) -> Shadow (Sauron)
    const freePlayers = gameState.players.filter(p => p.team === 'Free');
    const shadowPlayers = gameState.players.filter(p => p.team === 'Shadow');

    gameState.turn = {
      phase: 'setup',
      turnOrder: [],
      activePlayer: ''
    };
    
    // Alternate Free and Shadow players
    for (let i = 0; i < Math.max(freePlayers.length, shadowPlayers.length); i++) {
      if (i < freePlayers.length) {
        gameState.turn.turnOrder.push(freePlayers[i].id);
      }
      if (i < shadowPlayers.length) {
        gameState.turn.turnOrder.push(shadowPlayers[i].id);
      }
    }
  } else {
    // For 1-2 player games, Free Peoples goes first
    const freePlayer = gameState.players.find(p => p.team === 'Free');
    const shadowPlayer = gameState.players.find(p => p.team === 'Shadow');
    
    gameState.turn = {
      phase: 'setup',
      turnOrder: [freePlayer.id, shadowPlayer.id],
      activePlayer: ''
    };
  }

  // Set the active player to the first player in the turn order
  gameState.turn.activePlayer = gameState.turn.turnOrder[0];
}

/**
 * Set up initial regions and deployments
 * @param {Object} gameState - Game state to modify
 */
function setupRegions(gameState) {
  // Initialize regions map
  gameState.board.regions = new Map();
  
  try {
    // Load regions data from regions.json
    const regionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/regions.json'), 'utf8'));
    
    // Load initial army setup from initial_army_setup.json
    const armySetupData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/initial_army_setup.json'), 'utf8'));
    
    // Process regions data
    regionsData.forEach(region => {
      const regionId = region.id.toString();
      
      // Create basic region structure
      const regionEntry = {
        name: region.name,
        control: null,
        siegeStatus: "out",
        nation: region.nation,
        deployments: [],
        characters: [],
        structure: {
          type: region.structureType || null,
          category: region.structureCategory || null,
          canMuster: region.canMuster || false,
          vp: region.victoryPoints || 0
        }
      };
      
      // Find army setup for this region
      const armySetup = armySetupData.find(setup => setup.regionId === regionId);
      if (armySetup) {
        regionEntry.control = armySetup.controlledBy || null;
        
        // Add deployments
        if (armySetup.units && armySetup.units.length > 0) {
          armySetup.units.forEach(unit => {
            regionEntry.deployments.push({
              group: "normal",
              units: {
                regular: unit.regular || 0,
                elite: unit.elite || 0,
                owner: unit.faction === "Free" ? gameState.players.find(p => p.team === "Free").id : 
                                               gameState.players.find(p => p.team === "Shadow").id
              },
              leaders: unit.leaders || 0
            });
          });
        }
      }
      
      // Add to regions map
      gameState.board.regions.set(regionId, regionEntry);
    });
    
    // Set up Rivendell as the starting location for the Fellowship
    const rivendell = gameState.board.regions.get("81"); // Assuming Rivendell is region 81
    if (rivendell) {
      rivendell.characters.push("frodo_sam");
    }
    
  } catch (error) {
    console.error("Error setting up regions:", error);
    
    // Fallback: Add a minimal set of regions if data files are not available
    gameState.board.regions.set("53", {
      name: "Minas Tirith",
      control: "3", // Gondor
      siegeStatus: "out",
      nation: "3",
      deployments: [{
        group: "normal",
        units: {
          regular: 3,
          elite: 0,
          owner: gameState.players.find(p => p.team === "Free").id
        },
        leaders: 0
      }],
      characters: [],
      structure: {
        type: "stronghold",
        category: "fortification",
        canMuster: true,
        vp: 2
      }
    });
    
    gameState.board.regions.set("81", {
      name: "Rivendell",
      control: "2", // Elves
      siegeStatus: "out",
      nation: "2",
      deployments: [],
      characters: ["frodo_sam"],
      structure: {
        type: "stronghold",
        category: "fortification",
        canMuster: true,
        vp: 0
      }
    });
  }
  
  // Initialize combat dice area
  gameState.board.combatDiceArea = {
    free: [],
    shadow: []
  };
}

/**
 * Set up initial event decks
 * @param {Object} gameState - Game state to modify
 */
function setupEventDecks(gameState) {
  // Initialize event decks
  gameState.board.eventDecks = {
    freeCharacter: [],
    freeStrategy: [],
    shadowCharacter: [],
    shadowStrategy: []
  };
  
  try {
    // Load event cards data
    const eventCardsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/eventcards.json'), 'utf8'));
    
    // Separate cards into appropriate decks
    eventCardsData.forEach(card => {
      if (card.faction === "Free") {
        if (card.type === "Character") {
          gameState.board.eventDecks.freeCharacter.push(card.id);
        } else if (card.type === "Strategy") {
          gameState.board.eventDecks.freeStrategy.push(card.id);
        }
      } else if (card.faction === "Shadow") {
        if (card.type === "Character") {
          gameState.board.eventDecks.shadowCharacter.push(card.id);
        } else if (card.type === "Strategy") {
          gameState.board.eventDecks.shadowStrategy.push(card.id);
        }
      }
    });
    
    // Shuffle each deck
    shuffleArray(gameState.board.eventDecks.freeCharacter);
    shuffleArray(gameState.board.eventDecks.freeStrategy);
    shuffleArray(gameState.board.eventDecks.shadowCharacter);
    shuffleArray(gameState.board.eventDecks.shadowStrategy);
    
  } catch (error) {
    console.error("Error setting up event decks:", error);
    
    // Fallback: Create empty decks if data files are not available
    gameState.board.eventDecks = {
      freeCharacter: [],
      freeStrategy: [],
      shadowCharacter: [],
      shadowStrategy: []
    };
  }
  
  // Initialize offBoard card areas
  gameState.offBoard = {
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
    }
  };
}

/**
 * Set up hunt pool
 * @param {Object} gameState - Game state to modify
 */
function setupHuntPool(gameState) {
  // Initialize hunt box and pool
  gameState.board.huntBox = {
    dice: 0,
    tile: null
  };
  
  // Standard hunt pool setup
  gameState.board.huntPool = {
    tiles: [
      "reveal_0", "reveal_0", "reveal_1", "reveal_1", "reveal_2", "reveal_2",
      "damage_1", "damage_1", "damage_2", "damage_2",
      "eye_0", "eye_0", "eye_0", "eye_0", "eye_0", "eye_0"
    ],
    count: 16
  };
  
  // Shuffle the hunt pool
  shuffleArray(gameState.board.huntPool.tiles);
}

/**
 * Set up fellowship
 * @param {Object} gameState - Game state to modify
 */
function setupFellowship(gameState) {
  // Initialize fellowship track
  gameState.board.fellowshipTrack = {
    progress: {
      value: 0,
      hidden: true
    },
    corruption: 0
  };
  
  // Initialize guide box with Gandalf the Grey as default guide
  gameState.board.guideBox = {
    companion: "gandalf_grey"
  };
  
  // Initialize fellowship box with all companions
  gameState.board.fellowshipBox = {
    companions: [
      "frodo_sam", "gandalf_grey", "aragorn", "legolas", 
      "gimli", "boromir", "merry", "pippin"
    ]
  };
  
  // Initialize Mordor track
  gameState.board.mordorTrack = {
    position: null
  };
  
  // Initialize Gollum
  gameState.board.gollum = {
    location: null
  };
}

/**
 * Set up political track
 * @param {Object} gameState - Game state to modify
 */
function setupPoliticalTrack(gameState) {
  // Initialize political track
  gameState.board.politicalTrack = new Map();
  
  // Set up nations with their initial political status
  gameState.board.politicalTrack.set("1", { position: "passive", active: false }); // Dwarves
  gameState.board.politicalTrack.set("2", { position: "active", active: true });   // Elves (start active)
  gameState.board.politicalTrack.set("3", { position: "passive", active: false }); // Gondor
  gameState.board.politicalTrack.set("4", { position: "passive", active: false }); // North
  gameState.board.politicalTrack.set("5", { position: "passive", active: false }); // Rohan
  gameState.board.politicalTrack.set("6", { position: "active", active: true });   // Isengard (start active)
  gameState.board.politicalTrack.set("7", { position: "active", active: true });   // Sauron (start active)
  gameState.board.politicalTrack.set("8", { position: "active", active: true });   // Southrons (start active)
  
  // Initialize victory points
  gameState.board.victoryPoints = {
    free: 0,
    shadow: 0
  };
  
  // Initialize elven rings
  gameState.board.elvenRings = {
    free: 3,
    shadow: 0
  };
}

/**
 * Utility function to shuffle an array
 * @param {Array} array - Array to shuffle
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = {
  initializeGameState
};
