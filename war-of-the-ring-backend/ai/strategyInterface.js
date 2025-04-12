/**
 * AI Strategy Interface for War of the Ring
 * 
 * This class defines the interface that all AI strategies must implement.
 * It provides common functionality and requires specific methods to be implemented by derived classes.
 */

class AIStrategy {
  /**
   * Constructor for AI Strategy
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.name = 'Base Strategy';
    this.description = 'Base strategy interface';
    this.difficulty = 'unknown';
    this.id = `ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.options = options;
  }

  /**
   * Get information about this AI strategy
   * @returns {Object} Information about the strategy
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      difficulty: this.difficulty
    };
  }

  /**
   * Determine the next move for the AI
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Object} Move object that can be processed by the rules engine
   */
  determineMove(gameState, team) {
    throw new Error('Method determineMove() must be implemented by derived classes');
  }

  /**
   * Generate all possible valid moves for the current game state
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Array} Array of possible move objects
   */
  generatePossibleMoves(gameState, team) {
    throw new Error('Method generatePossibleMoves() must be implemented by derived classes');
  }

  /**
   * Evaluate the current game state from the perspective of this AI's faction
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Number} Score representing how favorable the state is (higher is better)
   */
  evaluateState(gameState, team) {
    // Default implementation counts units controlled by the team
    if (!gameState || !gameState.regions) {
      return 0.5; // Neutral score if no valid game state
    }
    
    let ownUnits = 0;
    let enemyUnits = 0;
    
    gameState.regions.forEach(region => {
      if (region.units) {
        region.units.forEach(unitGroup => {
          if (unitGroup.team === team) {
            ownUnits += unitGroup.count;
          } else {
            enemyUnits += unitGroup.count;
          }
        });
      }
    });
    
    // Return normalized score (0-1)
    const totalUnits = ownUnits + enemyUnits;
    return totalUnits > 0 ? ownUnits / totalUnits : 0.5;
  }

  /**
   * React to an opponent's move by adjusting strategy
   * @param {Object} gameState - Current game state after opponent's move
   * @param {Object} opponentMove - The move the opponent just made
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   */
  reactToOpponentMove(gameState, opponentMove, team) {
    // Default implementation does nothing
    // Derived classes can override to adjust strategy
  }
  
  /**
   * Helper method to validate moves
   * This is used by derived classes to filter out invalid moves
   * @param {Object} gameState - Current game state
   * @param {Object} move - Move to validate
   * @returns {Boolean} Whether the move is valid
   */
  _validateMove(gameState, move) {
    // If skipValidation flag is set, consider all moves valid
    if (gameState && gameState.skipValidation) {
      return true;
    }
    
    try {
      // If validateMove is available from the rules engine, use it
      if (typeof validateMove === 'function') {
        const validation = validateMove(gameState, move);
        return validation && validation.isValid;
      }
    } catch (error) {
      // If there's an error during validation, consider the move invalid
      console.log(`Validation error for move ${move.type}: ${error.message}`);
      return false;
    }
    
    // If no validation function is available, consider the move valid
    // This is useful for testing when the rules engine is not available
    return true;
  }
}

module.exports = AIStrategy;
