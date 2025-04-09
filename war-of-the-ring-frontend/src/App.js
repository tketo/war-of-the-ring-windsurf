// src/App.js
const { useState, useEffect } = React;
const { Provider } = ReactRedux;
const { configureStore } = RTK;

// Initial Redux store setup
const initialState = {
  game: {
    isLoading: false,
    error: null,
    data: null
  },
  settings: {
    language: 'en'
  }
};

// Reducer
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GAME_LOADING':
      return {
        ...state,
        game: {
          ...state.game,
          isLoading: true
        }
      };
    case 'GAME_LOADED':
      return {
        ...state,
        game: {
          isLoading: false,
          error: null,
          data: action.payload
        }
      };
    case 'GAME_ERROR':
      return {
        ...state,
        game: {
          ...state.game,
          isLoading: false,
          error: action.payload
        }
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        settings: {
          ...state.settings,
          language: action.payload
        }
      };
    default:
      return state;
  }
};

// Store
const store = configureStore({
  reducer: rootReducer
});

// App Component
const App = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // This would be replaced with actual socket.io connection
    console.log('App mounted - would connect to backend here');
    setConnected(true);

    return () => {
      console.log('App unmounted - would disconnect from backend here');
      setConnected(false);
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <header className="bg-blue-800 text-white p-4 rounded-t-lg">
        <h1 className="text-3xl font-bold text-center">War of the Ring</h1>
        <p className="text-center text-sm mt-2">Digital Adaptation</p>
      </header>

      <main className="bg-white p-6 rounded-b-lg shadow-md mb-4">
        <div className="text-center mb-6">
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            {connected ? 'Connected to Server' : 'Disconnected'}
          </div>
        </div>

        <div className="border-2 border-gray-200 rounded-lg p-8 mb-6 bg-amber-50">
          <h2 className="text-2xl font-bold text-center mb-4">Game Board</h2>
          <p className="text-center text-gray-600">Game interface will be implemented here</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-bold mb-2">Free Peoples</h3>
            <p className="text-sm text-gray-600">Character information and stats will appear here</p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-bold mb-2">Shadow</h3>
            <p className="text-sm text-gray-600">Character information and stats will appear here</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-gray-500 text-sm">
        <p>War of the Ring Digital Adaptation &copy; 2025</p>
      </footer>
    </div>
  );
};

// Render the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
