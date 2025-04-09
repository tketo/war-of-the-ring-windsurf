/**
 * AI Manager for War of the Ring
 * 
 * This module manages AI strategies and provides a unified interface for using AI in the game.
 */

const RandomStrategy = require('./randomStrategy');
const QuellerStrategy = require('./quellerStrategy');
const FellowshipStrategy = require('./fellowshipStrategy');

class AIManager {
  constructor() {
    // Available AI strategies
    this.strategies = {
      random: RandomStrategy,
      queller: QuellerStrategy,
      fellowship: FellowshipStrategy
    };
    
    // Active AI instances
    this.activeAIs = new Map();
  }

  /**
   * Get information about available AI strategies
   * @returns {Array} Array of strategy information objects
   */
  getAvailableStrategies() {
    const strategies = [];
    
    for (const [key, Strategy] of Object.entries(this.strategies)) {
      // Create temporary instance to get info
      const tempInstance = new Strategy();
      strategies.push({
        id: key,
        ...tempInstance.getInfo()
      });
    }
    
    return strategies;
  }

  /**
   * Create an AI instance for a game
   * @param {String} gameId - ID of the game
   * @param {String} faction - Faction the AI will play ('freePeoples' or 'shadow')
   * @param {String} strategyId - ID of the strategy to use
   * @param {Object} options - Additional options for the AI
   * @returns {Object} The created AI instance
   */
  createAI(gameId, faction, strategyId = 'random', options = {}) {
    // Check if strategy exists
    if (!this.strategies[strategyId]) {
      throw new Error(`AI strategy '${strategyId}' not found`);
    }
    
    // Create AI instance
    const Strategy = this.strategies[strategyId];
    const ai = new Strategy(options);
    
    // Store in active AIs map
    const aiKey = `${gameId}:${faction}`;
    this.activeAIs.set(aiKey, ai);
    
    return ai;
  }

  /**
   * Get an existing AI instance
   * @param {String} gameId - ID of the game
   * @param {String} faction - Faction the AI is playing
   * @returns {Object|null} The AI instance or null if not found
   */
  getAI(gameId, faction) {
    const aiKey = `${gameId}:${faction}`;
    return this.activeAIs.get(aiKey) || null;
  }

  /**
   * Remove an AI instance
   * @param {String} gameId - ID of the game
   * @param {String} faction - Faction the AI is playing
   */
  removeAI(gameId, faction) {
    const aiKey = `${gameId}:${faction}`;
    this.activeAIs.delete(aiKey);
  }

  /**
   * Determine the next move for an AI
   * @param {String} gameId - ID of the game
   * @param {String} faction - Faction the AI is playing
   * @param {Object} gameState - Current game state
   * @returns {Object|null} Move object or null if AI not found
   */
  determineMove(gameId, faction, gameState) {
    const ai = this.getAI(gameId, faction);
    
    if (!ai) {
      return null;
    }
    
    return ai.determineMove(gameState, faction);
  }

  /**
   * Notify AI of an opponent's move
   * @param {String} gameId - ID of the game
   * @param {String} faction - Faction the AI is playing
   * @param {Object} gameState - Current game state
   * @param {Object} opponentMove - The move the opponent just made
   */
  notifyOpponentMove(gameId, faction, gameState, opponentMove) {
    const ai = this.getAI(gameId, faction);
    
    if (ai && typeof ai.reactToOpponentMove === 'function') {
      ai.reactToOpponentMove(gameState, opponentMove, faction);
    }
  }
}

// Create and export a singleton instance
const aiManager = new AIManager();
module.exports = aiManager;
