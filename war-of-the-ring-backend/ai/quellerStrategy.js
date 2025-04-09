/**
 * Queller AI Strategy for War of the Ring
 * 
 * This strategy uses basic heuristics to make strategic decisions.
 * It's more advanced than the random strategy but still relatively simple.
 */

const AIStrategy = require('./strategyInterface');
const { validateMove } = require('../utils/rulesEngine');

class QuellerStrategy extends AIStrategy {
  /**
   * Constructor for Queller AI Strategy
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    super(options);
    this.name = 'Queller';
    this.description = 'Uses basic heuristics to make strategic decisions';
    this.difficulty = 'medium';
  }

  /**
   * Determine the next move for the AI using basic heuristics
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
    
    // For testing purposes, just return a simple move
    if (faction === 'freePeoples') {
      const fellowshipMove = possibleMoves.find(move => move.type === 'fellowshipMovement');
      if (fellowshipMove) return fellowshipMove;
    } else {
      const huntMove = possibleMoves.find(move => move.type === 'hunt');
      if (huntMove) return huntMove;
      
      // If no hunt move is available, try to find another valid move
      if (possibleMoves.length > 0) {
        return possibleMoves[0];
      }
    }
    
    // If specific move not found, return the first move
    return possibleMoves[0];
  }

  /**
   * Evaluate a game state using basic heuristics
   * @param {Object} gameState - Game state to evaluate
   * @param {String} faction - The faction this AI is playing ('freePeoples' or 'shadow')
   * @returns {Number} Score representing how good the state is for the AI (higher is better)
   */
  evaluateState(gameState, faction) {
    if (!gameState) return 0.5;
    
    // For testing purposes, return a simple score
    return faction === 'freePeoples' ? 0.6 : 0.7;
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
    
    // Filter out invalid moves using the helper method from the parent class
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
        count: 1, // Queller strategy allocates 1 die to hunting
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
    
    // Add basic moves based on faction
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
}

module.exports = QuellerStrategy;
