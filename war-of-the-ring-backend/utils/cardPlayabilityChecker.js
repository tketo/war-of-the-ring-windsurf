/**
 * Card Playability Checker for War of the Ring
 * 
 * This utility provides functions to check if a card can be played
 * based on the current game state and various conditions.
 */

const { evaluateCondition } = require('./conditionEvaluator');

/**
 * Check if a card can be played based on the current game state
 * @param {Object} gameState - Current game state
 * @param {Object} card - Card to check
 * @param {Object} context - Context for the check (playerId, regionId, etc.)
 * @returns {Object} - Result with isPlayable flag and reasons
 */
function checkCardPlayability(gameState, card, context) {
  // Initialize result
  const result = {
    isPlayable: true,
    reasons: []
  };
  
  // Skip check if card doesn't have playability conditions
  if (!card.playabilityConditions) {
    return result;
  }
  
  // Create context with card-specific information
  const playabilityContext = {
    ...context,
    cardId: card.id,
    cardType: card.type,
    cardTitle: card.title
  };
  
  // Check each condition
  for (const condition of card.playabilityConditions) {
    // Ensure condition is in the correct format for the condition evaluator
    const formattedCondition = condition.condition;
    
    // Evaluate the condition
    const conditionMet = evaluateCondition(formattedCondition, gameState, playabilityContext);
    
    if (!conditionMet) {
      result.isPlayable = false;
      result.reasons.push(condition.failureMessage || 'Card cannot be played due to game conditions');
    }
  }
  
  return result;
}

/**
 * Check if a card can be played based on its playConditions and the current game state
 * @param {Object} gameState - Current game state
 * @param {Object} card - Card to check
 * @param {Object} context - Context for the check (playerId, playerTeam, etc.)
 * @returns {Boolean} - Whether the card can be played
 */
function isCardPlayable(gameState, card, context) {
  // Ensure context is properly defined with all variables that might be used in conditions
  const evaluationContext = {
    ...context,
    playerId: context.playerId,
    playerTeam: context.playerTeam,
    characterId: context.characterId, // Important for variable substitution tests
    cardId: card.id,
    cardType: card.type,
    cardTitle: card.title
  };
  
  // Check if the selected die matches the card type
  if (!hasEnoughActionDice(gameState, card, evaluationContext)) {
    console.log(`Card ${card.title} cannot be played: incompatible with selected die`);
    return false;
  }
  
  // Check if it's the player's team's turn
  if (gameState.turnState.activeTeam !== evaluationContext.playerTeam) {
    console.log(`Card ${card.title} cannot be played: not player's team turn`);
    return false;
  }
  
  // Check if card has specific play conditions
  if (card.playConditions) {
    console.log('Evaluating play conditions:', JSON.stringify(card.playConditions));
    console.log('With context:', JSON.stringify(evaluationContext));
    
    const conditionMet = evaluateCondition(card.playConditions, gameState, evaluationContext);
    console.log('Condition met:', conditionMet);
    
    if (!conditionMet) {
      console.log(`Card ${card.title} cannot be played: play conditions not met`);
      return false;
    }
  }
  
  // Check combat-specific conditions for combat cards
  if (card.type === 'combat') {
    if (!canPlayCombatCard(gameState, card, evaluationContext)) {
      console.log(`Card ${card.title} cannot be played: combat conditions not met`);
      return false;
    }
  }
  
  // If all checks pass, the card is playable
  return true;
}

/**
 * Get all playable cards for a player
 * @param {Object} gameState - Current game state
 * @param {String} playerId - ID of the player
 * @returns {Array} - Array of playable cards with reasons
 */
function getPlayableCards(gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return [];
  }
  
  const context = {
    playerId,
    playerTeam: player.team,
    fellowshipRegion: gameState.fellowship?.location
  };
  
  // Check each card in the player's hand
  return player.hand.map(card => {
    const isPlayable = isCardPlayable(gameState, card, context);
    return {
      ...card,
      isPlayable
    };
  });
}

/**
 * Check if a character card can be played in a specific region
 * @param {Object} gameState - Current game state
 * @param {Object} card - Card to check
 * @param {String} regionId - ID of the region
 * @param {Object} context - Additional context
 * @returns {Boolean} - Whether the card can be played
 */
function canPlayCharacterInRegion(gameState, card, regionId, context) {
  // Skip check if card is not a character card
  if (card.type !== 'character') {
    return false;
  }
  
  const region = gameState.regions[regionId];
  if (!region) {
    return false;
  }
  
  // Create context with region information
  const regionContext = {
    ...context,
    cardId: card.id,
    cardType: card.type,
    regionId
  };
  
  // Get the player's team, supporting both playerTeam and team for backward compatibility
  const playerTeam = context.playerTeam || context.team;
  
  // Check if the region is controlled by the player's team
  return region.control === playerTeam;
}

/**
 * Check if the selected die is compatible with the card type
 * @param {Object} gameState - Current game state
 * @param {Object} card - Card to check
 * @param {Object} context - Additional context
 * @returns {Boolean} - Whether the selected die is compatible with the card
 */
function hasEnoughActionDice(gameState, card, context) {
  // Get required die type for the card
  const requiredDieType = getDieTypeForCard(card);
  if (!requiredDieType) {
    return false;
  }
  
  // Check if there is a selected die and if it matches the required type
  const selectedDie = gameState.turnState?.selectedDie;
  if (!selectedDie) {
    return false;
  }
  
  // Check if the selected die matches the required type
  return selectedDie.type === requiredDieType;
}

/**
 * Get the required die type for a card
 * @param {Object} card - Card to check
 * @returns {String|null} - Required die type or null
 */
function getDieTypeForCard(card) {
  switch (card.type) {
    case 'character':
      return 'character';
    case 'army':
      return 'army';
    case 'muster':
      return 'muster';
    case 'event':
      return 'event';
    case 'strategy':
      return 'will';
    case 'combat':
      // Combat cards can be played with event dice
      return 'event';
    default:
      return null;
  }
}

/**
 * Check if a combat card can be played in the current combat
 * @param {Object} gameState - Current game state
 * @param {Object} card - Card to check
 * @param {Object} context - Additional context
 * @returns {Boolean} - Whether the card can be played
 */
function canPlayCombatCard(gameState, card, context) {
  // Skip check if card is not a combat card
  if (card.type !== 'combat') {
    return false;
  }
  
  // Skip check if there's no active combat
  if (!gameState.combatState || !gameState.combatState.active) {
    console.log('No active combat');
    return false;
  }
  
  // Check if it's the player's turn in combat
  if (gameState.combatState.currentPlayer !== context.playerId) {
    console.log(`Not player's turn in combat. Current: ${gameState.combatState.currentPlayer}, Player: ${context.playerId}`);
    return false;
  }
  
  // Check if the card is valid for the combat type
  const combatType = gameState.combatState.type;
  const validCombatTypes = card.combatTypes || [];
  
  const isValidType = validCombatTypes.includes('all') || validCombatTypes.includes(combatType);
  if (!isValidType) {
    console.log(`Invalid combat type. Card supports: ${validCombatTypes.join(', ')}, Current: ${combatType}`);
    return false;
  }
  
  return true;
}

module.exports = {
  checkCardPlayability,
  isCardPlayable,
  getPlayableCards,
  canPlayCharacterInRegion,
  hasEnoughActionDice,
  canPlayCombatCard,
  getDieTypeForCard // Export for testing
};
