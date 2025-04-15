/**
 * Utility functions for inferring game state from piece placement
 * This replaces flag-based state tracking with position-based inference
 */

/**
 * Helper function to create a deep copy of state with Maps
 * @param {Object} state - The state to copy
 * @returns {Object} - Deep copy with Maps preserved
 */
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

/**
 * Checks if a region is under siege based on deployment groups
 * @param {Object} gameState - The current game state
 * @param {String} regionId - The ID of the region to check
 * @returns {Boolean} - True if the region is under siege
 */
function hasSiege(gameState, regionId) {
  const region = gameState.board.regions.get(regionId);
  if (!region) return false;
  
  const besiegedDeployment = region.deployments.find(d => d.group === 'besieged');
  const siegingDeployment = region.deployments.find(d => d.group === 'sieging');
  
  return !!(besiegedDeployment && siegingDeployment);
}

/**
 * Initiates a siege by updating deployment groups
 * @param {Object} gameState - The current game state
 * @param {String} regionId - The ID of the region to put under siege
 * @returns {Object} - Updated game state
 */
function initiateSiege(gameState, regionId) {
  // Create a deep copy of the state
  const newState = deepCopyState(gameState);
  
  const region = newState.board.regions.get(regionId);
  if (!region) return newState;
  
  // Find Free and Shadow deployments
  const freeDeployment = region.deployments.find(d => 
    d.units.owner && gameState.players.find(p => p.id === d.units.owner && p.team === 'Free')
  );
  
  const shadowDeployment = region.deployments.find(d => 
    d.units.owner && gameState.players.find(p => p.id === d.units.owner && p.team === 'Shadow')
  );
  
  if (!freeDeployment || !shadowDeployment) return newState;
  
  // Update deployment groups
  freeDeployment.group = 'besieged';
  shadowDeployment.group = 'sieging';
  
  // Apply stacking limit for besieged units (max 5)
  const totalFreeUnits = freeDeployment.units.regular + freeDeployment.units.elite;
  if (totalFreeUnits > 5) {
    const excessUnits = totalFreeUnits - 5;
    
    // Prioritize removing regular units
    const regularToRemove = Math.min(freeDeployment.units.regular, excessUnits);
    freeDeployment.units.regular -= regularToRemove;
    
    // If we still need to remove more, remove elite units
    const remainingExcess = excessUnits - regularToRemove;
    if (remainingExcess > 0) {
      freeDeployment.units.elite -= remainingExcess;
    }
    
    // Add excess units to reserves
    if (!newState.offBoard.free.reserves.has(region.nation)) {
      newState.offBoard.free.reserves.set(region.nation, { regular: 0, elite: 0 });
    }
    
    const reserves = newState.offBoard.free.reserves.get(region.nation);
    reserves.regular += regularToRemove;
    reserves.elite += remainingExcess;
  }
  
  return newState;
}

/**
 * Lifts a siege by updating deployment groups
 * @param {Object} gameState - The current game state
 * @param {String} regionId - The ID of the region to lift siege from
 * @returns {Object} - Updated game state
 */
function liftSiege(gameState, regionId) {
  const newState = deepCopyState(gameState);
  
  const region = newState.board.regions.get(regionId);
  if (!region) return newState;
  
  // Update all deployments to normal
  region.deployments.forEach(d => {
    d.group = 'normal';
  });
  
  return newState;
}

/**
 * Checks if the fellowship is hidden
 * @param {Object} gameState - The current game state
 * @returns {Boolean} - True if the fellowship is hidden
 */
function isFellowshipHidden(gameState) {
  // Fellowship is hidden if no hunt tile is revealed
  return !gameState.board.huntBox.tile;
}

/**
 * Moves the fellowship and updates its hidden status
 * @param {Object} gameState - The current game state
 * @param {Number} steps - Number of steps to move
 * @param {Boolean} declarePosition - Whether to reveal the fellowship position
 * @returns {Object} - Updated game state
 */
function moveFellowship(gameState, steps, declarePosition) {
  const newState = deepCopyState(gameState);
  
  // Update progress
  newState.board.fellowshipTrack.progress.value += steps;
  
  // Update visibility
  if (declarePosition) {
    // If declaring position, add a hunt tile to make fellowship visible
    if (!newState.board.huntBox.tile) {
      newState.board.huntBox.tile = 'reveal_0';
    }
  } else {
    // If not declaring, remove hunt tile to make fellowship hidden
    newState.board.huntBox.tile = null;
  }
  
  return newState;
}

/**
 * Checks if a nation is at war (active on political track)
 * @param {Object} gameState - The current game state
 * @param {String} nationId - The ID of the nation to check
 * @returns {Boolean} - True if the nation is at war
 */
function isAtWar(gameState, nationId) {
  const nation = gameState.board.politicalTrack.get(nationId);
  if (!nation) return false;
  
  // A nation is at war if it's active on the political track
  return nation.face === 'active';
}

/**
 * Advances a nation on the political track
 * @param {Object} gameState - The current game state
 * @param {String} nationId - The ID of the nation to advance
 * @returns {Object} - Updated game state
 */
function advancePoliticalTrack(gameState, nationId) {
  const newState = deepCopyState(gameState);
  
  const nation = newState.board.politicalTrack.get(nationId);
  if (!nation) return newState;
  
  // Increment position
  nation.position += 1;
  
  // Check if nation becomes active (at war)
  if (nation.position >= 3 && nation.face === 'passive') {
    nation.face = 'active';
    
    // Additional logic for when a nation becomes active
    // e.g., making units available, updating victory conditions, etc.
  }
  
  return newState;
}

/**
 * Plays a card to the table area
 * @param {Object} gameState - The current game state
 * @param {String} playerId - The ID of the player playing the card
 * @param {String} cardId - The ID of the card being played
 * @param {String} cardType - The type of card (combat, event, character)
 * @returns {Object} - Updated game state
 */
function playCardToTable(gameState, playerId, cardId, cardType) {
  const newState = deepCopyState(gameState);
  
  // Find the player's team
  const player = newState.players.find(p => p.id === playerId);
  if (!player) return newState;
  
  const team = player.team.toLowerCase();
  
  // Find the card in the player's hand
  const cardIndex = newState.offBoard[team].hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return newState;
  
  // Remove the card from hand
  const card = newState.offBoard[team].hand.splice(cardIndex, 1)[0];
  
  // Add the card to the table
  if (!newState.board.tableCardsArea) {
    newState.board.tableCardsArea = new Map();
  }
  
  newState.board.tableCardsArea.set(cardId, {
    id: cardId,
    owner: playerId,
    type: cardType
  });
  
  return newState;
}

/**
 * Discards a card from the table
 * @param {Object} gameState - The current game state
 * @param {String} cardId - The ID of the card to discard
 * @returns {Object} - Updated game state
 */
function discardCardFromTable(gameState, cardId) {
  const newState = deepCopyState(gameState);
  
  // Check if the card is on the table
  if (!newState.board.tableCardsArea || !newState.board.tableCardsArea.has(cardId)) {
    return newState;
  }
  
  // Get the card
  const card = newState.board.tableCardsArea.get(cardId);
  
  // Find the player's team
  const player = newState.players.find(p => p.id === card.owner);
  if (!player) return newState;
  
  const team = player.team.toLowerCase();
  
  // Add the card to the discard pile
  newState.offBoard[team].discards.push({ id: cardId });
  
  // Remove the card from the table
  newState.board.tableCardsArea.delete(cardId);
  
  return newState;
}

/**
 * Selects an action die
 * @param {Object} gameState - The current game state
 * @param {String} team - The team selecting the die ('free' or 'shadow')
 * @param {Number} dieIndex - The index of the die in the action dice area
 * @returns {Object} - Updated game state
 */
function selectActionDie(gameState, team, dieIndex) {
  const newState = deepCopyState(gameState);
  
  // Validate team and die index
  if (team !== 'free' && team !== 'shadow') return newState;
  if (dieIndex < 0 || dieIndex >= newState.board.actionDiceArea[team].length) return newState;
  
  // Initialize selectedDiceArea if needed
  if (!newState.board.selectedDiceArea) {
    newState.board.selectedDiceArea = { free: [], shadow: [] };
  }
  
  // Add die to selected dice area
  newState.board.selectedDiceArea[team].push({
    index: dieIndex,
    type: newState.board.actionDiceArea[team][dieIndex].type
  });
  
  return newState;
}

/**
 * Uses a selected die and moves it to the used dice area
 * @param {Object} gameState - The current game state
 * @param {String} team - The team using the die ('free' or 'shadow')
 * @param {Number} selectedIndex - The index of the die in the selected dice area
 * @returns {Object} - Updated game state
 */
function useSelectedDie(gameState, team, selectedIndex) {
  const newState = deepCopyState(gameState);
  
  // Validate team and selected index
  if (team !== 'free' && team !== 'shadow') return newState;
  if (!newState.board.selectedDiceArea) return newState;
  if (selectedIndex < 0 || selectedIndex >= newState.board.selectedDiceArea[team].length) return newState;
  
  // Initialize usedDiceArea if needed
  if (!newState.board.usedDiceArea) {
    newState.board.usedDiceArea = { free: [], shadow: [] };
  }
  
  // Get the selected die
  const selectedDie = newState.board.selectedDiceArea[team][selectedIndex];
  
  // Get the original die from action dice area
  const originalDie = newState.board.actionDiceArea[team][selectedDie.index];
  
  // Add to used dice area
  newState.board.usedDiceArea[team].push({
    type: originalDie.type
  });
  
  // Remove from selected dice area
  newState.board.selectedDiceArea[team].splice(selectedIndex, 1);
  
  return newState;
}

/**
 * Places a die in the hunt box
 * @param {Object} gameState - The current game state
 * @param {String} team - The team placing the die ('free' or 'shadow')
 * @param {String} dieType - The type of die being placed
 * @returns {Object} - Updated game state
 */
function placeHuntBoxDie(gameState, team, dieType) {
  const newState = deepCopyState(gameState);
  
  // Initialize huntBox.diceArea if needed
  if (!newState.board.huntBox.diceArea) {
    newState.board.huntBox.diceArea = [];
  }
  
  // Add die to hunt box
  newState.board.huntBox.diceArea.push({
    type: dieType,
    team: team
  });
  
  return newState;
}

/**
 * Removes a die from the hunt box
 * @param {Object} gameState - The current game state
 * @param {Number} dieIndex - The index of the die in the hunt box dice area
 * @returns {Object} - Updated game state
 */
function removeHuntBoxDie(gameState, dieIndex) {
  const newState = deepCopyState(gameState);
  
  // Validate hunt box and index
  if (!newState.board.huntBox.diceArea) return newState;
  if (dieIndex < 0 || dieIndex >= newState.board.huntBox.diceArea.length) return newState;
  
  // Remove die from hunt box
  newState.board.huntBox.diceArea.splice(dieIndex, 1);
  
  return newState;
}

/**
 * Draws a hunt tile
 * @param {Object} gameState - The current game state
 * @returns {Object} - Updated game state with a hunt tile drawn
 */
function drawHuntTile(gameState) {
  const newState = deepCopyState(gameState);
  
  // Ensure we have hunt tiles
  if (!newState.board.huntPool.tiles || newState.board.huntPool.tiles.length === 0) {
    return newState;
  }
  
  // Draw a random tile
  const randomIndex = Math.floor(Math.random() * newState.board.huntPool.tiles.length);
  const drawnTile = newState.board.huntPool.tiles[randomIndex];
  
  // Remove from pool
  newState.board.huntPool.tiles.splice(randomIndex, 1);
  
  // Place in hunt box
  newState.board.huntBox.tile = drawnTile.id;
  
  return newState;
}

/**
 * Reserves a hunt tile for later use
 * @param {Object} gameState - The current game state
 * @param {String} tileId - The ID of the tile to reserve
 * @param {String} category - The category to reserve it under
 * @returns {Object} - Updated game state
 */
function reserveHuntTile(gameState, tileId, category) {
  const newState = deepCopyState(gameState);
  
  // Initialize category if needed
  if (!newState.board.reservedHuntTilesArea.has(category)) {
    newState.board.reservedHuntTilesArea.set(category, []);
  }
  
  // Add tile to reserved area
  const categoryTiles = newState.board.reservedHuntTilesArea.get(category);
  categoryTiles.push({ id: tileId });
  
  return newState;
}

module.exports = {
  hasSiege,
  initiateSiege,
  liftSiege,
  isFellowshipHidden,
  moveFellowship,
  isAtWar,
  advancePoliticalTrack,
  playCardToTable,
  discardCardFromTable,
  selectActionDie,
  useSelectedDie,
  placeHuntBoxDie,
  removeHuntBoxDie,
  drawHuntTile,
  reserveHuntTile
};
