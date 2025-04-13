/**
 * Game Setup Utility for War of the Ring
 * Handles initializing game state for different player counts and configurations
 */

const GameState = require('../models/gameState');
const crypto = require('crypto');

/**
 * Initialize a new game state
 * @param {Object} options - Game initialization options
 * @param {Number} options.playerCount - Number of players (1-4)
 * @param {Array} options.players - Array of player IDs and their roles
 * @param {String} options.mode - Game mode ('full', 'unrestricted', 'companion')
 * @param {Boolean} options.rulesEnforced - Whether rules are enforced
 * @param {Array} options.expansions - Array of enabled expansions
 * @param {String} options.scenario - Scenario name
 * @returns {Object} - Initialized game state
 */
function initializeGameState(options) {
  const {
    playerCount = 2,
    players = [],
    mode = 'full',
    rulesEnforced = true,
    expansions = [],
    scenario = 'standard'
  } = options;

  // Generate a unique game ID
  const gameId = crypto.randomBytes(8).toString('hex');

  // Create base game state
  const gameState = new GameState({
    gameId,
    playerCount,
    settings: {
      mode,
      rulesEnforced,
      expansions,
      scenario
    }
  });

  // Set up players based on player count
  setupPlayers(gameState, players, playerCount);

  // Initialize action dice
  setupActionDice(gameState);

  // Set initial turn order
  setupTurnOrder(gameState);

  // Initialize characters
  setupCharacters(gameState);

  // Initialize regions
  setupRegions(gameState);

  // Initialize decks
  setupDecks(gameState);

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
      const singlePlayer = players[0] || { playerId: 'p1' };
      gameState.players.push({
        playerId: singlePlayer.playerId,
        team: 'Free',
        role: 'FreeAll',
        isLeading: true,
        isAI: false,
        controlledNations: ['1', '2', '3', '4', '5'], // All Free nations
        hand: []
      });

      // AI opponent
      gameState.players.push({
        playerId: 'ai',
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
      const freePlayer = players.find(p => p.team === 'Free') || { playerId: 'p1', team: 'Free' };
      const shadowPlayer = players.find(p => p.team === 'Shadow') || { playerId: 'p2', team: 'Shadow' };

      gameState.players.push({
        playerId: freePlayer.playerId,
        team: 'Free',
        role: 'FreeAll',
        isLeading: true,
        isAI: freePlayer.isAI || false,
        aiStrategy: freePlayer.aiStrategy,
        controlledNations: ['1', '2', '3', '4', '5'], // All Free nations
        hand: []
      });

      gameState.players.push({
        playerId: shadowPlayer.playerId,
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
      const freePlayerThree = players.find(p => p.team === 'Free') || { playerId: 'p1', team: 'Free' };
      const sauronPlayer = players.find(p => p.role === 'Sauron') || { playerId: 'p2', team: 'Shadow', role: 'Sauron' };
      const isengardPlayer = players.find(p => p.role === 'Saruman') || { playerId: 'p3', team: 'Shadow', role: 'Saruman' };

      gameState.players.push({
        playerId: freePlayerThree.playerId,
        team: 'Free',
        role: 'FreeAll',
        isLeading: true,
        isAI: freePlayerThree.isAI || false,
        aiStrategy: freePlayerThree.aiStrategy,
        controlledNations: ['1', '2', '3', '4', '5'], // All Free nations
        hand: []
      });

      gameState.players.push({
        playerId: sauronPlayer.playerId,
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: sauronPlayer.isAI || false,
        aiStrategy: sauronPlayer.aiStrategy,
        controlledNations: ['7'], // Sauron
        hand: []
      });

      gameState.players.push({
        playerId: isengardPlayer.playerId,
        team: 'Shadow',
        role: 'Saruman',
        isLeading: false,
        isAI: isengardPlayer.isAI || false,
        aiStrategy: isengardPlayer.aiStrategy,
        controlledNations: ['6', '8'], // Isengard, Southrons
        hand: []
      });
      break;

    case 4:
      // 4-player game: 2 Free Peoples, 2 Shadow
      const gondorElvesPlayer = players.find(p => p.role === 'GondorElves') || { playerId: 'p1', team: 'Free', role: 'GondorElves' };
      const rohanNorthDwarvesPlayer = players.find(p => p.role === 'RohanNorthDwarves') || { playerId: 'p2', team: 'Free', role: 'RohanNorthDwarves' };
      const sauronPlayerFour = players.find(p => p.role === 'Sauron') || { playerId: 'p3', team: 'Shadow', role: 'Sauron' };
      const isengardPlayerFour = players.find(p => p.role === 'Saruman') || { playerId: 'p4', team: 'Shadow', role: 'Saruman' };

      gameState.players.push({
        playerId: gondorElvesPlayer.playerId,
        team: 'Free',
        role: 'GondorElves',
        isLeading: true,
        isAI: gondorElvesPlayer.isAI || false,
        aiStrategy: gondorElvesPlayer.aiStrategy,
        controlledNations: ['2', '3'], // Elves, Gondor
        hand: []
      });

      gameState.players.push({
        playerId: rohanNorthDwarvesPlayer.playerId,
        team: 'Free',
        role: 'RohanNorthDwarves',
        isLeading: false,
        isAI: rohanNorthDwarvesPlayer.isAI || false,
        aiStrategy: rohanNorthDwarvesPlayer.aiStrategy,
        controlledNations: ['1', '4', '5'], // Dwarves, Rohan, North
        hand: []
      });

      gameState.players.push({
        playerId: sauronPlayerFour.playerId,
        team: 'Shadow',
        role: 'Sauron',
        isLeading: true,
        isAI: sauronPlayerFour.isAI || false,
        aiStrategy: sauronPlayerFour.aiStrategy,
        controlledNations: ['7'], // Sauron
        hand: []
      });

      gameState.players.push({
        playerId: isengardPlayerFour.playerId,
        team: 'Shadow',
        role: 'Saruman',
        isLeading: false,
        isAI: isengardPlayerFour.isAI || false,
        aiStrategy: isengardPlayerFour.aiStrategy,
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
  const freeDiceCount = 4; // Standard Free dice count
  const shadowDiceCount = 7; // Standard Shadow dice count

  gameState.actionDice = {
    free: [],
    shadow: []
  };

  // Distribute Free dice
  const freePlayers = gameState.players.filter(p => p.team === 'Free');
  const freeDicePerPlayer = Math.floor(freeDiceCount / freePlayers.length);
  let remainingFreeDice = freeDiceCount % freePlayers.length;

  freePlayers.forEach(player => {
    const playerDiceCount = freeDicePerPlayer + (remainingFreeDice > 0 ? 1 : 0);
    remainingFreeDice--;

    for (let i = 0; i < playerDiceCount; i++) {
      const dieType = getDieType('Free', i);
      gameState.actionDice.free.push({
        type: dieType,
        selected: false,
        owner: player.playerId
      });
    }
  });

  // Distribute Shadow dice
  const shadowPlayers = gameState.players.filter(p => p.team === 'Shadow');
  const shadowDicePerPlayer = Math.floor(shadowDiceCount / shadowPlayers.length);
  let remainingShadowDice = shadowDiceCount % shadowPlayers.length;

  shadowPlayers.forEach(player => {
    const playerDiceCount = shadowDicePerPlayer + (remainingShadowDice > 0 ? 1 : 0);
    remainingShadowDice--;

    for (let i = 0; i < playerDiceCount; i++) {
      const dieType = getDieType('Shadow', i);
      gameState.actionDice.shadow.push({
        type: dieType,
        selected: false,
        owner: player.playerId
      });
    }
  });
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

    gameState.turnOrder = [];
    
    // Alternate Free and Shadow players
    for (let i = 0; i < Math.max(freePlayers.length, shadowPlayers.length); i++) {
      if (i < freePlayers.length) {
        gameState.turnOrder.push(freePlayers[i].playerId);
      }
      if (i < shadowPlayers.length) {
        gameState.turnOrder.push(shadowPlayers[i].playerId);
      }
    }
  } else {
    // For 1-2 player games, Free Peoples goes first
    const freePlayer = gameState.players.find(p => p.team === 'Free');
    const shadowPlayer = gameState.players.find(p => p.team === 'Shadow');
    
    gameState.turnOrder = [freePlayer.playerId, shadowPlayer.playerId];
  }

  // Set the current player to the first player in the turn order
  gameState.currentPlayer = gameState.turnOrder[0];
}

/**
 * Set up initial characters
 * @param {Object} gameState - Game state to modify
 */
function setupCharacters(gameState) {
  // This would load characters from characters.json and set up initial positions
  gameState.characters = [];
  
  // Example: Add the Fellowship
  gameState.characters.push({
    characterId: 'frodo',
    location: 'rivendell',
    status: 'hidden',
    modifiers: [],
    corruption: 0,
    position: 0
  });
  
  // Other characters would be added based on the scenario
}

/**
 * Set up initial regions
 * @param {Object} gameState - Game state to modify
 */
function setupRegions(gameState) {
  // This would load regions from regions.json and set up initial units
  gameState.regions = [];
  
  // Example: Add Minas Tirith with Gondor units
  gameState.regions.push({
    regionId: '53',
    controlledBy: '3', // Gondor
    units: [{
      type: 'regular',
      count: 3,
      faction: 'Free',
      nation: '3', // Gondor
      active: false
    }]
  });
  
  // Other regions would be added based on the scenario
}

/**
 * Set up initial decks
 * @param {Object} gameState - Game state to modify
 */
function setupDecks(gameState) {
  // This would load cards from eventcards.json and combatcards.json
  gameState.cards = {
    eventDeck: [],
    eventDiscard: [],
    combatDeck: [],
    combatDiscard: [],
    playerHands: new Map()
  };
  
  // Initialize empty hands for each player
  gameState.players.forEach(player => {
    gameState.cards.playerHands.set(player.playerId, []);
  });
  
  // Populate decks (would be implemented with actual card data)
}

module.exports = {
  initializeGameState
};
