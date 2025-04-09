/**
 * AI Routes for War of the Ring
 * 
 * These routes handle AI-related functionality, including testing AI strategies
 * and managing AI players in games.
 */

const express = require('express');
const router = express.Router();
const { GameState } = require('../models');
const { validateMove, applyMove } = require('../utils/rulesEngine');
const aiManager = require('../ai/aiManager');
const { requireAuth } = require('../middleware');
const { validateBody } = require('../middleware');
const { aiTestSchema } = require('../utils/validation');
const { logger } = require('../utils/logger');

/**
 * GET /ai/strategies
 * Get available AI strategies
 */
router.get('/strategies', requireAuth, async (req, res, next) => {
  try {
    const strategies = aiManager.getAvailableStrategies();
    
    res.json({
      success: true,
      strategies
    });
  } catch (error) {
    logger.error(`Error getting AI strategies: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /ai/test
 * Test an AI strategy with a given game state
 */
router.post('/test', requireAuth, validateBody(aiTestSchema), async (req, res, next) => {
  try {
    const { gameId, faction, strategyId, options } = req.body;
    const userId = req.user.id;
    
    logger.info(`User ${userId} testing AI strategy ${strategyId} for faction ${faction} in game ${gameId}`);
    
    // Find the game state
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      logger.warn(`Game not found: ${gameId}`);
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Game not found' } 
      });
    }
    
    // Check if the user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      logger.warn(`User ${userId} is not a player in game ${gameId}`);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not a player in this game' } 
      });
    }
    
    // Create AI instance
    const ai = aiManager.createAI(gameId, faction, strategyId, options);
    
    // Get AI move
    const move = ai.determineMove(gameState, faction);
    
    if (!move) {
      logger.warn(`AI could not determine a move for faction ${faction} in game ${gameId}`);
      return res.json({
        success: true,
        move: null,
        message: 'AI could not determine a move'
      });
    }
    
    // Validate the move
    const validation = validateMove(gameState, move);
    
    // Clean up AI instance
    aiManager.removeAI(gameId, faction);
    
    res.json({
      success: true,
      move,
      isValid: validation.isValid,
      error: validation.isValid ? null : validation.error
    });
  } catch (error) {
    logger.error(`Error testing AI: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /ai/move
 * Make an AI move in a game
 */
router.post('/move', requireAuth, async (req, res, next) => {
  try {
    const { gameId, faction, strategyId } = req.body;
    const userId = req.user.id;
    
    logger.info(`User ${userId} requesting AI move for faction ${faction} in game ${gameId}`);
    
    // Find the game state
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      logger.warn(`Game not found: ${gameId}`);
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Game not found' } 
      });
    }
    
    // Check if the user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      logger.warn(`User ${userId} is not a player in game ${gameId}`);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not a player in this game' } 
      });
    }
    
    // Check if it's the AI's turn
    if (gameState.currentPlayer !== `ai_${faction}`) {
      logger.warn(`Not AI's turn in game ${gameId}`);
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Not AI\'s turn' } 
      });
    }
    
    // Get or create AI instance
    let ai = aiManager.getAI(gameId, faction);
    if (!ai) {
      ai = aiManager.createAI(gameId, faction, strategyId || 'random');
    }
    
    // Get AI move
    const move = ai.determineMove(gameState, faction);
    
    if (!move) {
      logger.warn(`AI could not determine a move for faction ${faction} in game ${gameId}`);
      return res.json({
        success: true,
        move: null,
        message: 'AI could not determine a move'
      });
    }
    
    // Validate the move
    const validation = validateMove(gameState, move);
    if (!validation.isValid) {
      logger.warn(`Invalid AI move in game ${gameId}: ${validation.error}`);
      return res.status(400).json({ 
        success: false, 
        error: { message: validation.error } 
      });
    }
    
    // Apply the move
    const newState = applyMove(gameState, move);
    
    // Update the game state in the database
    Object.assign(gameState, newState);
    await gameState.save();
    
    logger.info(`AI move processed successfully in game ${gameId}`);
    
    // Return the updated state and move
    res.json({
      success: true,
      gameState: newState,
      move
    });
  } catch (error) {
    logger.error(`Error making AI move: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /ai/companion
 * Enable or disable companion mode for a game
 */
router.post('/companion', requireAuth, async (req, res, next) => {
  try {
    const { gameId, enable, faction, strategyId } = req.body;
    const userId = req.user.id;
    
    logger.info(`User ${userId} ${enable ? 'enabling' : 'disabling'} companion mode for faction ${faction} in game ${gameId}`);
    
    // Find the game state
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      logger.warn(`Game not found: ${gameId}`);
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Game not found' } 
      });
    }
    
    // Check if the user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      logger.warn(`User ${userId} is not a player in game ${gameId}`);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not a player in this game' } 
      });
    }
    
    // Enable or disable companion mode
    if (enable) {
      // Create AI instance
      aiManager.createAI(gameId, faction, strategyId || 'queller');
      
      // Update game settings
      gameState.settings.mode = 'companion';
      await gameState.save();
      
      logger.info(`Companion mode enabled for faction ${faction} in game ${gameId}`);
    } else {
      // Remove AI instance
      aiManager.removeAI(gameId, faction);
      
      // Update game settings if needed
      if (gameState.settings.mode === 'companion') {
        gameState.settings.mode = 'full';
        await gameState.save();
      }
      
      logger.info(`Companion mode disabled for faction ${faction} in game ${gameId}`);
    }
    
    res.json({
      success: true,
      message: enable ? 'Companion mode enabled' : 'Companion mode disabled',
      gameState
    });
  } catch (error) {
    logger.error(`Error managing companion mode: ${error.message}`, { error });
    next(error);
  }
});

module.exports = router;
