/**
 * Fellowship-focused AI Strategy for War of the Ring
 * 
 * This strategy focuses on the Fellowship's journey for Free team
 * and hunting the Fellowship for the Shadow team.
 */

const AIStrategy = require('./strategyInterface');

class FellowshipStrategy extends AIStrategy {
  /**
   * Constructor for Fellowship AI Strategy
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    super(options);
    this.name = 'Fellowship Focus';
    this.description = 'Focuses on the Fellowship journey or hunting it';
    this.difficulty = 'hard';
    
    // Strategy weights for different objectives
    this.weights = {
      fellowshipProgress: 0.4,
      corruption: 0.3,
      militaryStrength: 0.15,
      territoryControl: 0.1,
      cardAdvantage: 0.05
    };
  }

  /**
   * Determine the next move for the AI
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Object} Move object that can be processed by the rules engine
   */
  determineMove(gameState, team) {
    // Get all possible moves
    const possibleMoves = this.generatePossibleMoves(gameState, team);
    
    // If no moves are possible, return a pass move
    if (possibleMoves.length === 0) {
      return { type: 'pass', player: gameState.currentPlayer };
    }
    
    // Evaluate each move and select the best one
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
        possibleMoves.push(...this._generateSetupMoves(gameState, team));
        break;
      case 'hunt':
        possibleMoves.push(...this._generateHuntMoves(gameState, team));
        break;
      case 'action':
        possibleMoves.push(...this._generateActionMoves(gameState, team));
        break;
      case 'combat':
        possibleMoves.push(...this._generateCombatMoves(gameState, team));
        break;
      case 'end':
        possibleMoves.push(...this._generateEndPhaseMoves(gameState, team));
        break;
      default:
        // Default to action phase moves if phase is not recognized
        possibleMoves.push(...this._generateActionMoves(gameState, team));
    }
    
    return possibleMoves;
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
    
    // Fellowship progress and corruption
    const fellowship = gameState.characters?.find(c => c.characterId === 'fellowship');
    if (fellowship) {
      if (isFreeTeam) {
        // For Free team, progress is good, corruption is bad
        score += this.weights.fellowshipProgress * (fellowship.position / 10);
        score -= this.weights.corruption * (fellowship.corruption / 12);
      } else {
        // For Shadow team, corruption is good, progress is bad
        score += this.weights.corruption * (fellowship.corruption / 12);
        score -= this.weights.fellowshipProgress * (fellowship.position / 10);
      }
    }
    
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
    score += this.weights.militaryStrength * militaryRatio;
    
    return score;
  }
  
  /**
   * React to an opponent's move by adjusting strategy
   * @param {Object} gameState - Current game state after opponent's move
   * @param {Object} opponentMove - The move the opponent just made
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   */
  reactToOpponentMove(gameState, opponentMove, team) {
    if (team === 'Free') {
      // If opponent is hunting, focus more on corruption
      if (opponentMove && (opponentMove.type === 'hunt' || opponentMove.action === 'hunt')) {
        this.weights.corruption += 0.05;
        this.weights.militaryStrength -= 0.05;
        this._normalizeWeights();
      }
    } else {
      // If opponent is moving the Fellowship, focus more on hunting
      if (opponentMove && opponentMove.type === 'fellowshipMovement') {
        this.weights.fellowshipProgress += 0.05;
        this.weights.territoryControl -= 0.05;
        this._normalizeWeights();
      }
    }
  }

  /**
   * Normalize strategy weights to sum to 1
   * @private
   */
  _normalizeWeights() {
    const sum = Object.values(this.weights).reduce((total, weight) => total + weight, 0);
    
    if (sum > 0) {
      for (const key in this.weights) {
        this.weights[key] /= sum;
      }
    }
  }

  /**
   * Generate possible setup phase moves
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Array} Array of possible setup moves
   * @private
   */
  _generateSetupMoves(gameState, team) {
    // For now, just return a basic setup move
    return [{ type: 'setup', player: gameState.currentPlayer }];
  }

  /**
   * Generate possible hunt phase moves
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Array} Array of possible hunt moves
   * @private
   */
  _generateHuntMoves(gameState, team) {
    const moves = [];
    
    // Only Shadow can allocate hunt dice
    if (team === 'Shadow') {
      moves.push({ 
        type: 'allocateHuntDice', 
        player: gameState.currentPlayer, 
        count: 2 // Allocate 2 dice by default
      });
    }
    
    return moves;
  }

  /**
   * Generate possible action phase moves
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Array} Array of possible action moves
   * @private
   */
  _generateActionMoves(gameState, team) {
    // For simplicity, just return a basic action move
    return [{ 
      type: 'useActionDie', 
      player: gameState.currentPlayer,
      dieIndex: 0
    }];
  }

  /**
   * Generate possible combat phase moves
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Array} Array of possible combat moves
   * @private
   */
  _generateCombatMoves(gameState, team) {
    // For simplicity, just return a basic combat move
    return [{ 
      type: 'combat', 
      player: gameState.currentPlayer,
      region: 'gondor', // Example region
      attacker: team
    }];
  }

  /**
   * Generate possible end phase moves
   * @param {Object} gameState - Current game state
   * @param {String} team - The team this AI is playing ('Free' or 'Shadow')
   * @returns {Array} Array of possible end phase moves
   * @private
   */
  _generateEndPhaseMoves(gameState, team) {
    return [{ type: 'endTurn', player: gameState.currentPlayer }];
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

module.exports = FellowshipStrategy;
