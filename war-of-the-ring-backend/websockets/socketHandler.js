const clerk = require('@clerk/clerk-sdk-node');
const { GameState } = require('../models');
const { validateMove, applyMove } = require('../utils/rulesEngine');
const crypto = require('crypto');

/**
 * Socket.io handler for real-time game communication
 * @param {Object} io - Socket.io server instance
 */
function setupSocketHandlers(io) {
  // Map to store user authentication state
  const authenticatedUsers = new Map();
  
  // Map to store active game rooms
  const gameRooms = new Map();

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      try {
        // Verify token with Clerk
        const session = await clerk.verifyToken(token);
        
        // Store user data in socket
        socket.user = {
          id: session.sub,
          username: session.username || 'Anonymous'
        };
        
        // Add to authenticated users
        authenticatedUsers.set(socket.id, socket.user);
        
        next();
      } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('Internal server error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Join a game room
    socket.on('joinGame', async ({ gameId }) => {
      try {
        // Find the game
        const gameState = await GameState.findOne({ gameId });
        
        if (!gameState) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Check if user is a player or spectator
        const isPlayer = gameState.players.some(player => player.playerId === socket.user.id);
        const isSpectator = gameState.settings.spectatorMode === true;
        
        if (!isPlayer && !isSpectator) {
          socket.emit('error', { message: 'You are not authorized to join this game' });
          return;
        }
        
        // Leave previous game rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id && room.startsWith('game:')) {
            socket.leave(room);
          }
        });
        
        // Join the game room
        const roomName = `game:${gameId}`;
        socket.join(roomName);
        
        // Add to game rooms map if not already there
        if (!gameRooms.has(gameId)) {
          gameRooms.set(gameId, {
            players: [],
            spectators: []
          });
        }
        
        // Add user to the appropriate list
        const room = gameRooms.get(gameId);
        if (isPlayer) {
          if (!room.players.includes(socket.user.id)) {
            room.players.push(socket.user.id);
          }
        } else {
          if (!room.spectators.includes(socket.user.id)) {
            room.spectators.push(socket.user.id);
          }
        }
        
        // Notify room of new user
        socket.to(roomName).emit('userJoined', {
          userId: socket.user.id,
          username: socket.user.username,
          isPlayer,
          timestamp: Date.now()
        });
        
        // Send current game state to the user
        socket.emit('gameState', {
          gameState,
          players: room.players.length,
          spectators: room.spectators.length,
          timestamp: Date.now()
        });
        
        console.log(`User ${socket.user.id} joined game ${gameId}`);
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });
    
    // Leave a game room
    socket.on('leaveGame', ({ gameId }) => {
      try {
        const roomName = `game:${gameId}`;
        
        // Leave the room
        socket.leave(roomName);
        
        // Remove from game rooms map
        if (gameRooms.has(gameId)) {
          const room = gameRooms.get(gameId);
          
          // Remove from players list
          const playerIndex = room.players.indexOf(socket.user.id);
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
          }
          
          // Remove from spectators list
          const spectatorIndex = room.spectators.indexOf(socket.user.id);
          if (spectatorIndex !== -1) {
            room.spectators.splice(spectatorIndex, 1);
          }
          
          // Delete room if empty
          if (room.players.length === 0 && room.spectators.length === 0) {
            gameRooms.delete(gameId);
          }
        }
        
        // Notify room of user leaving
        socket.to(roomName).emit('userLeft', {
          userId: socket.user.id,
          username: socket.user.username,
          timestamp: Date.now()
        });
        
        console.log(`User ${socket.user.id} left game ${gameId}`);
      } catch (error) {
        console.error('Error leaving game:', error);
        socket.emit('error', { message: 'Failed to leave game' });
      }
    });
    
    // Handle game move
    socket.on('move', async ({ gameId, move }) => {
      try {
        // Find the game
        const gameState = await GameState.findOne({ gameId });
        
        if (!gameState) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Check if user is a player
        const isPlayer = gameState.players.some(player => player.playerId === socket.user.id);
        
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }
        
        // Add player ID to move if not present
        if (!move.player) {
          move.player = socket.user.id;
        }
        
        // Validate the move
        const validation = validateMove(gameState, move);
        
        if (!validation.isValid) {
          socket.emit('error', { message: validation.error });
          return;
        }
        
        // Apply the move
        const newState = applyMove(gameState, move);
        
        // Update the game state in the database
        Object.assign(gameState, newState);
        await gameState.save();
        
        // Notify all clients in the room of the state update
        const roomName = `game:${gameId}`;
        io.to(roomName).emit('stateUpdate', {
          gameState: newState,
          move,
          player: {
            id: socket.user.id,
            username: socket.user.username
          },
          timestamp: Date.now()
        });
        
        console.log(`User ${socket.user.id} made move in game ${gameId}`);
      } catch (error) {
        console.error('Error processing move:', error);
        socket.emit('error', { message: 'Failed to process move' });
      }
    });
    
    // Handle chat messages
    socket.on('chat', async ({ gameId, message, isPrivate, recipient }) => {
      try {
        // Find the game
        const gameState = await GameState.findOne({ gameId });
        
        if (!gameState) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Check if user is a player or spectator
        const isPlayer = gameState.players.some(player => player.playerId === socket.user.id);
        const isSpectator = gameState.settings.spectatorMode === true;
        
        if (!isPlayer && !isSpectator) {
          socket.emit('error', { message: 'You are not authorized to chat in this game' });
          return;
        }
        
        // Sanitize message
        const sanitizedMessage = message.substring(0, 500).trim();
        
        if (!sanitizedMessage) {
          socket.emit('error', { message: 'Empty message' });
          return;
        }
        
        // Create chat message object
        const chatMessage = {
          sender: {
            id: socket.user.id,
            username: socket.user.username
          },
          message: sanitizedMessage,
          isPlayer,
          isPrivate: !!isPrivate,
          timestamp: Date.now()
        };
        
        const roomName = `game:${gameId}`;
        
        // Handle private messages
        if (isPrivate && recipient) {
          // Find recipient socket
          const recipientSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.user && s.user.id === recipient);
          
          if (recipientSocket) {
            // Send to recipient and sender only
            recipientSocket.emit('chat', chatMessage);
            socket.emit('chat', chatMessage);
          } else {
            socket.emit('error', { message: 'Recipient not online' });
          }
        } else {
          // Broadcast to all in the room
          io.to(roomName).emit('chat', chatMessage);
        }
        
        console.log(`User ${socket.user.id} sent chat message in game ${gameId}`);
      } catch (error) {
        console.error('Error sending chat message:', error);
        socket.emit('error', { message: 'Failed to send chat message' });
      }
    });
    
    // Handle undo request
    socket.on('undo', async ({ gameId }) => {
      try {
        // Find the game
        const gameState = await GameState.findOne({ gameId });
        
        if (!gameState) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Check if user is a player
        const isPlayer = gameState.players.some(player => player.playerId === socket.user.id);
        
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }
        
        // Check if there's history to undo
        if (!gameState.history || gameState.history.length === 0) {
          socket.emit('error', { message: 'No moves to undo' });
          return;
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
            socket.emit('error', { message: 'No uncommitted moves to undo in the current phase' });
            return;
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
        
        // Notify all clients in the room of the state update
        const roomName = `game:${gameId}`;
        io.to(roomName).emit('stateUpdate', {
          gameState,
          undoBy: {
            id: socket.user.id,
            username: socket.user.username
          },
          timestamp: Date.now()
        });
        
        console.log(`User ${socket.user.id} undid move in game ${gameId}`);
      } catch (error) {
        console.error('Error undoing move:', error);
        socket.emit('error', { message: 'Failed to undo move' });
      }
    });
    
    // Handle redo request
    socket.on('redo', async ({ gameId, redoAction }) => {
      try {
        // Find the game
        const gameState = await GameState.findOne({ gameId });
        
        if (!gameState) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Check if user is a player
        const isPlayer = gameState.players.some(player => player.playerId === socket.user.id);
        
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }
        
        // Redo is essentially applying a new move that was previously undone
        // The client would need to keep track of undone moves
        if (!redoAction) {
          socket.emit('error', { message: 'No redo action provided' });
          return;
        }
        
        // Add player ID to move if not present
        if (!redoAction.player) {
          redoAction.player = socket.user.id;
        }
        
        // Validate and apply the redo action
        const validation = validateMove(gameState, redoAction);
        if (!validation.isValid) {
          socket.emit('error', { message: validation.error });
          return;
        }
        
        // Apply the move to get the new state
        const newState = applyMove(gameState, redoAction);
        
        // Update the game state in the database
        Object.assign(gameState, newState);
        await gameState.save();
        
        // Notify all clients in the room of the state update
        const roomName = `game:${gameId}`;
        io.to(roomName).emit('stateUpdate', {
          gameState: newState,
          redoBy: {
            id: socket.user.id,
            username: socket.user.username
          },
          timestamp: Date.now()
        });
        
        console.log(`User ${socket.user.id} redid move in game ${gameId}`);
      } catch (error) {
        console.error('Error redoing move:', error);
        socket.emit('error', { message: 'Failed to redo move' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove from authenticated users
      authenticatedUsers.delete(socket.id);
      
      // Leave all game rooms
      gameRooms.forEach((room, gameId) => {
        // Remove from players list
        const playerIndex = room.players.indexOf(socket.user?.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          
          // Notify room of user leaving
          const roomName = `game:${gameId}`;
          io.to(roomName).emit('userLeft', {
            userId: socket.user.id,
            username: socket.user.username,
            timestamp: Date.now()
          });
        }
        
        // Remove from spectators list
        const spectatorIndex = room.spectators.indexOf(socket.user?.id);
        if (spectatorIndex !== -1) {
          room.spectators.splice(spectatorIndex, 1);
        }
        
        // Delete room if empty
        if (room.players.length === 0 && room.spectators.length === 0) {
          gameRooms.delete(gameId);
        }
      });
    });
  });
}

module.exports = setupSocketHandlers;
