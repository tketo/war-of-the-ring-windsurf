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
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Object} Move object that can be processed by the rules engine
   */
  determineMove(gameState, team) {
    // Generate all possible moves
    const possibleMoves = this.generatePossibleMoves(gameState, team);
    
    // If no valid moves, return a pass move
    if (!possibleMoves || possibleMoves.length === 0) {
      return { type: 'pass', player: gameState.currentPlayer };
    }
    
    // Score each move and select the best one
    let bestMove = possibleMoves[0];
    let bestScore = -Infinity;
    
    for (const move of possibleMoves) {
      // Apply the move to a copy of the game state
      const newState = this._simulateMove(gameState, move);
      
      // Evaluate the resulting state
      const score = this.evaluateState(newState, team);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }

  /**
   * Generate all possible valid moves for the current game state
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Array} Array of possible move objects
   */
  generatePossibleMoves(gameState, team) {
    if (!gameState) {
      return [];
    }
    
    const possibleMoves = [];
    
    // Based on the current phase, generate different types of moves
    switch (gameState.currentPhase) {
      case 'setup':
        return [{ type: 'setup', player: gameState.currentPlayer }];
        
      case 'hunt':
        if (team === 'Shadow') {
          return [{ 
            type: 'allocateHuntDice', 
            player: gameState.currentPlayer,
            count: 2 // Allocate 2 dice by default
          }];
        }
        return [{ type: 'pass', player: gameState.currentPlayer }];
        
      case 'action':
        // Get available dice
        const dicePool = team === 'Free' ? gameState.actionDice.free : gameState.actionDice.shadow;
        
        if (dicePool && dicePool.length > 0) {
          // Find an unselected die
          for (let i = 0; i < dicePool.length; i++) {
            if (!dicePool[i].selected) {
              return [{ 
                type: 'useActionDie', 
                player: gameState.currentPlayer,
                dieIndex: i
              }];
            }
          }
        }
        
        // If no dice available, pass
        return [{ type: 'pass', player: gameState.currentPlayer }];
        
      case 'combat':
        // Simple combat move
        return [{ 
          type: 'combat', 
          player: gameState.currentPlayer,
          region: 'gondor', // Example region
          attacker: team
        }];
        
      case 'end':
        return [{ type: 'endTurn', player: gameState.currentPlayer }];
        
      default:
        return [{ type: 'pass', player: gameState.currentPlayer }];
    }
  }

  /**
   * Evaluate the current game state from the perspective of this AI's team
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Number} Score representing how favorable the state is (higher is better)
   */
  evaluateState(gameState, team) {
    if (!gameState) {
      return 0;
    }
    
    let score = 0;
    const isFreeTeam = team === 'Free';
    
    // Military strength
    let ownUnits = 0;
    let enemyUnits = 0;
    
    if (gameState.regions) {
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
    }
    
    const militaryRatio = ownUnits / (ownUnits + enemyUnits || 1);
    score += militaryRatio * 0.6;
    
    // Territory control
    let ownTerritories = 0;
    let enemyTerritories = 0;
    
    if (gameState.regions) {
      gameState.regions.forEach(region => {
        if (region.controlledBy === team) {
          ownTerritories++;
        } else if (region.controlledBy) {
          enemyTerritories++;
        }
      });
    }
    
    const territoryRatio = ownTerritories / (ownTerritories + enemyTerritories || 1);
    score += territoryRatio * 0.4;
    
    return score;
  }

  /**
   * Simulate applying a move to the game state
   * @param {Object} gameState - Current game state
   * @param {Object} move - Move to apply
   * @returns {Object} New game state after applying the move
   * @private
   */
  _simulateMove(gameState, move) {
    // This is a simple simulation that doesn't actually apply the move
    // In a real implementation, this would apply the move to a copy of the game state
    return { ...gameState };
  }
}

module.exports = QuellerStrategy;
