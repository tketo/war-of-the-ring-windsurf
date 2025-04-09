const express = require('express');
const router = express.Router();
const clerk = require('@clerk/clerk-sdk-node');
const { EventCard, CombatCard, GameState } = require('../models');
const { validateMove, applyMove, getCardState, updateCardState } = require('../utils/rulesEngine');

// Middleware to verify authentication
const requireAuth = async (req, res, next) => {
  try {
    // Get the session token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Clerk
    try {
      const session = await clerk.verifyToken(token);
      req.user = session;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /card/event/:id
 * Get event card details
 */
router.get('/event/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the card
    const card = await EventCard.findOne({ id });
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Return the card details
    res.json({
      success: true,
      card
    });
  } catch (error) {
    console.error('Error retrieving card:', error);
    res.status(500).json({ error: 'Failed to retrieve card' });
  }
});

/**
 * GET /card/combat/:id
 * Get combat card details
 */
router.get('/combat/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the card
    const card = await CombatCard.findOne({ id });
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Return the card details
    res.json({
      success: true,
      card
    });
  } catch (error) {
    console.error('Error retrieving card:', error);
    res.status(500).json({ error: 'Failed to retrieve card' });
  }
});

/**
 * POST /card/play
 * Play a card in a game
 */
router.post('/play', requireAuth, async (req, res) => {
  try {
    const { gameId, cardId, target, options } = req.body;
    const userId = req.user.sub;
    
    // Find the game state
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if the user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      return res.status(403).json({ error: 'You are not a player in this game' });
    }
    
    // Create the move object
    const move = {
      type: 'playCard',
      player: userId,
      cardId,
      target,
      options
    };
    
    // Validate the move
    const validation = validateMove(gameState, move);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Apply the move to get the new state
    const newState = applyMove(gameState, move);
    
    // Update the game state in the database
    Object.assign(gameState, newState);
    await gameState.save();
    
    // Return the updated state
    res.json({
      success: true,
      gameState: newState
    });
  } catch (error) {
    console.error('Error playing card:', error);
    res.status(500).json({ error: 'Failed to play card' });
  }
});

/**
 * GET /card/state
 * Get the current state of a card in a game
 */
router.get('/state', requireAuth, async (req, res) => {
  try {
    const { gameId, cardId } = req.query;
    const userId = req.user.sub;
    
    // Find the game state
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if the user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      return res.status(403).json({ error: 'You are not a player in this game' });
    }
    
    // Get the card state
    const cardState = getCardState(gameState, cardId);
    
    // Return the card state
    res.json({
      success: true,
      cardState
    });
  } catch (error) {
    console.error('Error retrieving card state:', error);
    res.status(500).json({ error: 'Failed to retrieve card state' });
  }
});

/**
 * POST /card/draw
 * Draw a card in a game
 */
router.post('/draw', requireAuth, async (req, res) => {
  try {
    const { gameId, deckType } = req.body;
    const userId = req.user.sub;
    
    // Find the game state
    const gameState = await GameState.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if the user is a player in the game
    const player = gameState.players.find(p => p.playerId === userId);
    if (!player) {
      return res.status(403).json({ error: 'You are not a player in this game' });
    }
    
    // Create the move object
    const move = {
      type: 'drawCard',
      player: userId,
      deckType
    };
    
    // Validate the move
    const validation = validateMove(gameState, move);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Apply the move to get the new state
    const newState = applyMove(gameState, move);
    
    // Update the game state in the database
    Object.assign(gameState, newState);
    await gameState.save();
    
    // Return the updated state
    res.json({
      success: true,
      gameState: newState
    });
  } catch (error) {
    console.error('Error drawing card:', error);
    res.status(500).json({ error: 'Failed to draw card' });
  }
});

module.exports = router;
