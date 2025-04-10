/**
 * Redux Slice for Companion Mode
 * 
 * Manages state for the Companion Mode, which assists with physical gameplay
 * by tracking game elements like dice rolls, Hunt Pool, Political Track,
 * Victory Points, Corruption, and Fellowship progress.
 */

// Initial state for Companion Mode
const initialState = {
  // Dice tracking
  dice: {
    freePeoples: {
      character: 0,
      army: 0,
      muster: 0,
      event: 0,
      will: 0,
      unused: 0
    },
    shadow: {
      character: 0,
      army: 0,
      muster: 0,
      event: 0,
      eye: 0,
      unused: 0
    }
  },
  
  // Hunt Pool tracking
  hunt: {
    regular: 12, // Default starting value
    eye: 0,
    tileHistory: []
  },
  
  // Political Track
  political: {
    north: 0,    // 0 = neutral, negative = shadow, positive = free peoples
    rohan: 0,
    gondor: 0,
    elves: 2,    // Elves start at active
    dwarves: 0,
    southEast: -2 // South/East starts at active for Shadow
  },
  
  // Victory Points
  victoryPoints: {
    freePeoples: 0,
    shadow: 0,
    ringVictory: false,
    militaryVictory: false,
    winner: null
  },
  
  // Corruption tracking
  corruption: {
    current: 0,
    max: 12
  },
  
  // Fellowship tracking
  fellowship: {
    location: 0, // 0-10 representing progress steps
    hidden: true,
    companions: [
      { name: 'Gandalf the Grey', active: true },
      { name: 'Aragorn', active: true },
      { name: 'Boromir', active: true },
      { name: 'Legolas', active: true },
      { name: 'Gimli', active: true },
      { name: 'Meriadoc', active: true },
      { name: 'Peregrin', active: true },
      { name: 'Strider', active: false } // Alternate form of Aragorn
    ],
    ringBearers: [
      { name: 'Frodo', active: true },
      { name: 'Gollum', active: false }
    ]
  },
  
  // Game turn tracking
  turn: {
    current: 1,
    phase: 'fellowship', // fellowship, hunt, action, combat
    activePlayer: 'freePeoples'
  },
  
  // History of actions for reference
  history: []
};

// Action types
const UPDATE_COMPANION_DICE = 'UPDATE_COMPANION_DICE';
const RESET_COMPANION_DICE = 'RESET_COMPANION_DICE';
const UPDATE_COMPANION_HUNT = 'UPDATE_COMPANION_HUNT';
const RESET_COMPANION_HUNT = 'RESET_COMPANION_HUNT';
const UPDATE_COMPANION_POLITICAL = 'UPDATE_COMPANION_POLITICAL';
const RESET_COMPANION_POLITICAL = 'RESET_COMPANION_POLITICAL';
const UPDATE_COMPANION_VICTORY = 'UPDATE_COMPANION_VICTORY';
const RESET_COMPANION_VICTORY = 'RESET_COMPANION_VICTORY';
const UPDATE_COMPANION_CORRUPTION = 'UPDATE_COMPANION_CORRUPTION';
const RESET_COMPANION_CORRUPTION = 'RESET_COMPANION_CORRUPTION';
const UPDATE_COMPANION_FELLOWSHIP = 'UPDATE_COMPANION_FELLOWSHIP';
const RESET_COMPANION_FELLOWSHIP = 'RESET_COMPANION_FELLOWSHIP';
const UPDATE_COMPANION_TURN = 'UPDATE_COMPANION_TURN';
const RESET_COMPANION_TURN = 'RESET_COMPANION_TURN';
const ADD_COMPANION_HISTORY = 'ADD_COMPANION_HISTORY';
const CLEAR_COMPANION_HISTORY = 'CLEAR_COMPANION_HISTORY';
const RESET_COMPANION_STATE = 'RESET_COMPANION_STATE';

// Companion Slice
const companionSlice = {
  // Initial state
  initialState,
  
  // Action creators
  actions: {
    updateDice: (diceData) => ({ 
      type: UPDATE_COMPANION_DICE, 
      payload: diceData 
    }),
    resetDice: () => ({ 
      type: RESET_COMPANION_DICE 
    }),
    updateHunt: (huntData) => ({ 
      type: UPDATE_COMPANION_HUNT, 
      payload: huntData 
    }),
    resetHunt: () => ({ 
      type: RESET_COMPANION_HUNT 
    }),
    updatePolitical: (politicalData) => ({ 
      type: UPDATE_COMPANION_POLITICAL, 
      payload: politicalData 
    }),
    resetPolitical: () => ({ 
      type: RESET_COMPANION_POLITICAL 
    }),
    updateVictory: (victoryData) => ({ 
      type: UPDATE_COMPANION_VICTORY, 
      payload: victoryData 
    }),
    resetVictory: () => ({ 
      type: RESET_COMPANION_VICTORY 
    }),
    updateCorruption: (corruptionData) => ({ 
      type: UPDATE_COMPANION_CORRUPTION, 
      payload: corruptionData 
    }),
    resetCorruption: () => ({ 
      type: RESET_COMPANION_CORRUPTION 
    }),
    updateFellowship: (fellowshipData) => ({ 
      type: UPDATE_COMPANION_FELLOWSHIP, 
      payload: fellowshipData 
    }),
    resetFellowship: () => ({ 
      type: RESET_COMPANION_FELLOWSHIP 
    }),
    updateTurn: (turnData) => ({ 
      type: UPDATE_COMPANION_TURN, 
      payload: turnData 
    }),
    resetTurn: () => ({ 
      type: RESET_COMPANION_TURN 
    }),
    addHistory: (historyItem) => ({ 
      type: ADD_COMPANION_HISTORY, 
      payload: historyItem 
    }),
    clearHistory: () => ({ 
      type: CLEAR_COMPANION_HISTORY 
    }),
    resetState: () => ({ 
      type: RESET_COMPANION_STATE 
    })
  },
  
  // Reducer
  reducer: (state = initialState, action) => {
    switch (action.type) {
      case UPDATE_COMPANION_DICE:
        return {
          ...state,
          dice: {
            ...state.dice,
            ...action.payload
          },
          history: [
            ...state.history,
            {
              type: 'dice',
              data: action.payload,
              timestamp: Date.now()
            }
          ]
        };
        
      case RESET_COMPANION_DICE:
        return {
          ...state,
          dice: initialState.dice,
          history: [
            ...state.history,
            {
              type: 'reset',
              category: 'dice',
              timestamp: Date.now()
            }
          ]
        };
        
      case UPDATE_COMPANION_HUNT:
        return {
          ...state,
          hunt: {
            ...state.hunt,
            ...action.payload
          },
          history: [
            ...state.history,
            {
              type: 'hunt',
              data: action.payload,
              timestamp: Date.now()
            }
          ]
        };
        
      case RESET_COMPANION_HUNT:
        return {
          ...state,
          hunt: initialState.hunt,
          history: [
            ...state.history,
            {
              type: 'reset',
              category: 'hunt',
              timestamp: Date.now()
            }
          ]
        };
        
      case UPDATE_COMPANION_POLITICAL:
        return {
          ...state,
          political: {
            ...state.political,
            ...action.payload
          },
          history: [
            ...state.history,
            {
              type: 'political',
              data: action.payload,
              timestamp: Date.now()
            }
          ]
        };
        
      case RESET_COMPANION_POLITICAL:
        return {
          ...state,
          political: initialState.political,
          history: [
            ...state.history,
            {
              type: 'reset',
              category: 'political',
              timestamp: Date.now()
            }
          ]
        };
        
      case UPDATE_COMPANION_VICTORY:
        return {
          ...state,
          victoryPoints: {
            ...state.victoryPoints,
            ...action.payload
          },
          history: [
            ...state.history,
            {
              type: 'victory',
              data: action.payload,
              timestamp: Date.now()
            }
          ]
        };
        
      case RESET_COMPANION_VICTORY:
        return {
          ...state,
          victoryPoints: initialState.victoryPoints,
          history: [
            ...state.history,
            {
              type: 'reset',
              category: 'victory',
              timestamp: Date.now()
            }
          ]
        };
        
      case UPDATE_COMPANION_CORRUPTION:
        return {
          ...state,
          corruption: {
            ...state.corruption,
            ...action.payload
          },
          history: [
            ...state.history,
            {
              type: 'corruption',
              data: action.payload,
              timestamp: Date.now()
            }
          ]
        };
        
      case RESET_COMPANION_CORRUPTION:
        return {
          ...state,
          corruption: initialState.corruption,
          history: [
            ...state.history,
            {
              type: 'reset',
              category: 'corruption',
              timestamp: Date.now()
            }
          ]
        };
        
      case UPDATE_COMPANION_FELLOWSHIP:
        return {
          ...state,
          fellowship: {
            ...state.fellowship,
            ...action.payload
          },
          history: [
            ...state.history,
            {
              type: 'fellowship',
              data: action.payload,
              timestamp: Date.now()
            }
          ]
        };
        
      case RESET_COMPANION_FELLOWSHIP:
        return {
          ...state,
          fellowship: initialState.fellowship,
          history: [
            ...state.history,
            {
              type: 'reset',
              category: 'fellowship',
              timestamp: Date.now()
            }
          ]
        };
        
      case UPDATE_COMPANION_TURN:
        return {
          ...state,
          turn: {
            ...state.turn,
            ...action.payload
          },
          history: [
            ...state.history,
            {
              type: 'turn',
              data: action.payload,
              timestamp: Date.now()
            }
          ]
        };
        
      case RESET_COMPANION_TURN:
        return {
          ...state,
          turn: initialState.turn,
          history: [
            ...state.history,
            {
              type: 'reset',
              category: 'turn',
              timestamp: Date.now()
            }
          ]
        };
        
      case ADD_COMPANION_HISTORY:
        return {
          ...state,
          history: [
            ...state.history,
            {
              ...action.payload,
              timestamp: Date.now()
            }
          ]
        };
        
      case CLEAR_COMPANION_HISTORY:
        return {
          ...state,
          history: []
        };
        
      case RESET_COMPANION_STATE:
        return {
          ...initialState,
          history: [
            {
              type: 'reset',
              category: 'all',
              timestamp: Date.now()
            }
          ]
        };
        
      default:
        return state;
    }
  },
  
  // Middleware for persistence
  middleware: (store) => (next) => (action) => {
    // First, pass the action to the next middleware or reducer
    const result = next(action);
    
    // Then handle persistence for companion state
    if (action.type.startsWith('UPDATE_COMPANION_') || 
        action.type.startsWith('RESET_COMPANION_')) {
      try {
        // Get the current companion state
        const companionState = store.getState().companion;
        
        // Save to localStorage
        localStorage.setItem('wotr_companion_state', JSON.stringify(companionState));
      } catch (error) {
        console.error('Error saving companion state to localStorage:', error);
      }
    }
    
    return result;
  }
};

// Make the slice available globally
window.companionSlice = companionSlice;

// Export the slice
export default companionSlice;
