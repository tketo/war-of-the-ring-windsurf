// src/redux/settingsSlice.js

/**
 * Redux slice for application settings
 */
const settingsSlice = {
  // Initial state
  initialState: {
    language: 'en', // Default language
    theme: 'light', // Default theme
    soundEnabled: true, // Sound effects
    animations: true, // Visual animations
    autoSave: true // Auto-save game state
  },
  
  // Action creators
  actions: {
    setLanguage: (language) => ({ type: 'SET_LANGUAGE', payload: language }),
    setTheme: (theme) => ({ type: 'SET_THEME', payload: theme }),
    toggleSound: () => ({ type: 'TOGGLE_SOUND' }),
    toggleAnimations: () => ({ type: 'TOGGLE_ANIMATIONS' }),
    toggleAutoSave: () => ({ type: 'TOGGLE_AUTO_SAVE' }),
    resetSettings: () => ({ type: 'RESET_SETTINGS' })
  },
  
  // Reducer
  reducer: (state = settingsSlice.initialState, action) => {
    switch (action.type) {
      case 'SET_LANGUAGE':
        return {
          ...state,
          language: action.payload
        };
        
      case 'SET_THEME':
        return {
          ...state,
          theme: action.payload
        };
        
      case 'TOGGLE_SOUND':
        return {
          ...state,
          soundEnabled: !state.soundEnabled
        };
        
      case 'TOGGLE_ANIMATIONS':
        return {
          ...state,
          animations: !state.animations
        };
        
      case 'TOGGLE_AUTO_SAVE':
        return {
          ...state,
          autoSave: !state.autoSave
        };
        
      case 'RESET_SETTINGS':
        return {
          ...settingsSlice.initialState
        };
        
      default:
        return state;
    }
  },
  
  // Middleware for handling settings changes
  middleware: (store) => (next) => (action) => {
    // First, pass the action to the next middleware or reducer
    const result = next(action);
    
    // Then handle settings persistence
    switch (action.type) {
      case 'SET_LANGUAGE':
      case 'SET_THEME':
      case 'TOGGLE_SOUND':
      case 'TOGGLE_ANIMATIONS':
      case 'TOGGLE_AUTO_SAVE':
      case 'RESET_SETTINGS':
        // Save settings to localStorage
        if (store && store.getState) {
          const settings = store.getState().settings;
          try {
            localStorage.setItem('wotr_settings', JSON.stringify(settings));
          } catch (error) {
            console.error('Error saving settings to localStorage:', error);
          }
        }
        break;
    }
    
    return result;
  }
};

// Make the slice available globally
window.settingsSlice = settingsSlice;

// Export the slice
export default settingsSlice;
