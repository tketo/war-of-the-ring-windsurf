/**
 * Rules Engine for War of the Ring
 * Validates game moves and enforces game rules
 */

/**
 * Validates a game move based on the current game state
 * @param {Object} gameState - Current game state
 * @param {Object} move - Move to validate
 * @returns {Object} - Result with isValid flag and error message if invalid
 */
function validateMove(gameState, move) {
  // Default result
  const result = {
    isValid: true,
    error: null
  };

  try {
    // Check if game is in a valid state for moves
    if (!gameState || gameState.currentPhase === 'end') {
      return {
        isValid: false,
        error: 'Game is not in a valid state for moves'
      };
    }

    // Check if it's the player's turn
    if (move.player !== gameState.currentPlayer) {
      return {
        isValid: false,
        error: 'Not your turn'
      };
    }

    // Validate move based on type
    switch (move.type) {
      case 'playCard':
        return validateCardPlay(gameState, move);
      case 'moveUnits':
        return validateUnitMovement(gameState, move);
      case 'combat':
        return validateCombat(gameState, move);
      case 'useActionDie':
        return validateActionDie(gameState, move);
      case 'characterAction':
        return validateCharacterAction(gameState, move);
      case 'endPhase':
        return validateEndPhase(gameState, move);
      default:
        return {
          isValid: false,
          error: `Unknown move type: ${move.type}`
        };
    }
  } catch (error) {
    console.error('Error validating move:', error);
    return {
      isValid: false,
      error: `Validation error: ${error.message}`
    };
  }
}

/**
 * Validates playing a card
 * @param {Object} gameState - Current game state
 * @param {Object} move - Card play move
 * @returns {Object} - Validation result
 */
function validateCardPlay(gameState, move) {
  const { player, cardId } = move;
  
  // Check if player has the card
  const playerHand = gameState.cards.playerHands.get(player) || [];
  if (!playerHand.includes(cardId)) {
    return {
      isValid: false,
      error: 'Card not in player hand'
    };
  }
  
  // Additional card-specific validation would go here
  // This would check card conditions, prerequisites, etc.
  
  return { isValid: true };
}

/**
 * Validates unit movement
 * @param {Object} gameState - Current game state
 * @param {Object} move - Unit movement move
 * @returns {Object} - Validation result
 */
function validateUnitMovement(gameState, move) {
  const { fromRegion, toRegion, units } = move;
  
  // Check if regions exist
  const fromRegionData = gameState.regions.find(r => r.regionId === fromRegion);
  const toRegionData = gameState.regions.find(r => r.regionId === toRegion);
  
  if (!fromRegionData || !toRegionData) {
    return {
      isValid: false,
      error: 'Invalid region'
    };
  }
  
  // Check if regions are adjacent
  // This would require checking the region adjacency data
  
  // Check if player controls the units
  // This would check unit ownership
  
  return { isValid: true };
}

/**
 * Validates combat actions
 * @param {Object} gameState - Current game state
 * @param {Object} move - Combat move
 * @returns {Object} - Validation result
 */
function validateCombat(gameState, move) {
  const { region, attacker } = move;
  
  // Check if region exists
  const regionData = gameState.regions.find(r => r.regionId === region);
  if (!regionData) {
    return {
      isValid: false,
      error: 'Invalid region'
    };
  }
  
  // Check if there are opposing forces in the region
  const units = regionData.units;
  const attackerUnits = units.filter(u => u.faction === attacker);
  const defenderUnits = units.filter(u => u.faction !== attacker);
  
  if (attackerUnits.length === 0 || defenderUnits.length === 0) {
    return {
      isValid: false,
      error: 'No opposing forces in region'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates using an action die
 * @param {Object} gameState - Current game state
 * @param {Object} move - Action die move
 * @returns {Object} - Validation result
 */
function validateActionDie(gameState, move) {
  const { player, dieValue } = move;
  
  // Check if player has the die
  const playerDice = player === 'freePeoples' 
    ? gameState.actionDice.freePeoples 
    : gameState.actionDice.shadow;
  
  if (!playerDice.includes(dieValue)) {
    return {
      isValid: false,
      error: 'Action die not available'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates character actions
 * @param {Object} gameState - Current game state
 * @param {Object} move - Character action move
 * @returns {Object} - Validation result
 */
function validateCharacterAction(gameState, move) {
  const { characterId, action } = move;
  
  // Check if character exists and is active
  const character = gameState.characters.find(c => c.characterId === characterId);
  if (!character || character.status !== 'active') {
    return {
      isValid: false,
      error: 'Character not available for actions'
    };
  }
  
  // Character-specific action validation would go here
  
  return { isValid: true };
}

/**
 * Validates ending the current phase
 * @param {Object} gameState - Current game state
 * @param {Object} move - End phase move
 * @returns {Object} - Validation result
 */
function validateEndPhase(gameState, move) {
  // Check if phase can be ended (e.g., required actions completed)
  // This would depend on game-specific rules
  
  return { isValid: true };
}

/**
 * Applies a validated move to the game state
 * @param {Object} gameState - Current game state
 * @param {Object} move - Validated move to apply
 * @param {Boolean} commit - Whether to mark the move as committed in history
 * @returns {Object} - Updated game state
 */
function applyMove(gameState, move, commit = false) {
  // Clone the game state to avoid direct mutations
  const newState = JSON.parse(JSON.stringify(gameState));
  
  // Apply the move based on type
  switch (move.type) {
    case 'playCard':
      applyCardPlay(newState, move);
      break;
    case 'moveUnits':
      applyUnitMovement(newState, move);
      break;
    case 'combat':
      applyCombat(newState, move);
      break;
    case 'useActionDie':
      applyActionDie(newState, move);
      break;
    case 'characterAction':
      applyCharacterAction(newState, move);
      break;
    case 'endPhase':
      applyEndPhase(newState, move);
      break;
  }
  
  // Add move to history
  if (newState.history) {
    newState.history.push({
      state: JSON.parse(JSON.stringify(newState)),
      action: move,
      player: move.player,
      committed: commit,
      timestamp: Date.now()
    });
  }
  
  return newState;
}

// Implementation of move application functions would go here
function applyCardPlay(gameState, move) {
  // Implementation details
}

function applyUnitMovement(gameState, move) {
  // Implementation details
}

function applyCombat(gameState, move) {
  // Implementation details
}

function applyActionDie(gameState, move) {
  // Implementation details
}

function applyCharacterAction(gameState, move) {
  // Implementation details
}

function applyEndPhase(gameState, move) {
  // Implementation details
}

/**
 * Gets the persistent state of a card
 * @param {Object} gameState - Current game state
 * @param {String} cardId - ID of the card
 * @returns {Object} - Card state or null if not found
 */
function getCardState(gameState, cardId) {
  // Implementation would retrieve card-specific state
  return null;
}

/**
 * Updates the persistent state of a card
 * @param {Object} gameState - Current game state
 * @param {String} cardId - ID of the card
 * @param {Object} cardState - New card state
 * @returns {Object} - Updated game state
 */
function updateCardState(gameState, cardId, cardState) {
  // Implementation would update card-specific state
  return gameState;
}

module.exports = {
  validateMove,
  applyMove,
  getCardState,
  updateCardState
};
