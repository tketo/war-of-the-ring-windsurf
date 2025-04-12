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
const rulesEngine = require('../utils/rulesEngine');

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
        free: [],
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

/**
 * Make a move in a game
 * POST /game/:gameId/move
 */
router.post('/:gameId/move', requireAuth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const move = req.body;
    
    // Validate request body
    if (!move || !move.type) {
      return res.status(400).json({ error: 'Invalid move data' });
    }
    
    // Find the game
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      return res.status(403).json({ error: 'You are not a player in this game' });
    }
    
    // Check if it's the player's turn
    if (gameState.currentPlayer !== player.playerId) {
      return res.status(403).json({ error: 'Not your turn' });
    }
    
    // Add player info to the move
    move.player = player.playerId;
    move.faction = player.faction;
    
    // Validate the move using the rules engine
    const validation = rulesEngine.validateMove(gameState, move);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Apply the move
    const updatedGameState = rulesEngine.applyMove(gameState, move);
    
    // Save the updated game state
    await updatedGameState.save();
    
    // Emit socket event to notify players
    req.io.to(gameId).emit('gameUpdate', {
      type: 'move',
      move: move,
      player: {
        id: player.playerId,
        faction: player.faction
      }
    });
    
    res.status(200).json({ success: true, move: move });
  } catch (error) {
    console.error('Error making move:', error);
    next(error);
  }
});

/**
 * Get valid actions for a player
 * GET /game/:gameId/validActions
 */
router.get('/:gameId/validActions', requireAuth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    // Find the game
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      return res.status(403).json({ error: 'You are not a player in this game' });
    }
    
    // Get available dice for the player
    const playerDice = player.faction.includes('free') 
      ? gameState.actionDice.free 
      : gameState.actionDice.shadow;
    
    // Get valid actions for each die
    const validActions = {};
    playerDice.forEach(dieType => {
      validActions[dieType] = rulesEngine.getValidActionsForDie(dieType, player.faction, gameState);
    });
    
    res.status(200).json({ validActions });
  } catch (error) {
    console.error('Error getting valid actions:', error);
    next(error);
  }
});

/**
 * Roll action dice for a new turn
 * POST /game/:gameId/rollDice
 */
router.post('/:gameId/rollDice', requireAuth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    // Find the game
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      return res.status(403).json({ error: 'You are not a player in this game' });
    }
    
    // Check if it's the start of a new turn
    if (gameState.currentPhase !== 'action' || gameState.actionDice.free.length > 0 || gameState.actionDice.shadow.length > 0) {
      return res.status(400).json({ error: 'Cannot roll dice at this time' });
    }
    
    // Roll dice for both teams
    const freeDice = rollActionDice('Free', gameState);
    const shadowDice = rollActionDice('Shadow', gameState);
    
    // Update game state
    gameState.actionDice.free = freeDice;
    gameState.actionDice.shadow = shadowDice;
    
    // Save the updated game state
    await gameState.save();
    
    // Emit socket event to notify players
    req.io.to(gameId).emit('gameUpdate', {
      type: 'diceRolled',
      freeDice,
      shadowDice
    });
    
    res.status(200).json({ 
      success: true, 
      dice: {
        free: freeDice,
        shadow: shadowDice
      }
    });
  } catch (error) {
    console.error('Error rolling dice:', error);
    next(error);
  }
});

/**
 * Hunt the Fellowship
 * POST /game/:gameId/hunt
 */
router.post('/:gameId/hunt', requireAuth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    // Find the game
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if user is the Shadow player
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player || !player.faction.includes('shadow')) {
      return res.status(403).json({ error: 'Only the Shadow player can hunt' });
    }
    
    // Create a hunt move
    const huntMove = {
      type: 'hunt',
      player: player.playerId,
      faction: player.faction
    };
    
    // Validate the hunt
    const validation = rulesEngine.validateHunt(gameState, huntMove);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Apply the hunt
    const updatedGameState = rulesEngine.applyHunt(gameState, huntMove);
    
    // Save the updated game state
    await updatedGameState.save();
    
    // Get the hunt result (the last hunt tile drawn)
    const huntResult = updatedGameState.huntHistory[updatedGameState.huntHistory.length - 1];
    
    // Emit socket event to notify players
    req.io.to(gameId).emit('gameUpdate', {
      type: 'hunt',
      result: huntResult,
      player: {
        id: player.playerId,
        faction: player.faction
      }
    });
    
    res.status(200).json({ 
      success: true, 
      result: huntResult
    });
  } catch (error) {
    console.error('Error hunting:', error);
    next(error);
  }
});

/**
 * Move the Fellowship
 * POST /game/:gameId/moveFellowship
 */
router.post('/:gameId/moveFellowship', requireAuth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const { steps } = req.body;
    
    // Validate request body
    if (steps === undefined) {
      return res.status(400).json({ error: 'Steps parameter is required' });
    }
    
    // Find the game
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if user is the Free Peoples player
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player || !player.faction.includes('free')) {
      return res.status(403).json({ error: 'Only the Free Peoples player can move the Fellowship' });
    }
    
    // Create a Fellowship movement move
    const fellowshipMove = {
      type: 'fellowshipMovement',
      player: player.playerId,
      faction: player.faction,
      steps: parseInt(steps)
    };
    
    // Validate the movement
    const validation = rulesEngine.validateFellowshipMovement(gameState, fellowshipMove);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Apply the movement
    const updatedGameState = rulesEngine.applyFellowshipMovement(gameState, fellowshipMove);
    
    // Save the updated game state
    await updatedGameState.save();
    
    // Get the updated Fellowship position
    const fellowship = updatedGameState.characters.find(c => c.characterId === 'fellowship');
    
    // Emit socket event to notify players
    req.io.to(gameId).emit('gameUpdate', {
      type: 'fellowshipMovement',
      steps: steps,
      newPosition: fellowship.position,
      player: {
        id: player.playerId,
        faction: player.faction
      }
    });
    
    res.status(200).json({ 
      success: true, 
      fellowship: {
        position: fellowship.position,
        status: fellowship.status,
        corruption: fellowship.corruption
      }
    });
  } catch (error) {
    console.error('Error moving Fellowship:', error);
    next(error);
  }
});

/**
 * Update political status of a nation
 * POST /game/:gameId/political
 */
router.post('/:gameId/political', requireAuth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const { nation, direction } = req.body;
    
    // Validate request body
    if (!nation || !direction) {
      return res.status(400).json({ error: 'Nation and direction parameters are required' });
    }
    
    // Find the game
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      return res.status(403).json({ error: 'You are not a player in this game' });
    }
    
    // Create a political action move
    const politicalMove = {
      type: 'politicalAction',
      player: player.playerId,
      faction: player.faction,
      nation: nation,
      direction: direction
    };
    
    // Validate the political action
    const validation = rulesEngine.validatePoliticalAction(gameState, politicalMove);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Apply the political action
    const updatedGameState = rulesEngine.applyPoliticalAction(gameState, politicalMove);
    
    // Save the updated game state
    await updatedGameState.save();
    
    // Get the updated nation status
    const nationStatus = updatedGameState.nations[nation].status;
    
    // Emit socket event to notify players
    req.io.to(gameId).emit('gameUpdate', {
      type: 'politicalAction',
      nation: nation,
      status: nationStatus,
      player: {
        id: player.playerId,
        faction: player.faction
      }
    });
    
    res.status(200).json({ 
      success: true, 
      nation: nation,
      status: nationStatus
    });
  } catch (error) {
    console.error('Error updating political status:', error);
    next(error);
  }
});

/**
 * Roll action dice for a team
 * @param {String} team - Team (Free or Shadow)
 * @param {Object} gameState - Current game state
 * @returns {Array} - Array of dice results
 */
function rollActionDice(team, gameState) {
  // Determine number of dice based on team and game state
  let numDice = 0;
  
  if (team === 'Free') {
    // Free Peoples start with 4 dice, plus additional dice based on active nations
    numDice = 4;
    
    // Add dice for active nations (except Elves which start active)
    if (gameState.nations.north.active) numDice++;
    if (gameState.nations.rohan.active) numDice++;
    if (gameState.nations.gondor.active) numDice++;
    if (gameState.nations.dwarves.active) numDice++;
    
    // Maximum of 10 dice
    numDice = Math.min(numDice, 10);
  } else {
    // Shadow starts with 7 dice
    numDice = 7;
    
    // Maximum of 10 dice
    numDice = Math.min(numDice, 10);
  }
  
  // Roll the dice
  const dice = [];
  for (let i = 0; i < numDice; i++) {
    dice.push(rollSingleDie(team));
  }
  
  return dice;
}

/**
 * Roll a single action die for a team
 * @param {String} team - Team (Free or Shadow)
 * @returns {String} - Die result
 */
function rollSingleDie(team) {
  // Define die faces based on team
  const dieFaces = team === 'Free' 
    ? ['character', 'character', 'army', 'army', 'muster', 'event', 'will']
    : ['character', 'character', 'army', 'army', 'muster', 'event', 'eye'];
  
  // Roll the die (random index)
  const randomIndex = Math.floor(Math.random() * dieFaces.length);
  
  // Return the die face
  return {
    type: dieFaces[randomIndex],
    selected: false
  };
}

module.exports = router;
