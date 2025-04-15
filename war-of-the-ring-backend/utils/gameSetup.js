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
  
  // Initialize player areas
  gameState.offBoard.playerAreas = new Map();

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
        controlledNations: ['1', '2', '3', '4', '5'] // All Free nations
      });
      
      // Set up player area
      gameState.offBoard.playerAreas.set(singlePlayer.id, {
        hand: [],
        reserved: []
      });

      // AI opponent
      gameState.players.push({
        id: 'ai',
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: true,
        aiStrategy: 'random',
        controlledNations: ['6', '7', '8'] // All Shadow nations
      });
      
      // Set up AI player area
      gameState.offBoard.playerAreas.set('ai', {
        hand: [],
        reserved: []
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
        controlledNations: ['1', '2', '3', '4', '5'] // All Free nations
      });
      
      // Set up free player area
      gameState.offBoard.playerAreas.set(freePlayer.id, {
        hand: [],
        reserved: []
      });

      gameState.players.push({
        id: shadowPlayer.id,
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: shadowPlayer.isAI || false,
        aiStrategy: shadowPlayer.aiStrategy,
        controlledNations: ['6', '7', '8'] // All Shadow nations
      });
      
      // Set up shadow player area
      gameState.offBoard.playerAreas.set(shadowPlayer.id, {
        hand: [],
        reserved: []
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
        controlledNations: ['1', '2', '3', '4', '5'] // All Free nations
      });
      
      // Set up free player area
      gameState.offBoard.playerAreas.set(freePlayerThree.id, {
        hand: [],
        reserved: []
      });

      gameState.players.push({
        id: sauronPlayer.id,
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: sauronPlayer.isAI || false,
        aiStrategy: sauronPlayer.aiStrategy,
        controlledNations: ['7', '8'] // Sauron, Southrons
      });
      
      // Set up Sauron player area
      gameState.offBoard.playerAreas.set(sauronPlayer.id, {
        hand: [],
        reserved: []
      });

      gameState.players.push({
        id: sarumanPlayer.id,
        team: 'Shadow',
        role: 'Saruman',
        isLeading: false,
        isAI: sarumanPlayer.isAI || false,
        aiStrategy: sarumanPlayer.aiStrategy,
        controlledNations: ['6'] // Isengard
      });
      
      // Set up Saruman player area
      gameState.offBoard.playerAreas.set(sarumanPlayer.id, {
        hand: [],
        reserved: []
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
        controlledNations: ['2', '3'] // Elves, Gondor
      });
      
      // Set up Gondor/Elves player area
      gameState.offBoard.playerAreas.set(gondorElvesPlayer.id, {
        hand: [],
        reserved: []
      });

      gameState.players.push({
        id: rohanNorthDwarvesPlayer.id,
        team: 'Free',
        role: 'RohanNorthDwarves',
        isLeading: false,
        isAI: rohanNorthDwarvesPlayer.isAI || false,
        aiStrategy: rohanNorthDwarvesPlayer.aiStrategy,
        controlledNations: ['1', '4', '5'] // Dwarves, North, Rohan
      });
      
      // Set up Rohan/North/Dwarves player area
      gameState.offBoard.playerAreas.set(rohanNorthDwarvesPlayer.id, {
        hand: [],
        reserved: []
      });

      gameState.players.push({
        id: sauronPlayerFour.id,
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: sauronPlayerFour.isAI || false,
        aiStrategy: sauronPlayerFour.aiStrategy,
        controlledNations: ['7', '8'] // Sauron, Southrons
      });
      
      // Set up Sauron player area
      gameState.offBoard.playerAreas.set(sauronPlayerFour.id, {
        hand: [],
        reserved: []
      });

      gameState.players.push({
        id: sarumanPlayerFour.id,
        team: 'Shadow',
        role: 'Saruman',
        isLeading: false,
        isAI: sarumanPlayerFour.isAI || false,
        aiStrategy: sarumanPlayerFour.aiStrategy,
        controlledNations: ['6'] // Isengard
      });
      
      // Set up Saruman player area
      gameState.offBoard.playerAreas.set(sarumanPlayerFour.id, {
        hand: [],
        reserved: []
      });
      break;
  }
}

/**
 * Set up action dice based on player count
 * @param {Object} gameState - Game state to modify
 */
function setupActionDice(gameState) {
  // Initialize action dice areas
  gameState.board.actionDiceArea = {
    free: [],
    shadow: []
  };
  
  gameState.board.selectedDiceArea = {
    free: [],
    shadow: []
  };
  
  gameState.board.usedDiceArea = {
    free: [],
    shadow: []
  };

  // Standard setup: 4 Free dice, 7 Shadow dice
  for (let i = 0; i < 4; i++) {
    const dieType = getDieType('Free', i);
    gameState.board.actionDiceArea.free.push({ type: dieType });
  }

  for (let i = 0; i < 7; i++) {
    const dieType = getDieType('Shadow', i);
    gameState.board.actionDiceArea.shadow.push({ type: dieType });
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
  try {
    // Initialize regions map
    gameState.board.regions = new Map();
    
    // Try to load regions data
    const regionsPath = path.join(__dirname, '../data/regions.json');
    const regionsData = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
    
    // Try to load initial army setup data
    const setupPath = path.join(__dirname, '../data/initial_army_setup.json');
    const setupData = JSON.parse(fs.readFileSync(setupPath, 'utf8'));
    
    // Create regions with initial setup
    Object.entries(regionsData).forEach(([id, regionData]) => {
      const regionSetup = setupData.regions[id] || {};
      
      // Create base region
      const region = {
        name: regionData.name,
        control: regionSetup.control || null,
        nation: regionData.nation,
        deployments: [],
        characters: [],
        structure: {
          type: regionData.structure?.type || null,
          category: regionData.structure?.category || null,
          canMuster: regionData.structure?.canMuster || false,
          vp: regionData.structure?.vp || 0
        }
      };
      
      // Add initial deployments if present
      if (regionSetup.deployments && regionSetup.deployments.length > 0) {
        regionSetup.deployments.forEach(deployment => {
          // Find the player that controls this nation
          const nationId = regionData.nation;
          const controllingPlayer = gameState.players.find(p => 
            p.controlledNations.includes(nationId)
          );
          
          // Default to first player of appropriate team if no specific controller found
          const team = (nationId <= 5) ? 'Free' : 'Shadow';
          const defaultPlayer = gameState.players.find(p => p.team === team);
          const ownerId = controllingPlayer?.id || defaultPlayer?.id;
          
          // Add deployment with owner
          region.deployments.push({
            group: deployment.group || 'normal',
            units: {
              regular: deployment.regular || 0,
              elite: deployment.elite || 0,
              owner: ownerId
            },
            leaders: deployment.leaders || 0
          });
        });
      }
      
      // Add initial characters if present
      if (regionSetup.characters && regionSetup.characters.length > 0) {
        regionSetup.characters.forEach(characterId => {
          // Determine character owner based on character data
          // For simplicity, assign to first player of appropriate team
          const characterTeam = characterId.startsWith('gandalf') || 
                              characterId.startsWith('aragorn') || 
                              characterId.startsWith('legolas') || 
                              characterId.startsWith('gimli') || 
                              characterId.startsWith('boromir') || 
                              characterId.startsWith('frodo') || 
                              characterId.startsWith('merry') || 
                              characterId.startsWith('pippin') ? 'Free' : 'Shadow';
          
          const owner = gameState.players.find(p => p.team === characterTeam)?.id;
          
          region.characters.push({
            id: characterId,
            owner: owner
          });
        });
      }
      
      // Add region to map
      gameState.board.regions.set(id, region);
    });
    
  } catch (error) {
    console.error("Error setting up regions:", error);
    
    // Fallback: Create empty regions map if data files are not available
    gameState.board.regions = new Map();
  }
}

/**
 * Set up event decks
 * @param {Object} gameState - Game state to modify
 */
function setupEventDecks(gameState) {
  try {
    // Initialize event decks
    gameState.board.eventDecks = {
      freeCharacter: [],
      freeStrategy: [],
      shadowCharacter: [],
      shadowStrategy: []
    };
    
    // Try to load event cards data
    const eventCardsPath = path.join(__dirname, '../data/eventcards.json');
    const eventCardsData = JSON.parse(fs.readFileSync(eventCardsPath, 'utf8'));
    
    // Sort cards into appropriate decks
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
  
  // Initialize offBoard card areas with new structure
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
    },
    playerAreas: new Map()
  };
}

/**
 * Set up hunt pool
 * @param {Object} gameState - Game state to modify
 */
function setupHuntPool(gameState) {
  // Initialize hunt box with empty dice area
  gameState.board.huntBox = {
    diceArea: [],
    tile: null
  };
  
  // Standard hunt pool setup
  gameState.board.huntPool = {
    tiles: [],
    regular: 6,
    eye: 2
  };
  
  // Add hunt tiles with IDs
  const huntTiles = [
    "reveal_0", "reveal_0", "reveal_1", "reveal_1", "reveal_2", "reveal_2",
    "damage_1", "damage_1", "damage_2", "damage_2",
    "eye_0", "eye_0", "eye_0", "eye_0", "eye_0", "eye_0"
  ];
  
  huntTiles.forEach(tileId => {
    gameState.board.huntPool.tiles.push({ id: tileId });
  });
  
  // Initialize reserved hunt tiles area
  gameState.board.reservedHuntTilesArea = new Map();
  
  // Shuffle the hunt pool
  shuffleArray(gameState.board.huntPool.tiles);
}

/**
 * Set up fellowship
 * @param {Object} gameState - Game state to modify
 */
function setupFellowship(gameState) {
  // Initialize fellowship track without hidden flag
  gameState.board.fellowshipTrack = {
    progress: {
      value: 0
    },
    corruption: 0
  };
  
  // Initialize guide box with Gandalf the Grey as default guide
  gameState.board.guideBox = {
    companion: "gandalf_grey"
  };
  
  // Initialize fellowship box with all companions and their owners
  const freePlayer = gameState.players.find(p => p.team === 'Free' && p.role === 'FreeAll');
  const gondorElvesPlayer = gameState.players.find(p => p.team === 'Free' && p.role === 'GondorElves');
  const rohanNorthDwarvesPlayer = gameState.players.find(p => p.team === 'Free' && p.role === 'RohanNorthDwarves');
  
  // Default to first Free player if specific roles not found
  const defaultFreePlayer = freePlayer || gondorElvesPlayer || rohanNorthDwarvesPlayer || gameState.players.find(p => p.team === 'Free');
  
  // Assign companions based on player roles in 4-player game
  gameState.board.fellowshipBox = {
    companions: []
  };
  
  // Frodo and Sam always belong to the Ring-bearer's controller
  gameState.board.fellowshipBox.companions.push({
    id: "frodo_sam",
    owner: defaultFreePlayer.id
  });
  
  // In 4-player game, assign companions based on nations
  if (gameState.playerCount === 4 && gondorElvesPlayer && rohanNorthDwarvesPlayer) {
    // Gondor/Elves player gets Gondor and Elven companions
    gameState.board.fellowshipBox.companions.push(
      { id: "boromir", owner: gondorElvesPlayer.id },
      { id: "legolas", owner: gondorElvesPlayer.id }
    );
    
    // Rohan/North/Dwarves player gets those companions
    gameState.board.fellowshipBox.companions.push(
      { id: "gimli", owner: rohanNorthDwarvesPlayer.id },
      { id: "merry", owner: rohanNorthDwarvesPlayer.id },
      { id: "pippin", owner: rohanNorthDwarvesPlayer.id }
    );
    
    // Aragorn and Gandalf can be controlled by either player
    // For simplicity, assign to Gondor/Elves player initially
    gameState.board.fellowshipBox.companions.push(
      { id: "aragorn", owner: gondorElvesPlayer.id },
      { id: "gandalf_grey", owner: gondorElvesPlayer.id }
    );
  } else {
    // In 1-3 player games, all companions belong to the Free player
    gameState.board.fellowshipBox.companions.push(
      { id: "gandalf_grey", owner: defaultFreePlayer.id },
      { id: "aragorn", owner: defaultFreePlayer.id },
      { id: "legolas", owner: defaultFreePlayer.id },
      { id: "gimli", owner: defaultFreePlayer.id },
      { id: "boromir", owner: defaultFreePlayer.id },
      { id: "merry", owner: defaultFreePlayer.id },
      { id: "pippin", owner: defaultFreePlayer.id }
    );
  }
  
  // Initialize Mordor track
  gameState.board.mordorTrack = {
    position: null
  };
  
  // Initialize Gollum with owner field
  gameState.board.gollum = {
    location: null,
    owner: null
  };
  
  // Initialize table cards area
  gameState.board.tableCardsArea = new Map();
}

/**
 * Set up political track
 * @param {Object} gameState - Game state to modify
 */
function setupPoliticalTrack(gameState) {
  // Initialize political track with face property instead of active
  gameState.board.politicalTrack = new Map();
  
  // Set up nations with their initial political status
  gameState.board.politicalTrack.set("1", { position: 0, face: "passive" }); // Dwarves
  gameState.board.politicalTrack.set("2", { position: 3, face: "active" });  // Elves (start active)
  gameState.board.politicalTrack.set("3", { position: 0, face: "passive" }); // Gondor
  gameState.board.politicalTrack.set("4", { position: 0, face: "passive" }); // North
  gameState.board.politicalTrack.set("5", { position: 0, face: "passive" }); // Rohan
  gameState.board.politicalTrack.set("6", { position: 3, face: "active" });  // Isengard (start active)
  gameState.board.politicalTrack.set("7", { position: 3, face: "active" });  // Sauron (start active)
  gameState.board.politicalTrack.set("8", { position: 3, face: "active" });  // Southrons (start active)
  
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
  initializeGameState,
  setupPlayers,
  setupActionDice,
  getDieType,
  setupTurnOrder,
  setupRegions,
  setupEventDecks,
  setupHuntPool,
  setupFellowship,
  setupPoliticalTrack,
  shuffleArray
};
