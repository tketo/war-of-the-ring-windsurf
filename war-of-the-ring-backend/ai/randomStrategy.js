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
    
    // Randomly select a move
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
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
            count: Math.floor(Math.random() * 3) + 1 // Random 1-3 dice
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
}

module.exports = RandomStrategy;
