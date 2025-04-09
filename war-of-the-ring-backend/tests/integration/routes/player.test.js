const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const Player = require('../../../models/player');

// Mock the authentication middleware
jest.mock('../../../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  }
}));

describe('Player Routes', () => {
  beforeEach(async () => {
    // Clear the players collection before each test
    await Player.deleteMany({});
  });

  describe('POST /player/register', () => {
    it('should register a new player', async () => {
      const response = await request(app)
        .post('/player/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          preferences: {
            notifications: true,
            theme: 'dark'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('playerId');
      expect(response.body.data).toHaveProperty('username', 'testuser');
      
      // Verify player was created in the database
      const player = await Player.findById(response.body.data.playerId);
      expect(player).toBeTruthy();
      expect(player.username).toBe('testuser');
      expect(player.email).toBe('test@example.com');
      expect(player.preferences.theme).toBe('dark');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/player/register')
        .send({
          // Missing username
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Missing required field');
    });

    it('should return 409 if username already exists', async () => {
      // Create a player first
      await Player.create({
        userId: 'existing-user-id',
        username: 'testuser',
        email: 'existing@example.com'
      });
      
      const response = await request(app)
        .post('/player/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Username already taken');
    });
  });

  describe('GET /player/:id', () => {
    let playerId;

    beforeEach(async () => {
      // Create a test player
      const player = new Player({
        userId: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        stats: {
          gamesPlayed: 10,
          gamesWon: 5
        },
        preferences: {
          notifications: true,
          theme: 'dark'
        }
      });
      
      await player.save();
      playerId = player._id.toString();
    });

    it('should return player details for a valid player ID', async () => {
      const response = await request(app)
        .get(`/player/${playerId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('username', 'testuser');
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data.stats).toHaveProperty('gamesPlayed', 10);
      expect(response.body.data.stats).toHaveProperty('gamesWon', 5);
      // Should not expose sensitive information
      expect(response.body.data).not.toHaveProperty('email');
    });

    it('should return 404 for a non-existent player ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/player/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Player not found');
    });

    it('should return 400 for an invalid player ID format', async () => {
      const response = await request(app)
        .get('/player/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid player ID');
    });
  });

  describe('PUT /player/update', () => {
    let playerId;

    beforeEach(async () => {
      // Create a test player
      const player = new Player({
        userId: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        preferences: {
          notifications: true,
          theme: 'light'
        }
      });
      
      await player.save();
      playerId = player._id.toString();
    });

    it('should update player preferences', async () => {
      const response = await request(app)
        .put('/player/update')
        .send({
          preferences: {
            theme: 'dark',
            notifications: false
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('preferences');
      expect(response.body.data.preferences).toHaveProperty('theme', 'dark');
      expect(response.body.data.preferences).toHaveProperty('notifications', false);
      
      // Verify the update was applied in the database
      const player = await Player.findOne({ userId: 'test-user-id' });
      expect(player.preferences.theme).toBe('dark');
      expect(player.preferences.notifications).toBe(false);
    });

    it('should return 404 if player does not exist', async () => {
      // Delete the player first
      await Player.deleteMany({ userId: 'test-user-id' });
      
      const response = await request(app)
        .put('/player/update')
        .send({
          preferences: {
            theme: 'dark'
          }
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Player not found');
    });

    it('should not allow updating sensitive fields', async () => {
      const response = await request(app)
        .put('/player/update')
        .send({
          username: 'newusername',
          email: 'newemail@example.com',
          preferences: {
            theme: 'dark'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify sensitive fields were not updated
      const player = await Player.findOne({ userId: 'test-user-id' });
      expect(player.username).toBe('testuser');
      expect(player.email).toBe('test@example.com');
      expect(player.preferences.theme).toBe('dark');
    });
  });

  describe('GET /player/stats/:id', () => {
    let playerId;

    beforeEach(async () => {
      // Create a test player with stats
      const player = new Player({
        userId: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        stats: {
          gamesPlayed: 20,
          gamesWon: 10,
          freePeoplesPlayed: 12,
          shadowPlayed: 8,
          freePeoplesWon: 7,
          shadowWon: 3,
          averageGameLength: 45
        }
      });
      
      await player.save();
      playerId = player._id.toString();
    });

    it('should return detailed player stats', async () => {
      const response = await request(app)
        .get(`/player/stats/${playerId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data.stats).toHaveProperty('gamesPlayed', 20);
      expect(response.body.data.stats).toHaveProperty('gamesWon', 10);
      expect(response.body.data.stats).toHaveProperty('winRate', 50); // Calculated field
      expect(response.body.data.stats).toHaveProperty('freePeoplesPlayed', 12);
      expect(response.body.data.stats).toHaveProperty('shadowPlayed', 8);
    });

    it('should return 404 for a non-existent player ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/player/stats/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Player not found');
    });
  });
});
