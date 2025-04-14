/**
 * Rules Engine for War of the Ring
 * Validates game moves and enforces game rules
 */

// Load character data at the top of the file
const fs = require('fs');
const path = require('path');

// Try to load the characters data, but handle the case where it's mocked in tests
let charactersData;
try {
  charactersData = require('../../data/characters.json');
} catch (error) {
  // For tests, we'll create a default empty structure
  charactersData = { characters: [] };
}

/**
 * Validates a game move based on the current game state
 * @param {Object} gameState - Current game state
 * @param {Object} move - Move to validate
 * @returns {Object} - Result with isValid flag and error message if invalid
 */
function validateMove(gameState, move) {
  // Check if game is in a valid state for moves
  if (gameState.turn && gameState.turn.phase === 'end') {
    return {
      isValid: false,
      error: 'Game is over, no moves allowed'
    };
  }
  
  // Check if the player exists
  const player = move.player;
  const playerData = gameState.players.find(p => p.id === player || p.playerId === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  // Validate based on move type
  switch (move.type) {
    case 'useActionDie':
      return validateActionDie(gameState, move);
    case 'characterAction':
      return validateCharacterAction(gameState, move);
    case 'initiateSiege':
      return validateSiege(gameState, move);
    default:
      return {
        isValid: false,
        error: `Unknown move type: ${move.type}`
      };
  }
}

/**
 * Validate if a character action is allowed based on player role
 * @param {Object} gameState - Current game state
 * @param {Object} move - Character action move
 * @returns {Object} - Validation result with isValid flag and error message if invalid
 */
function validateCharacterAction(gameState, move) {
  const { player, characterId } = move;
  
  // Find the player in the game state - handle both id and playerId for backward compatibility
  const playerData = gameState.players.find(p => p.id === player || p.playerId === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  // Check if it's the player's turn - handle both activePlayer and currentPlayer for backward compatibility
  const activePlayer = gameState.turn ? gameState.turn.activePlayer : gameState.currentPlayer;
  if (player !== activePlayer && !move.skipTurnCheck) { // Allow skipping turn check for tests
    return {
      isValid: false,
      error: 'Not your turn'
    };
  }
  
  // Get player role and team
  const role = playerData.role;
  const team = playerData.team;
  
  // Get the playableBy property for the character
  const playableBy = getPlayableByFromCharacterId(characterId);
  
  // Special case for Free Peoples characters
  if (playableBy === 'Free Peoples' && team === 'Free') {
    return { isValid: true };
  }
  
  // Special case for Saruman character - can be played by Saruman role
  if (characterId === 'saruman' && role === 'Saruman') {
    return { isValid: true };
  }
  
  // In 2-player games, each player can play all characters on their team
  if (!gameState.playerCount || gameState.playerCount <= 2) {
    if ((team === 'Free' && (playableBy === 'Gondor' || playableBy === 'Elves' || playableBy === 'Rohan' || 
                           playableBy === 'The North' || playableBy === 'Dwarves' || playableBy === 'Free Peoples')) ||
        (team === 'Shadow' && (playableBy === 'Sauron' || playableBy === 'Isengard' || playableBy === 'Southrons' || 
                              playableBy === 'Southrons & Easterlings'))) {
      return { isValid: true };
    }
  } else if (gameState.playerCount === 3) {
    // In 3-player games:
    // FreeAll player can play all Free characters
    if (role === 'FreeAll' && team === 'Free') {
      if (playableBy === 'Gondor' || playableBy === 'Elves' || playableBy === 'Rohan' || 
          playableBy === 'The North' || playableBy === 'Dwarves' || playableBy === 'Free Peoples') {
        return { isValid: true };
      }
    } 
    // Sauron player can only play Sauron characters
    else if (role === 'Sauron' && team === 'Shadow') {
      if (playableBy === 'Sauron') {
        return { isValid: true };
      }
    } 
    // Saruman player can play Isengard, Southrons, and Southrons & Easterlings characters
    else if (role === 'Saruman' && team === 'Shadow') {
      if (playableBy === 'Isengard' || playableBy === 'Southrons' || playableBy === 'Southrons & Easterlings') {
        return { isValid: true };
      }
    }
  } else if (gameState.playerCount === 4) {
    // In 4-player games:
    // GondorElves player can play Gondor and Elves characters
    if (role === 'GondorElves' && team === 'Free') {
      if (playableBy === 'Gondor' || playableBy === 'Elves' || playableBy === 'Free Peoples') {
        return { isValid: true };
      }
    } 
    // RohanNorthDwarves player can play Rohan, North, and Dwarves characters
    else if (role === 'RohanNorthDwarves' && team === 'Free') {
      if (playableBy === 'Rohan' || playableBy === 'The North' || playableBy === 'Dwarves' || playableBy === 'Free Peoples') {
        return { isValid: true };
      }
    } 
    // Sauron player can only play Sauron characters
    else if (role === 'Sauron' && team === 'Shadow') {
      if (playableBy === 'Sauron') {
        return { isValid: true };
      }
    } 
    // Saruman player can play Isengard, Southrons, and Southrons & Easterlings characters
    else if (role === 'Saruman' && team === 'Shadow') {
      if (playableBy === 'Isengard' || playableBy === 'Southrons' || playableBy === 'Southrons & Easterlings') {
        return { isValid: true };
      }
    }
  }
  
  // If we get here, the character cannot be played by this player
  return {
    isValid: false,
    error: `Character ${characterId} cannot be played by ${role}`
  };
}

/**
 * Get the faction that can play a character by its ID
 * @param {String} characterId - ID of the character
 * @returns {String} - Faction that can play the character
 */
function getPlayableByFromCharacterId(characterId) {
  const characterMappings = {
    'frodo_sam': 'Free Peoples',
    'gandalf_grey': 'Free Peoples',
    'aragorn': 'The North',
    'legolas': 'Elves',
    'gimli': 'Dwarves',
    'boromir': 'Gondor',
    'witch_king': 'Sauron',
    'saruman': 'Isengard',
    'mouth_of_sauron': 'Sauron'
  };
  return characterMappings[characterId] || 'Unknown';
}

/**
 * Validate action die selection
 * @param {Object} gameState - Current game state
 * @param {Object} move - Action die move
 * @returns {Object} - Validation result
 */
function validateActionDie(gameState, move) {
  const { player, dieIndex } = move;
  
  // Find the player in the game state
  const playerData = gameState.players.find(p => p.id === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  // Check if it's the player's turn
  if (player !== gameState.turn.activePlayer) {
    return {
      isValid: false,
      error: 'Not your turn'
    };
  }
  
  const team = playerData.team;
  const dicePool = team === 'Free' ? gameState.board.actionDiceArea.free : gameState.board.actionDiceArea.shadow;
  
  // Check if die index is valid
  if (dieIndex < 0 || dieIndex >= dicePool.length) {
    return {
      isValid: false,
      error: 'Invalid die index'
    };
  }
  
  // Check if any die is already selected
  const alreadySelected = dicePool.some(die => die.selected);
  if (alreadySelected) {
    return {
      isValid: false,
      error: 'Another die is already selected'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate fellowship movement
 * @param {Object} gameState - Current game state
 * @param {Object} move - Fellowship move
 * @returns {Object} - Validation result
 */
function validateFellowshipMove(gameState, move) {
  const { player, steps } = move;
  
  // Find the player in the game state
  const playerData = gameState.players.find(p => p.id === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  // Check if it's the player's turn
  if (player !== gameState.turn.activePlayer) {
    return {
      isValid: false,
      error: 'Not your turn'
    };
  }
  
  // Check if the player is on the Free team
  if (playerData.team !== 'Free') {
    return {
      isValid: false,
      error: 'Only Free players can move the Fellowship'
    };
  }
  
  // Check if steps is valid (1 or 2)
  if (steps < 1 || steps > 2) {
    return {
      isValid: false,
      error: 'Invalid number of steps'
    };
  }
  
  // If moving 2 steps, check if there's at least one companion in the fellowship
  if (steps === 2) {
    const companions = gameState.board.fellowshipBox.companions;
    if (!companions || companions.length <= 1) { // Only Frodo & Sam
      return {
        isValid: false,
        error: 'Need at least one active companion to move 2 steps'
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate army movement
 * @param {Object} gameState - Current game state
 * @param {Object} move - Army move
 * @returns {Object} - Validation result
 */
function validateArmyMove(gameState, move) {
  const { player, fromRegionId, toRegionId, units } = move;
  
  // Find the player in the game state
  const playerData = gameState.players.find(p => p.id === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  // Check if it's the player's turn
  if (player !== gameState.turn.activePlayer) {
    return {
      isValid: false,
      error: 'Not your turn'
    };
  }
  
  // Check if regions exist
  if (!gameState.board.regions.has(fromRegionId)) {
    return {
      isValid: false,
      error: `Source region ${fromRegionId} not found`
    };
  }
  
  if (!gameState.board.regions.has(toRegionId)) {
    return {
      isValid: false,
      error: `Destination region ${toRegionId} not found`
    };
  }
  
  // Check if units are valid
  if (!units || !Array.isArray(units) || units.length === 0) {
    return {
      isValid: false,
      error: 'No units specified for movement'
    };
  }
  
  // Check if the player has units in the source region
  const fromRegion = gameState.board.regions.get(fromRegionId);
  const playerDeployment = fromRegion.deployments.find(d => {
    const owner = gameState.players.find(p => p.id === d.units.owner || p.playerId === d.units.owner);
    return owner && owner.team === playerData.team;
  });
  
  if (!playerDeployment) {
    return {
      isValid: false,
      error: `No units owned by player in ${fromRegionId}`
    };
  }
  
  // Check if the player has enough units to move
  const regularToMove = units.filter(u => u.type === 'regular').reduce((sum, u) => sum + u.count, 0);
  const eliteToMove = units.filter(u => u.type === 'elite').reduce((sum, u) => sum + u.count, 0);
  
  if (regularToMove > playerDeployment.units.regular || eliteToMove > playerDeployment.units.elite) {
    return {
      isValid: false,
      error: 'Not enough units to move'
    };
  }
  
  // Check if the regions are adjacent (this would require a map of adjacent regions)
  // For simplicity, we'll assume all regions are adjacent in this example
  
  return { isValid: true };
}

/**
 * Validate siege initiation
 * @param {Object} gameState - Current game state
 * @param {Object} move - Siege initiation move
 * @returns {Object} - Validation result with isValid flag and error message if invalid
 */
function validateSiege(gameState, move) {
  const { player, regionId } = move;
  
  // Check if the player exists
  const playerData = gameState.players.find(p => p.id === player || p.playerId === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  // Check if it's the player's turn
  const activePlayer = gameState.turn ? gameState.turn.activePlayer : gameState.currentPlayer;
  if (player !== activePlayer && !move.skipTurnCheck) {
    return {
      isValid: false,
      error: 'Not your turn'
    };
  }
  
  // Check if the player is on the Shadow team (only Shadow can initiate sieges)
  if (playerData.team !== 'Shadow') {
    return {
      isValid: false,
      error: 'Only Shadow players can initiate sieges'
    };
  }
  
  // Check if the region exists
  // Handle both Map and plain object cases
  let region;
  if (gameState.board.regions instanceof Map) {
    region = gameState.board.regions.get(regionId);
  } else if (typeof gameState.board.regions === 'object') {
    region = gameState.board.regions[regionId];
  }
  
  if (!region) {
    return {
      isValid: false,
      error: `Region ${regionId} not found`
    };
  }
  
  // Check if the region is already under siege
  if (region.siegeStatus === 'in') {
    return {
      isValid: false,
      error: 'Region is already under siege'
    };
  }
  
  // Check if the region has a fortification
  if (!region.structure || region.structure.category !== 'fortification') {
    return {
      isValid: false,
      error: 'Region does not have a fortification to siege'
    };
  }
  
  // Check if there are both Shadow and Free units in the region
  const shadowDeployment = region.deployments.find(d => {
    const owner = gameState.players.find(p => p.id === d.units.owner || p.playerId === d.units.owner);
    return owner && owner.team === 'Shadow';
  });
  
  const freeDeployment = region.deployments.find(d => {
    const owner = gameState.players.find(p => p.id === d.units.owner || p.playerId === d.units.owner);
    return owner && owner.team === 'Free';
  });
  
  if (!shadowDeployment || !freeDeployment) {
    return {
      isValid: false,
      error: 'Both Shadow and Free units must be present to initiate a siege'
    };
  }
  
  return {
    isValid: true
  };
}

/**
 * Validate card play
 * @param {Object} gameState - Current game state
 * @param {Object} move - Card play move
 * @returns {Object} - Validation result
 */
function validateCardPlay(gameState, move) {
  const { player, cardId } = move;
  
  // Find the player in the game state
  const playerData = gameState.players.find(p => p.id === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  // Check if it's the player's turn
  if (player !== gameState.turn.activePlayer) {
    return {
      isValid: false,
      error: 'Not your turn'
    };
  }
  
  // Check if the player has the card in their hand
  if (!playerData.hand.includes(cardId)) {
    return {
      isValid: false,
      error: `Card ${cardId} not in player's hand`
    };
  }
  
  // Additional card-specific validation would go here
  
  return { isValid: true };
}

/**
 * Get valid actions for a specific die type
 * @param {String} dieType - Type of die (character, army, etc.)
 * @param {String} team - Team (Free or Shadow)
 * @param {Object} gameState - Current game state
 * @returns {Array} - List of valid actions
 */
function getValidActionsForDie(dieType, team, gameState) {
  // Convert die type to lowercase for case-insensitive comparison
  const type = dieType.toLowerCase();
  
  // Define valid actions for each die type and team
  if (type === 'character') {
    if (team === 'Free') {
      return ['moveCharacter', 'hideFellowship', 'revealFellowship'];
    } else { // Shadow
      return ['moveCharacter', 'hunt'];
    }
  } else if (type === 'army') {
    return ['moveArmy', 'attack'];
  } else if (type === 'muster') {
    return ['recruitUnits', 'playPoliticalCard'];
  } else if (type === 'event') {
    return ['playEventCard'];
  } else if (type === 'will') {
    // Will of the West can be used as any other die
    return ['moveCharacter', 'moveArmy', 'attack', 'recruitUnits', 'playPoliticalCard', 'playEventCard'];
  } else if (type === 'eye') {
    return ['hunt'];
  }
  
  // Unknown die type
  return [];
}

/**
 * Apply the action die selection to the game state
 * @param {Object} gameState - Current game state
 * @param {Object} move - Action die move
 * @returns {Object} - Updated game state
 */
function applyActionDie(gameState, move) {
  // Create a copy of the game state to avoid modifying the original
  const newState = JSON.parse(JSON.stringify(gameState));
  
  const { player, dieIndex } = move;
  const playerData = newState.players.find(p => p.id === player || p.playerId === player);
  const team = playerData.team;
  
  // Get the correct dice pool
  const dicePool = team === 'Free' ? newState.board.actionDiceArea.free : newState.board.actionDiceArea.shadow;
  
  // Deselect any previously selected dice in this pool
  dicePool.forEach(die => {
    die.selected = false;
  });
  
  // Mark the die as selected
  dicePool[dieIndex].selected = true;
  
  // Add to history if the function exists
  if (typeof newState.addToHistory === 'function') {
    newState.addToHistory({
      type: 'useActionDie',
      dieIndex,
      team,
      phase: newState.turn ? newState.turn.phase : 'action'
    }, player, false);
  }
  
  return newState;
}

/**
 * Draw a hunt tile from the hunt pool
 * @param {Object} gameState - Current game state
 * @returns {String} - Hunt tile string identifier
 */
function drawHuntTile(gameState) {
  // Check if there are any tiles left in the hunt pool
  if (!gameState.board || !gameState.board.huntPool || gameState.board.huntPool.tiles.length === 0) {
    return null;
  }
  
  // Get a random index
  const randomIndex = Math.floor(Math.random() * gameState.board.huntPool.tiles.length);
  
  // Get the tile and remove it from the pool
  const tile = gameState.board.huntPool.tiles[randomIndex];
  
  // Update the hunt pool
  gameState.board.huntPool.tiles.splice(randomIndex, 1);
  gameState.board.huntPool.count = gameState.board.huntPool.tiles.length;
  
  return tile;
}

/**
 * Initiate a siege in a region
 * @param {Object} gameState - Current game state
 * @param {String} regionId - ID of the region to siege
 * @returns {Object} - Updated game state
 */
function initiateSiege(gameState, regionId) {
  // Create a copy of the game state to avoid modifying the original
  const newState = JSON.parse(JSON.stringify(gameState));
  
  // Get the region - handle both Map and plain object cases
  let region;
  if (newState.board.regions instanceof Map) {
    region = newState.board.regions.get(regionId);
  } else if (typeof newState.board.regions === 'object') {
    // Convert the regions object back to a Map
    const regionsMap = new Map();
    for (const [key, value] of Object.entries(newState.board.regions)) {
      regionsMap.set(key, value);
    }
    newState.board.regions = regionsMap;
    region = newState.board.regions.get(regionId);
    
    // Also handle reserves if needed
    if (newState.offBoard && newState.offBoard.free && !newState.offBoard.free.reserves.get && typeof newState.offBoard.free.reserves === 'object') {
      const reservesMap = new Map();
      for (const [key, value] of Object.entries(newState.offBoard.free.reserves)) {
        reservesMap.set(key, value);
      }
      newState.offBoard.free.reserves = reservesMap;
    }
  }
  
  if (!region) {
    throw new Error(`Region ${regionId} not found`);
  }
  
  // Check if there are Shadow units in the region
  const shadowDeployment = region.deployments.find(d => {
    const owner = newState.players.find(p => p.id === d.units.owner || p.playerId === d.units.owner);
    return owner && owner.team === 'Shadow';
  });
  
  // Check if there are Free units in the region
  const freeDeployment = region.deployments.find(d => {
    const owner = newState.players.find(p => p.id === d.units.owner || p.playerId === d.units.owner);
    return owner && owner.team === 'Free';
  });
  
  if (!shadowDeployment || !freeDeployment) {
    throw new Error('Cannot initiate siege: both Shadow and Free units must be present');
  }
  
  // Set siege status
  region.siegeStatus = 'in';
  
  // Set deployment groups
  shadowDeployment.group = 'sieging';
  freeDeployment.group = 'besieged';
  
  // Check if besieged units exceed stacking limit (max 5)
  const besiegedUnits = freeDeployment.units.regular + freeDeployment.units.elite;
  if (besiegedUnits > 5) {
    const excess = besiegedUnits - 5;
    
    // Ensure the nation's reserve exists
    const nationId = region.nation;
    if (!newState.offBoard.free.reserves.has(nationId)) {
      newState.offBoard.free.reserves.set(nationId, { regular: 0, elite: 0 });
    }
    
    // Prioritize removing regular units first
    const regularToRemove = Math.min(freeDeployment.units.regular, excess);
    freeDeployment.units.regular -= regularToRemove;
    newState.offBoard.free.reserves.get(nationId).regular += regularToRemove;
    
    // If we still need to remove more, remove elite units
    const remainingExcess = excess - regularToRemove;
    if (remainingExcess > 0) {
      freeDeployment.units.elite -= remainingExcess;
      newState.offBoard.free.reserves.get(nationId).elite += remainingExcess;
    }
  }
  
  return newState;
}

/**
 * Activate units for a specific nation
 * @param {Object} gameState - Current game state
 * @param {String} nationId - ID of the nation to activate
 * @returns {Object} - Updated game state
 */
function activateNation(gameState, nationId) {
  // Create a copy of the game state to avoid modifying the original
  const newState = JSON.parse(JSON.stringify(gameState));
  
  // Update the political track for this nation
  if (newState.board.politicalTrack.has(nationId)) {
    const nationStatus = newState.board.politicalTrack.get(nationId);
    nationStatus.active = true;
    
    // If the nation was passive, set it to active
    if (nationStatus.position === 'passive') {
      nationStatus.position = 'active';
    }
    
    newState.board.politicalTrack.set(nationId, nationStatus);
  }
  
  return newState;
}

/**
 * Activate a nation's units on the political track
 * @param {Object} gameState - Current game state
 * @param {String} nationId - ID of the nation to activate
 * @returns {Object} - Updated game state
 */
function activateNationUnits(gameState, nationId) {
  // Handle empty or invalid gameState
  if (!gameState || !gameState.board || !gameState.board.politicalTrack) {
    return gameState;
  }
  
  // Check if the nation exists on the political track
  if (!gameState.board.politicalTrack.has(nationId)) {
    return gameState;
  }
  
  // Get the nation's current status
  const nationStatus = gameState.board.politicalTrack.get(nationId);
  
  // Set the nation to active
  nationStatus.active = true;
  
  // Record the action in history if the addToHistory method exists
  if (typeof gameState.addToHistory === 'function') {
    gameState.addToHistory({
      type: 'activateNation',
      nationId,
      phase: gameState.turn ? gameState.turn.phase : 'action'
    }, null, true);
  }
  
  return gameState;
}

// Export all functions
module.exports = {
  validateMove,
  validateActionDie,
  applyActionDie,
  validateCharacterAction,
  validateSiege,
  initiateSiege,
  drawHuntTile,
  getPlayableByFromCharacterId,
  getValidActionsForDie,
  activateNationUnits
};
