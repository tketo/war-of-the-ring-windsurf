const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const Lobby = require('../../../models/lobby');
const Player = require('../../../models/player');

// Mock the authentication middleware
jest.mock('../../../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  }
}));

describe('Lobby Routes', () => {
  beforeEach(async () => {
    // Clear the lobbies and players collections before each test
    await Lobby.deleteMany({});
    await Player.deleteMany({});
    
    // Create a test player
    await Player.create({
      userId: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com'
    });
    
    // Create another test player
    await Player.create({
      userId: 'other-user-id',
      username: 'otheruser',
      email: 'other@example.com'
    });
  });

  describe('POST /lobby/create', () => {
    it('should create a new lobby', async () => {
      const response = await request(app)
        .post('/lobby/create')
        .send({
          name: 'Test Lobby',
          gameMode: 'standard',
          maxPlayers: 2,
          isPrivate: false
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('lobbyId');
      expect(response.body.data).toHaveProperty('name', 'Test Lobby');
      expect(response.body.data).toHaveProperty('host', 'test-user-id');
      expect(response.body.data).toHaveProperty('players');
      expect(response.body.data.players).toHaveLength(1);
      expect(response.body.data.players[0]).toBe('test-user-id');
      
      // Verify lobby was created in the database
      const lobby = await Lobby.findById(response.body.data.lobbyId);
      expect(lobby).toBeTruthy();
      expect(lobby.name).toBe('Test Lobby');
      expect(lobby.gameMode).toBe('standard');
      expect(lobby.maxPlayers).toBe(2);
      expect(lobby.isPrivate).toBe(false);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/lobby/create')
        .send({
          // Missing name
          gameMode: 'standard',
          maxPlayers: 2
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Missing required field');
    });

    it('should return 400 if game mode is invalid', async () => {
      const response = await request(app)
        .post('/lobby/create')
        .send({
          name: 'Test Lobby',
          gameMode: 'invalid-mode',
          maxPlayers: 2
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('must be one of');
    });
  });

  describe('GET /lobby/list', () => {
    beforeEach(async () => {
      // Create some test lobbies
      await Lobby.create({
        name: 'Public Lobby 1',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: false,
        host: 'test-user-id',
        players: ['test-user-id']
      });
      
      await Lobby.create({
        name: 'Public Lobby 2',
        gameMode: 'quick',
        maxPlayers: 4,
        isPrivate: false,
        host: 'other-user-id',
        players: ['other-user-id']
      });
      
      await Lobby.create({
        name: 'Private Lobby',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: true,
        host: 'other-user-id',
        players: ['other-user-id'],
        inviteCode: 'secret123'
      });
    });

    it('should list all public lobbies', async () => {
      const response = await request(app)
        .get('/lobby/list');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('lobbies');
      expect(response.body.data.lobbies).toHaveLength(2);
      
      // Verify only public lobbies are returned
      const lobbyNames = response.body.data.lobbies.map(lobby => lobby.name);
      expect(lobbyNames).toContain('Public Lobby 1');
      expect(lobbyNames).toContain('Public Lobby 2');
      expect(lobbyNames).not.toContain('Private Lobby');
      
      // Verify sensitive data is not exposed
      expect(response.body.data.lobbies[0]).not.toHaveProperty('inviteCode');
    });

    it('should filter lobbies by game mode', async () => {
      const response = await request(app)
        .get('/lobby/list?gameMode=standard');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.lobbies).toHaveLength(1);
      expect(response.body.data.lobbies[0].name).toBe('Public Lobby 1');
    });

    it('should filter lobbies by available slots', async () => {
      // Fill up Public Lobby 1
      await Lobby.findOneAndUpdate(
        { name: 'Public Lobby 1' },
        { players: ['test-user-id', 'other-user-id'] }
      );
      
      const response = await request(app)
        .get('/lobby/list?availableOnly=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.lobbies).toHaveLength(1);
      expect(response.body.data.lobbies[0].name).toBe('Public Lobby 2');
    });
  });

  describe('POST /lobby/join', () => {
    let publicLobbyId, privateLobbyId, fullLobbyId;

    beforeEach(async () => {
      // Create test lobbies
      const publicLobby = await Lobby.create({
        name: 'Public Lobby',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: false,
        host: 'other-user-id',
        players: ['other-user-id']
      });
      publicLobbyId = publicLobby._id.toString();
      
      const privateLobby = await Lobby.create({
        name: 'Private Lobby',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: true,
        host: 'other-user-id',
        players: ['other-user-id'],
        inviteCode: 'secret123'
      });
      privateLobbyId = privateLobby._id.toString();
      
      const fullLobby = await Lobby.create({
        name: 'Full Lobby',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: false,
        host: 'other-user-id',
        players: ['other-user-id', 'another-user-id']
      });
      fullLobbyId = fullLobby._id.toString();
    });

    it('should join a public lobby successfully', async () => {
      const response = await request(app)
        .post('/lobby/join')
        .send({
          lobbyId: publicLobbyId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('lobby');
      expect(response.body.data.lobby.players).toHaveLength(2);
      expect(response.body.data.lobby.players).toContain('test-user-id');
      
      // Verify the player was added to the lobby in the database
      const lobby = await Lobby.findById(publicLobbyId);
      expect(lobby.players).toHaveLength(2);
      expect(lobby.players).toContain('test-user-id');
    });

    it('should join a private lobby with the correct invite code', async () => {
      const response = await request(app)
        .post('/lobby/join')
        .send({
          lobbyId: privateLobbyId,
          inviteCode: 'secret123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.lobby.players).toHaveLength(2);
      expect(response.body.data.lobby.players).toContain('test-user-id');
    });

    it('should return 403 when joining a private lobby with incorrect invite code', async () => {
      const response = await request(app)
        .post('/lobby/join')
        .send({
          lobbyId: privateLobbyId,
          inviteCode: 'wrong-code'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid invite code');
    });

    it('should return 400 when joining a full lobby', async () => {
      const response = await request(app)
        .post('/lobby/join')
        .send({
          lobbyId: fullLobbyId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Lobby is full');
    });

    it('should return 400 when player is already in the lobby', async () => {
      // Join the lobby first
      await request(app)
        .post('/lobby/join')
        .send({
          lobbyId: publicLobbyId
        });
      
      // Try to join again
      const response = await request(app)
        .post('/lobby/join')
        .send({
          lobbyId: publicLobbyId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Already in this lobby');
    });
  });

  describe('POST /lobby/leave', () => {
    let lobbyId;

    beforeEach(async () => {
      // Create a test lobby with the test user already in it
      const lobby = await Lobby.create({
        name: 'Test Lobby',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: false,
        host: 'other-user-id',
        players: ['other-user-id', 'test-user-id']
      });
      lobbyId = lobby._id.toString();
    });

    it('should leave a lobby successfully', async () => {
      const response = await request(app)
        .post('/lobby/leave')
        .send({
          lobbyId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify the player was removed from the lobby in the database
      const lobby = await Lobby.findById(lobbyId);
      expect(lobby.players).toHaveLength(1);
      expect(lobby.players).not.toContain('test-user-id');
    });

    it('should return 404 when lobby does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/lobby/leave')
        .send({
          lobbyId: nonExistentId
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Lobby not found');
    });

    it('should return 400 when player is not in the lobby', async () => {
      // Create a lobby without the test user
      const newLobby = await Lobby.create({
        name: 'Another Lobby',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: false,
        host: 'other-user-id',
        players: ['other-user-id']
      });
      
      const response = await request(app)
        .post('/lobby/leave')
        .send({
          lobbyId: newLobby._id.toString()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Not in this lobby');
    });

    it('should transfer host if the host leaves', async () => {
      // Create a lobby with the test user as host
      const hostLobby = await Lobby.create({
        name: 'Host Lobby',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: false,
        host: 'test-user-id',
        players: ['test-user-id', 'other-user-id']
      });
      
      const response = await request(app)
        .post('/lobby/leave')
        .send({
          lobbyId: hostLobby._id.toString()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify host was transferred
      const lobby = await Lobby.findById(hostLobby._id);
      expect(lobby.host).toBe('other-user-id');
      expect(lobby.players).toHaveLength(1);
      expect(lobby.players).toContain('other-user-id');
    });

    it('should delete the lobby if the last player leaves', async () => {
      // Create a lobby with only the test user
      const soloLobby = await Lobby.create({
        name: 'Solo Lobby',
        gameMode: 'standard',
        maxPlayers: 2,
        isPrivate: false,
        host: 'test-user-id',
        players: ['test-user-id']
      });
      
      const response = await request(app)
        .post('/lobby/leave')
        .send({
          lobbyId: soloLobby._id.toString()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify lobby was deleted
      const lobby = await Lobby.findById(soloLobby._id);
      expect(lobby).toBeNull();
    });
  });
});
