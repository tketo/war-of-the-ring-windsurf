// src/redux/gameSlice.js

/**
 * Redux slice for game state management
 */
const gameSlice = {
  // Initial state
  initialState: {
    isLoading: false,
    error: null,
    data: null,
    undoStack: [],
    redoStack: []
  },
  
  // Action creators
  actions: {
    gameLoading: () => ({ type: 'GAME_LOADING' }),
    gameLoaded: (data) => ({ type: 'GAME_LOADED', payload: data }),
    gameError: (error) => ({ type: 'GAME_ERROR', payload: error }),
    gameReset: () => ({ type: 'GAME_RESET' }),
    gameStart: (settings) => ({ type: 'GAME_START', payload: settings }),
    gameLoad: (params) => ({ type: 'GAME_LOAD', payload: params }),
    gameSave: (params) => ({ type: 'GAME_SAVE', payload: params }),
    gameUndo: (params) => ({ type: 'GAME_UNDO', payload: params }),
    gameRedo: (params) => ({ type: 'GAME_REDO', payload: params }),
    gameAction: (action) => ({ type: 'GAME_ACTION', payload: action })
  },
  
  // Reducer
  reducer: (state = gameSlice.initialState, action) => {
    switch (action.type) {
      case 'GAME_LOADING':
        return {
          ...state,
          isLoading: true,
          error: null
        };
        
      case 'GAME_LOADED':
        return {
          ...state,
          isLoading: false,
          error: null,
          data: action.payload
        };
        
      case 'GAME_ERROR':
        return {
          ...state,
          isLoading: false,
          error: action.payload
        };
        
      case 'GAME_RESET':
        return {
          ...gameSlice.initialState
        };
        
      // For other actions, we'll just return the current state
      // The actual logic will be handled by middleware
      default:
        return state;
    }
  },
  
  // Middleware for handling async actions
  middleware: (store) => (next) => (action) => {
    const { dispatch } = store;
    
    // First, pass the action to the next middleware or reducer
    const result = next(action);
    
    // Then handle async actions
    switch (action.type) {
      case 'GAME_START':
        handleGameStart(dispatch, action.payload);
        break;
        
      case 'GAME_LOAD':
        handleGameLoad(dispatch, action.payload);
        break;
        
      case 'GAME_SAVE':
        handleGameSave(dispatch, action.payload, store);
        break;
        
      case 'GAME_UNDO':
        handleGameUndo(dispatch, action.payload);
        break;
        
      case 'GAME_REDO':
        handleGameRedo(dispatch, action.payload);
        break;
        
      case 'GAME_ACTION':
        handleGameAction(dispatch, store.getState().game.data, action.payload);
        break;
    }
    
    return result;
  }
};

/**
 * Handle starting a new game
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} settings - Game settings
 */
async function handleGameStart(dispatch, settings) {
  dispatch(gameSlice.actions.gameLoading());
  
  try {
    // In a real implementation, this would make an API call
    // For now, we'll simulate it
    console.log('Starting new game with settings:', settings);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate response
    const response = {
      success: true,
      gameId: `game-${Date.now()}`,
      encryptionKey: `key-${Math.random().toString(36).substring(2, 15)}`,
      message: 'Game created successfully'
    };
    
    // Save encryption key to localStorage
    localStorage.setItem(`encryptionKey_${response.gameId}`, response.encryptionKey);
    
    // Load the game state
    handleGameLoad(dispatch, {
      gameId: response.gameId,
      encryptionKey: response.encryptionKey
    });
  } catch (error) {
    console.error('Error starting game:', error);
    dispatch(gameSlice.actions.gameError({
      message: 'Failed to start game',
      details: error.message
    }));
  }
}

/**
 * Handle loading a game
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} params - Load parameters
 */
async function handleGameLoad(dispatch, params) {
  const { gameId, encryptionKey } = params;
  
  dispatch(gameSlice.actions.gameLoading());
  
  try {
    // In a real implementation, this would make an API call
    // For now, we'll simulate it
    console.log('Loading game:', gameId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate game state
    // In a real implementation, this would come from the API
    const gameState = {
      gameId,
      players: [
        { playerId: 'player1', faction: 'freePeoples', role: 'gondor', isActive: true },
        { playerId: 'player2', faction: 'shadow', role: 'mordor', isActive: true }
      ],
      currentPhase: 'action',
      currentTurn: 1,
      currentPlayer: 'player1',
      actionDice: {
        freePeoples: ['character', 'army', 'muster'],
        shadow: ['character', 'army', 'muster', 'event']
      },
      characters: [
        { characterId: 'frodo', location: 'shire', status: 'active', modifiers: [], faction: 'gondor' },
        { characterId: 'gandalf', location: 'rivendell', status: 'active', modifiers: ['leader'], faction: 'gondor' },
        { characterId: 'saruman', location: 'isengard', status: 'active', modifiers: [], faction: 'isengard' },
        { characterId: 'witch-king', location: 'minas-morgul', status: 'active', modifiers: ['leader'], faction: 'mordor' }
      ],
      regions: [
        {
          regionId: 'gondor',
          controlledBy: 'freePeoples',
          units: [
            { type: 'regular', count: 3, faction: 'freePeoples' },
            { type: 'elite', count: 1, faction: 'freePeoples' }
          ]
        },
        {
          regionId: 'mordor',
          controlledBy: 'shadow',
          units: [
            { type: 'regular', count: 5, faction: 'shadow' },
            { type: 'elite', count: 2, faction: 'shadow' }
          ]
        },
        {
          regionId: 'rohan',
          controlledBy: 'freePeoples',
          units: [
            { type: 'regular', count: 2, faction: 'freePeoples' }
          ]
        },
        {
          regionId: 'isengard',
          controlledBy: 'shadow',
          units: [
            { type: 'regular', count: 3, faction: 'shadow' }
          ]
        }
      ],
      cards: {
        eventDeck: ['card1', 'card2', 'card3'],
        eventDiscard: [],
        combatDeck: ['combat1', 'combat2'],
        combatDiscard: [],
        playerHands: {
          player1: ['hand1', 'hand2'],
          player2: ['hand3', 'hand4']
        }
      },
      history: [
        {
          state: {},
          action: { type: 'setup', player: 'player1' },
          player: 'player1',
          committed: true,
          timestamp: Date.now() - 60000
        }
      ],
      settings: {
        mode: 'full',
        expansions: [],
        scenario: 'standard'
      }
    };
    
    dispatch(gameSlice.actions.gameLoaded(gameState));
  } catch (error) {
    console.error('Error loading game:', error);
    dispatch(gameSlice.actions.gameError({
      message: 'Failed to load game',
      details: error.message
    }));
  }
}

/**
 * Handle saving a game
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} params - Save parameters
 * @param {Object} store - Redux store
 */
async function handleGameSave(dispatch, params, store) {
  const { gameId, encryptionKey } = params;
  
  dispatch(gameSlice.actions.gameLoading());
  
  try {
    // In a real implementation, this would make an API call
    // For now, we'll simulate it
    console.log('Saving game:', gameId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate response
    const response = {
      success: true,
      message: 'Game saved successfully'
    };
    
    console.log('Game saved:', response);
    
    // Just reload the current state
    if (store && store.getState) {
      dispatch(gameSlice.actions.gameLoaded(store.getState().game.data));
    } else {
      // Fallback if store is not available
      handleGameLoad(dispatch, { gameId, encryptionKey });
    }
  } catch (error) {
    console.error('Error saving game:', error);
    dispatch(gameSlice.actions.gameError({
      message: 'Failed to save game',
      details: error.message
    }));
  }
}

/**
 * Handle undoing a move
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} params - Undo parameters
 */
async function handleGameUndo(dispatch, params) {
  const { gameId, encryptionKey } = params;
  
  dispatch(gameSlice.actions.gameLoading());
  
  try {
    // In a real implementation, this would make an API call
    // For now, we'll simulate it
    console.log('Undoing move in game:', gameId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, we'll just reload the current state
    // In a real implementation, this would get the updated state after undo
    handleGameLoad(dispatch, { gameId, encryptionKey });
  } catch (error) {
    console.error('Error undoing move:', error);
    dispatch(gameSlice.actions.gameError({
      message: 'Failed to undo move',
      details: error.message
    }));
  }
}

/**
 * Handle redoing a move
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} params - Redo parameters
 */
async function handleGameRedo(dispatch, params) {
  const { gameId, encryptionKey, redoAction } = params;
  
  dispatch(gameSlice.actions.gameLoading());
  
  try {
    // In a real implementation, this would make an API call
    // For now, we'll simulate it
    console.log('Redoing move in game:', gameId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, we'll just reload the current state
    // In a real implementation, this would get the updated state after redo
    handleGameLoad(dispatch, { gameId, encryptionKey });
  } catch (error) {
    console.error('Error redoing move:', error);
    dispatch(gameSlice.actions.gameError({
      message: 'Failed to redo move',
      details: error.message
    }));
  }
}

/**
 * Handle a game action (move, card play, etc.)
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} gameState - Current game state
 * @param {Object} action - Game action
 */
async function handleGameAction(dispatch, gameState, action) {
  if (!gameState) return;
  
  dispatch(gameSlice.actions.gameLoading());
  
  try {
    // In a real implementation, this would make an API call
    // For now, we'll simulate it
    console.log('Performing action in game:', gameState.gameId, action);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, we'll just reload the current state
    // In a real implementation, this would get the updated state after the action
    handleGameLoad(dispatch, { 
      gameId: gameState.gameId, 
      encryptionKey: localStorage.getItem(`encryptionKey_${gameState.gameId}`) || ''
    });
  } catch (error) {
    console.error('Error performing action:', error);
    dispatch(gameSlice.actions.gameError({
      message: 'Failed to perform action',
      details: error.message
    }));
  }
}

// Make the slice available globally
window.gameSlice = gameSlice;

// Export the slice
export default gameSlice;
