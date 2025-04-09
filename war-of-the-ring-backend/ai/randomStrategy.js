/**
 * Random AI Strategy for War of the Ring
 * 
 * This strategy makes random valid moves without any strategic planning.
 * It's useful for testing and as a baseline for more advanced strategies.
 */

const AIStrategy = require('./strategyInterface');

class RandomStrategy extends AIStrategy {
  /**
   * Constructor for Random AI Strategy
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    super(options);
    this.name = 'Random';
    this.description = 'Makes random valid moves without strategic planning';
    this.difficulty = 'easy';
  }

  /**
   * Determine the next move for the AI by randomly selecting from valid moves
   * @param {Object} gameState - Current game state
   * @param {String} faction - The faction this AI is playing ('freePeoples' or 'shadow')
   * @returns {Object} Move object that can be processed by the rules engine
   */
  determineMove(gameState, faction) {
    // Generate all possible moves
    const possibleMoves = this.generatePossibleMoves(gameState, faction);
    
    // If no valid moves, return null
    if (!possibleMoves || possibleMoves.length === 0) {
      return null;
    }
    
    // Select a random move from the possible moves
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
  }

  /**
   * Evaluate a game state - for random AI, this just returns a random score
   * @param {Object} gameState - Game state to evaluate
   * @param {String} faction - The faction this AI is playing ('freePeoples' or 'shadow')
   * @returns {Number} Random score between 0 and 1
   */
  evaluateState(gameState, faction) {
    // For random AI, just return a random score
    return Math.random();
  }

  /**
   * Generate all possible valid moves for the current game state
   * @param {Object} gameState - Current game state
   * @param {String} faction - The faction this AI is playing ('freePeoples' or 'shadow')
   * @returns {Array} Array of possible move objects
   */
  generatePossibleMoves(gameState, faction) {
    if (!gameState) {
      return [];
    }
    
    const possibleMoves = [];
    
    // Based on the current phase, generate different types of moves
    switch (gameState.currentPhase) {
      case 'setup':
        possibleMoves.push(...this._generateSetupMoves(gameState, faction));
        break;
      case 'hunt':
        possibleMoves.push(...this._generateHuntMoves(gameState, faction));
        break;
      case 'action':
        possibleMoves.push(...this._generateActionMoves(gameState, faction));
        break;
      case 'combat':
        possibleMoves.push(...this._generateCombatMoves(gameState, faction));
        break;
      case 'end':
        possibleMoves.push(...this._generateEndPhaseMoves(gameState, faction));
        break;
      default:
        // Default to action phase moves if phase is not recognized
        possibleMoves.push(...this._generateActionMoves(gameState, faction));
    }
    
    // Always add a pass move as a fallback
    possibleMoves.push({
      type: 'pass',
      faction,
      player: `ai_${faction}`,
      phase: gameState.currentPhase || 'action',
      timestamp: Date.now()
    });
    
    // If skipValidation flag is set, return all moves without validation
    if (gameState.skipValidation) {
      return possibleMoves;
    }
    
    // Filter out invalid moves using the parent class helper method
    return possibleMoves.filter(move => this._validateMove(gameState, move));
  }

  /**
   * Generate possible setup phase moves
   * @private
   */
  _generateSetupMoves(gameState, faction) {
    const moves = [];
    
    // Add a basic setup move
    moves.push({
      type: 'setup',
      faction,
      player: `ai_${faction}`,
      timestamp: Date.now()
    });
    
    return moves;
  }

  /**
   * Generate possible hunt phase moves
   * @private
   */
  _generateHuntMoves(gameState, faction) {
    const moves = [];
    
    // If shadow faction, can allocate hunt dice
    if (faction === 'shadow') {
      moves.push({
        type: 'allocateHuntDice',
        faction,
        player: `ai_${faction}`,
        count: Math.floor(Math.random() * 3), // Random number of dice 0-2
        timestamp: Date.now()
      });
    }
    
    // Add a "pass" move to end the hunt phase
    moves.push({
      type: 'pass',
      faction,
      player: `ai_${faction}`,
      phase: 'hunt',
      timestamp: Date.now()
    });
    
    return moves;
  }

  /**
   * Generate possible action phase moves
   * @private
   */
  _generateActionMoves(gameState, faction) {
    const moves = [];
    
    // Basic move for testing
    if (faction === 'freePeoples') {
      // Move Fellowship
      moves.push({
        type: 'fellowshipMovement',
        faction,
        player: `ai_${faction}`,
        steps: 1,
        timestamp: Date.now()
      });
    } else {
      // Hunt the Fellowship
      moves.push({
        type: 'hunt',
        faction,
        player: `ai_${faction}`,
        timestamp: Date.now()
      });
      
      // Add army movement as a backup move
      moves.push({
        type: 'moveArmy',
        faction,
        player: `ai_${faction}`,
        fromRegion: 'mordor',
        toRegion: 'gondor',
        units: [{ type: 'regular', count: 1 }],
        timestamp: Date.now()
      });
      
      // Add character movement as another backup move
      moves.push({
        type: 'moveCharacter',
        faction,
        player: `ai_${faction}`,
        characterId: 'witchKing',
        fromRegion: 'mordor',
        toRegion: 'gondor',
        timestamp: Date.now()
      });
      
      // Add muster action as another option
      moves.push({
        type: 'muster',
        faction,
        player: `ai_${faction}`,
        region: 'mordor',
        unitType: 'regular',
        count: 1,
        timestamp: Date.now()
      });
    }
    
    // Add a "pass" move to end the action phase
    moves.push({
      type: 'pass',
      faction,
      player: `ai_${faction}`,
      phase: 'action',
      timestamp: Date.now()
    });
    
    return moves;
  }

  /**
   * Generate possible combat phase moves
   * @private
   */
  _generateCombatMoves(gameState, faction) {
    const moves = [];
    
    // Add a "pass" move to end the combat phase
    moves.push({
      type: 'pass',
      faction,
      player: `ai_${faction}`,
      phase: 'combat',
      timestamp: Date.now()
    });
    
    return moves;
  }

  /**
   * Generate possible end phase moves
   * @private
   */
  _generateEndPhaseMoves(gameState, faction) {
    const moves = [];
    
    // Add a "endTurn" move
    moves.push({
      type: 'endTurn',
      faction,
      player: `ai_${faction}`,
      timestamp: Date.now()
    });
    
    return moves;
  }

  /**
   * Helper method to get adjacent regions
   * @private
   */
  _getAdjacentRegions(gameState, regionId) {
    // This is a placeholder - in a real implementation, you would use a region adjacency map
    // For now, return a random subset of regions
    if (!gameState || !gameState.regions) {
      return [];
    }
    
    const allRegions = gameState.regions.map(region => region.regionId);
    const otherRegions = allRegions.filter(id => id !== regionId);
    
    // Return 1-3 random adjacent regions
    const numAdjacent = Math.floor(Math.random() * 3) + 1;
    const adjacentRegions = [];
    
    for (let i = 0; i < numAdjacent && i < otherRegions.length; i++) {
      const randomIndex = Math.floor(Math.random() * otherRegions.length);
      adjacentRegions.push(otherRegions[randomIndex]);
      otherRegions.splice(randomIndex, 1); // Remove to avoid duplicates
    }
    
    return adjacentRegions;
  }
}

module.exports = RandomStrategy;
