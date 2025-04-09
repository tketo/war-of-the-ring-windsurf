const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../server');
const Game = require('../../../models/game');

// Mock the authentication middleware
jest.mock('../../../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  }
}));

// Mock the logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn()
  },
  httpLogger: (req, res, next) => next(),
  securityLogger: {
    logAuthAttempt: jest.fn(),
    logAccessDenied: jest.fn(),
    logRateLimited: jest.fn(),
    logSuspiciousActivity: jest.fn()
  }
}));

describe('Game Routes', () => {
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  beforeEach(async () => {
    // Clear the games collection before each test
    await Game.deleteMany({});
  });

  describe('POST /game/start', () => {
    it('should create a new game', async () => {
      const response = await request(app)
        .post('/game/start')
        .send({
          mode: 'standard',
          players: [
            { id: 'test-user-id', faction: 'free-peoples' },
            { id: 'opponent-id', faction: 'shadow' }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('gameId');
      expect(response.body.data).toHaveProperty('state');
      
      // Verify game was created in the database
      const game = await Game.findById(response.body.data.gameId);
      expect(game).toBeTruthy();
      expect(game.mode).toBe('standard');
      expect(game.players).toHaveLength(2);
      expect(game.players[0].id).toBe('test-user-id');
      expect(game.players[0].faction).toBe('free-peoples');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/game/start')
        .send({
          // Missing mode field
          players: [
            { id: 'test-user-id', faction: 'free-peoples' },
            { id: 'opponent-id', faction: 'shadow' }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Missing required field');
    });

    it('should return 400 if player data is invalid', async () => {
      const response = await request(app)
        .post('/game/start')
        .send({
          mode: 'standard',
          players: [
            { id: 'test-user-id', faction: 'invalid-faction' },
            { id: 'opponent-id', faction: 'shadow' }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('must be one of');
    });
  });

  describe('GET /game/state/:id', () => {
    let gameId;

    beforeEach(async () => {
      // Create a test game
      const game = new Game({
        mode: 'standard',
        players: [
          { id: 'test-user-id', faction: 'free-peoples' },
          { id: 'opponent-id', faction: 'shadow' }
        ],
        state: {
          turn: 1,
          phase: 'fellowship',
          activePlayer: 'test-user-id',
          regions: [],
          characters: [],
          actionDice: []
        },
        history: []
      });
      
      await game.save();
      gameId = game._id.toString();
    });

    it('should return the game state for a valid game ID', async () => {
      const response = await request(app)
        .get(`/game/state/${gameId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('state');
      expect(response.body.data.state).toHaveProperty('turn', 1);
      expect(response.body.data.state).toHaveProperty('phase', 'fellowship');
    });

    it('should return 404 for a non-existent game ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/game/state/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Game not found');
    });

    it('should return 400 for an invalid game ID format', async () => {
      const response = await request(app)
        .get('/game/state/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid game ID');
    });
  });

  describe('POST /game/move', () => {
    let gameId;

    beforeEach(async () => {
      // Create a test game
      const game = new Game({
        mode: 'standard',
        players: [
          { id: 'test-user-id', faction: 'free-peoples' },
          { id: 'opponent-id', faction: 'shadow' }
        ],
        state: {
          turn: 1,
          phase: 'action',
          activePlayer: 'test-user-id',
          regions: [
            { id: 'gondor', controlledBy: 'free-peoples', units: [] },
            { id: 'mordor', controlledBy: 'shadow', units: [] }
          ],
          characters: [
            { id: 'aragorn', location: 'gondor', faction: 'free-peoples' }
          ],
          actionDice: [
            { value: 'character', used: false },
            { value: 'army', used: false }
          ]
        },
        history: []
      });
      
      await game.save();
      gameId = game._id.toString();
    });

    it('should process a valid move', async () => {
      const response = await request(app)
        .post('/game/move')
        .send({
          gameId,
          move: {
            type: 'character',
            character: 'aragorn',
            from: 'gondor',
            to: 'rohan'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('state');
      
      // Verify the move was applied in the database
      const game = await Game.findById(gameId);
      expect(game.state.characters[0].location).toBe('rohan');
      expect(game.history).toHaveLength(1);
    });

    it('should return 400 for an invalid move type', async () => {
      const response = await request(app)
        .post('/game/move')
        .send({
          gameId,
          move: {
            type: 'invalid-type',
            character: 'aragorn',
            from: 'gondor',
            to: 'rohan'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid move type');
    });

    it('should return 403 if not the active player', async () => {
      // Update the game to make the other player active
      await Game.findByIdAndUpdate(gameId, {
        'state.activePlayer': 'opponent-id'
      });
      
      const response = await request(app)
        .post('/game/move')
        .send({
          gameId,
          move: {
            type: 'character',
            character: 'aragorn',
            from: 'gondor',
            to: 'rohan'
          }
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Not your turn');
    });
  });

  describe('POST /game/save', () => {
    let gameId;

    beforeEach(async () => {
      // Create a test game
      const game = new Game({
        mode: 'standard',
        players: [
          { id: 'test-user-id', faction: 'free-peoples' },
          { id: 'opponent-id', faction: 'shadow' }
        ],
        state: {
          turn: 1,
          phase: 'action',
          activePlayer: 'test-user-id'
        }
      });
      
      await game.save();
      gameId = game._id.toString();
    });

    it('should save the game state', async () => {
      const response = await request(app)
        .post('/game/save')
        .send({
          gameId,
          name: 'Test Save'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('saveId');
      
      // Verify the save was created
      const game = await Game.findById(gameId);
      expect(game.saves).toHaveLength(1);
      expect(game.saves[0].name).toBe('Test Save');
      expect(game.saves[0].createdBy).toBe('test-user-id');
    });

    it('should return 404 for a non-existent game', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/game/save')
        .send({
          gameId: nonExistentId,
          name: 'Test Save'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Game not found');
    });
  });

  describe('POST /game/load', () => {
    let gameId, saveId;

    beforeEach(async () => {
      // Create a test game with a save
      const game = new Game({
        mode: 'standard',
        players: [
          { id: 'test-user-id', faction: 'free-peoples' },
          { id: 'opponent-id', faction: 'shadow' }
        ],
        state: {
          turn: 5,
          phase: 'action',
          activePlayer: 'opponent-id'
        },
        saves: [{
          name: 'Test Save',
          createdBy: 'test-user-id',
          createdAt: new Date(),
          state: {
            turn: 1,
            phase: 'fellowship',
            activePlayer: 'test-user-id'
          }
        }]
      });
      
      await game.save();
      gameId = game._id.toString();
      saveId = game.saves[0]._id.toString();
    });

    it('should load a saved game state', async () => {
      const response = await request(app)
        .post('/game/load')
        .send({
          gameId,
          saveId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('state');
      expect(response.body.data.state.turn).toBe(1);
      expect(response.body.data.state.phase).toBe('fellowship');
      
      // Verify the game state was updated in the database
      const game = await Game.findById(gameId);
      expect(game.state.turn).toBe(1);
      expect(game.state.phase).toBe('fellowship');
    });

    it('should return 404 for a non-existent save', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/game/load')
        .send({
          gameId,
          saveId: nonExistentId
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Save not found');
    });
  });
});
