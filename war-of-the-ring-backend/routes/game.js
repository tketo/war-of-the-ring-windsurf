const express = require('express');
const router = express.Router();
const { GameState } = require('../models');
const { validateMove, applyMove } = require('../utils/rulesEngine');
const encryptionUtils = require('../utils/encryption');
const { requireAuth } = require('../middleware');
const { validateBody, validateQuery } = require('../middleware');
const { 
  gameStartSchema, 
  gameMoveSchema, 
  gameStateSchema, 
  gameSaveSchema, 
  gameLoadSchema, 
  gameUndoSchema, 
  gameRedoSchema, 
  gameReplaySchema 
} = require('../utils/validation');
const { logger, securityLogger } = require('../utils/logger');

/**
 * POST /game/start
 * Initialize a new game
 */
router.post('/start', requireAuth, validateBody(gameStartSchema), async (req, res, next) => {
  try {
    const { mode = 'full', expansions = [], scenario = 'standard' } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} starting new game`, { mode, scenario });

    // Create a new game ID
    const gameId = encryptionUtils.hash(`${userId}-${Date.now()}`);
    
    // Generate encryption key for sensitive data
    const encryptionKey = encryptionUtils.generateKey();
    
    // Create initial game state
    const initialState = {
      gameId,
      players: [{
        playerId: userId,
        faction: 'Free Peoples',
        role: 'primary',
        isActive: true
      }],
      currentPhase: 'setup',
      currentTurn: 1,
      currentPlayer: userId,
      actionDice: {
        freePeoples: [],
        shadow: []
      },
      characters: [],
      regions: [],
      cards: {
        eventDeck: [],
        eventDiscard: [],
        combatDeck: [],
        combatDiscard: [],
        playerHands: new Map()
      },
      history: [],
      settings: {
        mode,
        expansions,
        scenario
      }
    };
    
    // Create and save the game state
    const gameState = new GameState(initialState);
    await gameState.save();
    
    logger.info(`Game created successfully: ${gameId}`);
    
    // Return the game ID and encryption key to the client
    // In a production environment, you would want to store the encryption key securely
    res.status(201).json({
      success: true,
      gameId,
      encryptionKey,
      message: 'Game created successfully'
    });
  } catch (error) {
    logger.error(`Error creating game: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /game/move
 * Make a move in the game
 */
router.post('/move', requireAuth, validateBody(gameMoveSchema), async (req, res, next) => {
  try {
    const { gameId, move, encryptionKey } = req.body;
    const userId = req.user.id;
    
    logger.debug(`User ${userId} making move in game ${gameId}`, { moveType: move.type });
    
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
      securityLogger.logAccessDenied(userId, `game:${gameId}`, req.ip);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not a player in this game' } 
      });
    }
    
    // Validate the move
    const validation = validateMove(gameState, move);
    if (!validation.isValid) {
      logger.warn(`Invalid move by user ${userId} in game ${gameId}: ${validation.error}`);
      return res.status(400).json({ 
        success: false, 
        error: { message: validation.error } 
      });
    }
    
    // Apply the move to get the new state
    const newState = applyMove(gameState, move);
    
    // Update the game state in the database
    Object.assign(gameState, newState);
    await gameState.save();
    
    logger.info(`Move processed successfully in game ${gameId}`);
    
    // Return the updated state
    res.json({
      success: true,
      gameState: newState
    });
  } catch (error) {
    logger.error(`Error processing move: ${error.message}`, { error });
    next(error);
  }
});

/**
 * GET /game/state
 * Get the current game state
 */
router.get('/state/:gameId', requireAuth, validateQuery(gameStateSchema), async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { encryptionKey } = req.query;
    const userId = req.user.id;
    
    logger.debug(`User ${userId} requesting game state for ${gameId}`);
    
    // Find the game state
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      logger.warn(`Game not found: ${gameId}`);
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Game not found' } 
      });
    }
    
    // Check if the user is a player or spectator in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      // Check if spectator mode is enabled
      const isSpectator = gameState.settings.spectatorMode === true;
      if (!isSpectator) {
        securityLogger.logAccessDenied(userId, `game:${gameId}`, req.ip);
        return res.status(403).json({ 
          success: false, 
          error: { message: 'You are not authorized to view this game' } 
        });
      }
    }
    
    // Return the game state
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    logger.error(`Error retrieving game state: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /game/save
 * Save the current game state
 */
router.post('/save', requireAuth, validateBody(gameSaveSchema), async (req, res, next) => {
  try {
    const { gameId, encryptionKey } = req.body;
    const userId = req.user.id;
    
    logger.debug(`User ${userId} saving game ${gameId}`);
    
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
      securityLogger.logAccessDenied(userId, `game:${gameId}`, req.ip);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not a player in this game' } 
      });
    }
    
    // Save is just updating the timestamp
    gameState.updatedAt = Date.now();
    await gameState.save();
    
    logger.info(`Game ${gameId} saved successfully`);
    
    res.json({
      success: true,
      message: 'Game saved successfully'
    });
  } catch (error) {
    logger.error(`Error saving game: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /game/load
 * Load a saved game
 */
router.post('/load', requireAuth, validateBody(gameLoadSchema), async (req, res, next) => {
  try {
    const { gameId, encryptionKey } = req.body;
    const userId = req.user.id;
    
    logger.debug(`User ${userId} loading game ${gameId}`);
    
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
      securityLogger.logAccessDenied(userId, `game:${gameId}`, req.ip);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not a player in this game' } 
      });
    }
    
    logger.info(`Game ${gameId} loaded successfully`);
    
    // Return the game state
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    logger.error(`Error loading game: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /game/undo
 * Undo the last move
 */
router.post('/undo', requireAuth, validateBody(gameUndoSchema), async (req, res, next) => {
  try {
    const { gameId, encryptionKey } = req.body;
    const userId = req.user.id;
    
    logger.debug(`User ${userId} requesting undo in game ${gameId}`);
    
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
      securityLogger.logAccessDenied(userId, `game:${gameId}`, req.ip);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not a player in this game' } 
      });
    }
    
    // Check if there's history to undo
    if (!gameState.history || gameState.history.length === 0) {
      logger.warn(`No moves to undo in game ${gameId}`);
      return res.status(400).json({ 
        success: false, 
        error: { message: 'No moves to undo' } 
      });
    }
    
    // Handle undo based on game mode
    if (gameState.settings.mode === 'unrestricted') {
      // In unrestricted mode, we can undo any move
      gameState.history.pop();
      
      // If there's still history, set the game state to the last history item
      if (gameState.history.length > 0) {
        const lastHistoryItem = gameState.history[gameState.history.length - 1];
        Object.assign(gameState, lastHistoryItem.state);
      }
    } else {
      // In rules enforced mode, we can only undo uncommitted moves in the current phase
      const uncommittedHistory = gameState.getUncommittedHistory(gameState.currentPhase);
      
      if (uncommittedHistory.length === 0) {
        logger.warn(`No uncommitted moves to undo in game ${gameId}`);
        return res.status(400).json({ 
          success: false, 
          error: { message: 'No uncommitted moves to undo in the current phase' } 
        });
      }
      
      // Remove the last uncommitted move
      const lastUncommittedIndex = gameState.history.findIndex(item => 
        item === uncommittedHistory[uncommittedHistory.length - 1]
      );
      
      if (lastUncommittedIndex !== -1) {
        gameState.history.splice(lastUncommittedIndex, 1);
        
        // If there's still history, set the game state to the last history item
        if (gameState.history.length > 0) {
          const lastHistoryItem = gameState.history[gameState.history.length - 1];
          Object.assign(gameState, lastHistoryItem.state);
        }
      }
    }
    
    // Save the updated game state
    await gameState.save();
    
    logger.info(`Undo successful in game ${gameId}`);
    
    // Return the updated state
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    logger.error(`Error undoing move: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /game/redo
 * Redo the last undone move
 */
router.post('/redo', requireAuth, validateBody(gameRedoSchema), async (req, res, next) => {
  try {
    const { gameId, encryptionKey, redoAction } = req.body;
    const userId = req.user.id;
    
    logger.debug(`User ${userId} requesting redo in game ${gameId}`);
    
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
      securityLogger.logAccessDenied(userId, `game:${gameId}`, req.ip);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not a player in this game' } 
      });
    }
    
    // Redo is essentially applying a new move that was previously undone
    // The client would need to keep track of undone moves
    if (!redoAction) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'No redo action provided' } 
      });
    }
    
    // Validate and apply the redo action
    const validation = validateMove(gameState, redoAction);
    if (!validation.isValid) {
      logger.warn(`Invalid redo action in game ${gameId}: ${validation.error}`);
      return res.status(400).json({ 
        success: false, 
        error: { message: validation.error } 
      });
    }
    
    // Apply the move to get the new state
    const newState = applyMove(gameState, redoAction);
    
    // Update the game state in the database
    Object.assign(gameState, newState);
    await gameState.save();
    
    logger.info(`Redo successful in game ${gameId}`);
    
    // Return the updated state
    res.json({
      success: true,
      gameState: newState
    });
  } catch (error) {
    logger.error(`Error redoing move: ${error.message}`, { error });
    next(error);
  }
});

/**
 * POST /game/replay
 * Replay a sequence of moves
 */
router.post('/replay', requireAuth, validateBody(gameReplaySchema), async (req, res, next) => {
  try {
    const { gameId, encryptionKey, startIndex, endIndex } = req.body;
    const userId = req.user.id;
    
    logger.debug(`User ${userId} requesting replay for game ${gameId}`);
    
    // Find the game state
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      logger.warn(`Game not found: ${gameId}`);
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Game not found' } 
      });
    }
    
    // Check if the user is a player or spectator in the game
    const player = gameState.players.find(p => p.playerId === userId);
    const isSpectator = gameState.settings.spectatorMode === true;
    
    if (!player && !isSpectator) {
      securityLogger.logAccessDenied(userId, `game:${gameId}`, req.ip);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'You are not authorized to replay this game' } 
      });
    }
    
    // Check if the history exists and has enough entries
    if (!gameState.history || gameState.history.length === 0) {
      logger.warn(`No history to replay in game ${gameId}`);
      return res.status(400).json({ 
        success: false, 
        error: { message: 'No history to replay' } 
      });
    }
    
    // Validate indices
    const validStartIndex = Math.max(0, startIndex || 0);
    const validEndIndex = Math.min(gameState.history.length - 1, endIndex || gameState.history.length - 1);
    
    if (validStartIndex > validEndIndex) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Invalid replay range' } 
      });
    }
    
    // Extract the history items to replay
    const replayHistory = gameState.history.slice(validStartIndex, validEndIndex + 1);
    
    logger.info(`Replay successful for game ${gameId}`);
    
    // Return the replay history
    res.json({
      success: true,
      replayHistory
    });
  } catch (error) {
    logger.error(`Error replaying game: ${error.message}`, { error });
    next(error);
  }
});

module.exports = router;
