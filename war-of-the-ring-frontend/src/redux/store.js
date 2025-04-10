// src/redux/store.js

/**
 * Configure the Redux store
 */
const configureAppStore = () => {
  // Access gameSlice and settingsSlice from the global scope
  const gameSliceObj = window.gameSlice || {
    initialState: { isLoading: false, error: null, data: null },
    reducer: (state, action) => state
  };
  
  const settingsSliceObj = window.settingsSlice || {
    initialState: { language: 'en', theme: 'light' },
    reducer: (state, action) => state
  };
  
  const companionSliceObj = window.companionSlice || {
    initialState: {},
    reducer: (state, action) => state
  };
  
  // Load settings from localStorage if available
  let savedSettings = {};
  try {
    const savedSettingsJson = localStorage.getItem('wotr_settings');
    if (savedSettingsJson) {
      savedSettings = JSON.parse(savedSettingsJson);
    }
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
  }
  
  // Load companion state from localStorage if available
  let savedCompanionState = {};
  try {
    const savedCompanionJson = localStorage.getItem('wotr_companion_state');
    if (savedCompanionJson) {
      savedCompanionState = JSON.parse(savedCompanionJson);
    }
  } catch (error) {
    console.error('Error loading companion state from localStorage:', error);
  }
  
  // Initial state with saved settings
  const preloadedState = {
    game: gameSliceObj.initialState,
    settings: {
      ...settingsSliceObj.initialState,
      ...savedSettings
    },
    companion: {
      ...companionSliceObj.initialState,
      ...savedCompanionState
    }
  };
  
  // Combine reducers
  const rootReducer = (state = {}, action) => {
    return {
      game: gameSliceObj.reducer(state.game, action),
      settings: settingsSliceObj.reducer(state.settings, action),
      companion: companionSliceObj.reducer(state.companion, action)
    };
  };
  
  // Create middleware array
  const middlewares = [];
  
  // Add gameSlice middleware if available
  if (gameSliceObj.middleware) {
    middlewares.push(gameSliceObj.middleware);
  }
  
  // Add settingsSlice middleware if available
  if (settingsSliceObj.middleware) {
    middlewares.push(settingsSliceObj.middleware);
  }
  
  // Add companionSlice middleware if available
  if (companionSliceObj.middleware) {
    middlewares.push(companionSliceObj.middleware);
  }
  
  // Configure store with Redux Toolkit
  const store = RTK.configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => [
      ...getDefaultMiddleware(),
      ...middlewares
    ],
    preloadedState
  });
  
  return store;
};

// Make the store configuration available globally
window.configureAppStore = configureAppStore;

export default configureAppStore;
