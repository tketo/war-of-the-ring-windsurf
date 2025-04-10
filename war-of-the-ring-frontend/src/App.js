// src/App.js
// Import React hooks
const { useState, useEffect } = React;
const { Provider } = ReactRedux;

/**
 * Main App component for War of the Ring
 */
const App = () => {
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    // Setup socket connection
    const connectToServer = async () => {
      try {
        // This would be replaced with actual socket.io connection
        console.log('Connecting to backend server...');
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Connected to backend server');
        setConnected(true);
        setSocketError(null);
      } catch (error) {
        console.error('Error connecting to server:', error);
        setConnected(false);
        setSocketError('Failed to connect to server. Please try again later.');
      }
    };
    
    connectToServer();

    return () => {
      // Cleanup socket connection
      console.log('Disconnecting from backend server');
      setConnected(false);
    };
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="bg-blue-800 text-white p-4 rounded-t-lg">
        <h1 className="text-3xl font-bold text-center">War of the Ring</h1>
        <p className="text-center text-sm mt-2">Digital Adaptation</p>
        
        <div className="flex justify-center mt-3">
          <div className={`inline-block px-3 py-1 rounded-full text-sm ${
            connected 
              ? 'bg-green-200 text-green-800' 
              : 'bg-red-200 text-red-800'
          }`}>
            {connected ? 'Connected to Server' : 'Disconnected'}
          </div>
        </div>
      </header>

      <main className="bg-white p-6 rounded-b-lg shadow-md mb-4">
        {socketError && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
            <p className="font-bold">Connection Error</p>
            <p>{socketError}</p>
          </div>
        )}
        
        {/* Game Controls */}
        {window.GameControls ? <GameControls /> : <div>Loading game controls...</div>}
        
        {/* Game Board */}
        {window.GameBoard ? <GameBoard /> : <div>Loading game board...</div>}
        
        {/* Player Information */}
        {window.PlayerInfo ? <PlayerInfo /> : <div>Loading player information...</div>}
      </main>

      <footer className="text-center text-gray-500 text-sm">
        <p>War of the Ring Digital Adaptation &copy; 2025</p>
      </footer>
    </div>
  );
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if all required components are loaded
  const checkComponentsLoaded = () => {
    const requiredComponents = [
      'GameBoard', 'PlayerInfo', 'GameControls', 
      'gameSlice', 'settingsSlice', 'configureAppStore'
    ];
    
    const missingComponents = requiredComponents.filter(comp => !window[comp]);
    
    if (missingComponents.length > 0) {
      console.log(`Waiting for components to load: ${missingComponents.join(', ')}`);
      setTimeout(checkComponentsLoaded, 100);
      return false;
    }
    
    return true;
  };
  
  const renderApp = () => {
    if (!checkComponentsLoaded()) return;
    
    console.log('All components loaded, rendering app');
    
    // Create store
    const store = configureAppStore();
    
    // Render the App
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  };
  
  // Start checking for components
  renderApp();
});
