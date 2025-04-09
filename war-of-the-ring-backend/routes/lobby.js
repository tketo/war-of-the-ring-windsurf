const express = require('express');
const router = express.Router();
const clerk = require('@clerk/clerk-sdk-node');
const { GameState } = require('../models');
const encryptionUtils = require('../utils/encryption');

// In-memory lobby storage (would use Redis in production)
const lobbies = new Map();

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
 * POST /lobby/create
 * Create a new game lobby
 */
router.post('/create', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, maxPlayers = 2, mode = 'full', expansions = [], scenario = 'standard', isPrivate = false } = req.body;
    
    // Generate a unique lobby ID
    const lobbyId = encryptionUtils.hash(`lobby-${userId}-${Date.now()}`).substring(0, 8);
    
    // Create the lobby
    const lobby = {
      id: lobbyId,
      name: name || `${req.user.username}'s Game`,
      host: userId,
      players: [{
        id: userId,
        username: req.user.username,
        faction: 'Free Peoples',
        ready: false
      }],
      maxPlayers,
      mode,
      expansions,
      scenario,
      isPrivate,
      status: 'waiting',
      createdAt: Date.now(),
      inviteCode: isPrivate ? encryptionUtils.hash(`invite-${lobbyId}-${Date.now()}`).substring(0, 6) : null
    };
    
    // Store the lobby
    lobbies.set(lobbyId, lobby);
    
    // Return the created lobby
    res.status(201).json({
      success: true,
      message: 'Lobby created successfully',
      lobby
    });
  } catch (error) {
    console.error('Error creating lobby:', error);
    res.status(500).json({ error: 'Failed to create lobby' });
  }
});

/**
 * GET /lobby/list
 * Get list of available lobbies
 */
router.get('/list', requireAuth, async (req, res) => {
  try {
    // Filter out private lobbies
    const publicLobbies = Array.from(lobbies.values())
      .filter(lobby => !lobby.isPrivate && lobby.status === 'waiting' && lobby.players.length < lobby.maxPlayers)
      .map(lobby => ({
        id: lobby.id,
        name: lobby.name,
        host: lobby.host,
        playerCount: lobby.players.length,
        maxPlayers: lobby.maxPlayers,
        mode: lobby.mode,
        expansions: lobby.expansions,
        scenario: lobby.scenario,
        createdAt: lobby.createdAt
      }));
    
    res.json({
      success: true,
      lobbies: publicLobbies
    });
  } catch (error) {
    console.error('Error listing lobbies:', error);
    res.status(500).json({ error: 'Failed to list lobbies' });
  }
});

/**
 * POST /lobby/join
 * Join an existing lobby
 */
router.post('/join', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { lobbyId, inviteCode, faction = 'Shadow' } = req.body;
    
    // Find the lobby
    const lobby = lobbies.get(lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    // Check if the lobby is full
    if (lobby.players.length >= lobby.maxPlayers) {
      return res.status(400).json({ error: 'Lobby is full' });
    }
    
    // Check if the lobby is private and requires an invite code
    if (lobby.isPrivate && lobby.inviteCode !== inviteCode) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }
    
    // Check if the player is already in the lobby
    if (lobby.players.some(player => player.id === userId)) {
      return res.status(400).json({ error: 'You are already in this lobby' });
    }
    
    // Add the player to the lobby
    lobby.players.push({
      id: userId,
      username: req.user.username,
      faction,
      ready: false
    });
    
    // Return the updated lobby
    res.json({
      success: true,
      message: 'Joined lobby successfully',
      lobby
    });
  } catch (error) {
    console.error('Error joining lobby:', error);
    res.status(500).json({ error: 'Failed to join lobby' });
  }
});

/**
 * POST /lobby/leave
 * Leave a lobby
 */
router.post('/leave', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { lobbyId } = req.body;
    
    // Find the lobby
    const lobby = lobbies.get(lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    // Check if the player is in the lobby
    const playerIndex = lobby.players.findIndex(player => player.id === userId);
    if (playerIndex === -1) {
      return res.status(400).json({ error: 'You are not in this lobby' });
    }
    
    // Remove the player from the lobby
    lobby.players.splice(playerIndex, 1);
    
    // If the host left, assign a new host or delete the lobby
    if (lobby.host === userId) {
      if (lobby.players.length > 0) {
        lobby.host = lobby.players[0].id;
      } else {
        // Delete the lobby if no players remain
        lobbies.delete(lobbyId);
        return res.json({
          success: true,
          message: 'Left lobby and lobby deleted (no players remaining)'
        });
      }
    }
    
    // Return success
    res.json({
      success: true,
      message: 'Left lobby successfully'
    });
  } catch (error) {
    console.error('Error leaving lobby:', error);
    res.status(500).json({ error: 'Failed to leave lobby' });
  }
});

/**
 * POST /lobby/ready
 * Set player ready status
 */
router.post('/ready', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { lobbyId, ready } = req.body;
    
    // Find the lobby
    const lobby = lobbies.get(lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    // Find the player in the lobby
    const player = lobby.players.find(player => player.id === userId);
    if (!player) {
      return res.status(400).json({ error: 'You are not in this lobby' });
    }
    
    // Update ready status
    player.ready = ready;
    
    // Check if all players are ready
    const allReady = lobby.players.every(player => player.ready);
    
    // Return the updated lobby
    res.json({
      success: true,
      message: `Ready status set to ${ready}`,
      lobby,
      allReady
    });
  } catch (error) {
    console.error('Error setting ready status:', error);
    res.status(500).json({ error: 'Failed to set ready status' });
  }
});

/**
 * POST /lobby/start
 * Start the game from the lobby
 */
router.post('/start', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { lobbyId } = req.body;
    
    // Find the lobby
    const lobby = lobbies.get(lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    // Check if the user is the host
    if (lobby.host !== userId) {
      return res.status(403).json({ error: 'Only the host can start the game' });
    }
    
    // Check if all players are ready
    if (!lobby.players.every(player => player.ready)) {
      return res.status(400).json({ error: 'Not all players are ready' });
    }
    
    // Create a new game ID
    const gameId = encryptionUtils.hash(`game-${lobbyId}-${Date.now()}`);
    
    // Generate encryption key for sensitive data
    const encryptionKey = encryptionUtils.generateKey();
    
    // Create initial game state with players from the lobby
    const initialState = {
      gameId,
      players: lobby.players.map(player => ({
        playerId: player.id,
        faction: player.faction,
        role: player.id === lobby.host ? 'host' : 'guest',
        isActive: true
      })),
      currentPhase: 'setup',
      currentTurn: 1,
      currentPlayer: lobby.host,
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
        mode: lobby.mode,
        expansions: lobby.expansions,
        scenario: lobby.scenario
      }
    };
    
    // Create and save the game state
    const gameState = new GameState(initialState);
    await gameState.save();
    
    // Update lobby status
    lobby.status = 'playing';
    lobby.gameId = gameId;
    
    // Return the game ID and encryption key to all players via WebSocket
    // For now, just return to the host
    res.json({
      success: true,
      message: 'Game started successfully',
      gameId,
      encryptionKey
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

module.exports = router;
