const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const clerk = require('@clerk/clerk-sdk-node');

// Define Player schema
const playerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'it'],
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    gamesWon: {
      type: Number,
      default: 0
    },
    freePeoplesPlayed: {
      type: Number,
      default: 0
    },
    shadowPlayed: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
playerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Player = mongoose.model('Player', playerSchema);

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
 * POST /player/register
 * Register a new player or update existing player
 */
router.post('/register', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { username, email, preferences } = req.body;
    
    // Check if player already exists
    let player = await Player.findOne({ playerId: userId });
    
    if (player) {
      // Update existing player
      player.username = username || player.username;
      player.email = email || player.email;
      
      if (preferences) {
        player.preferences = {
          ...player.preferences,
          ...preferences
        };
      }
      
      await player.save();
      
      return res.json({
        success: true,
        message: 'Player updated successfully',
        player
      });
    } else {
      // Create new player
      player = new Player({
        playerId: userId,
        username,
        email,
        preferences: preferences || {}
      });
      
      await player.save();
      
      return res.status(201).json({
        success: true,
        message: 'Player registered successfully',
        player
      });
    }
  } catch (error) {
    console.error('Error registering player:', error);
    res.status(500).json({ error: 'Failed to register player' });
  }
});

/**
 * GET /player/:id
 * Get player profile
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    
    // Find the player
    const player = await Player.findOne({ playerId: id });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Return the player profile
    res.json({
      success: true,
      player
    });
  } catch (error) {
    console.error('Error retrieving player:', error);
    res.status(500).json({ error: 'Failed to retrieve player' });
  }
});

/**
 * PUT /player/preferences
 * Update player preferences
 */
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { preferences } = req.body;
    
    // Find the player
    const player = await Player.findOne({ playerId: userId });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Update preferences
    player.preferences = {
      ...player.preferences,
      ...preferences
    };
    
    await player.save();
    
    // Return the updated player
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      player
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * PUT /player/stats
 * Update player stats (internal use only)
 */
router.put('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { stats } = req.body;
    
    // Find the player
    const player = await Player.findOne({ playerId: userId });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Update stats
    player.stats = {
      ...player.stats,
      ...stats
    };
    
    await player.save();
    
    // Return the updated player
    res.json({
      success: true,
      message: 'Stats updated successfully',
      player
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

module.exports = router;
