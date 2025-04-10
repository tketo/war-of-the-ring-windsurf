// src/components/game/GameControls.js
const { useState } = React;
const { useSelector, useDispatch } = ReactRedux;

/**
 * GameControls component provides UI for game actions like start, save, load, undo, redo
 */
const GameControls = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(state => state.game.data);
  const isLoading = useSelector(state => state.game.isLoading);
  const error = useSelector(state => state.game.error);
  
  // State for new game form
  const [newGameSettings, setNewGameSettings] = useState({
    mode: 'full',
    expansions: [],
    scenario: 'standard'
  });
  
  // State for game ID and encryption key (for loading games)
  const [gameId, setGameId] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  
  /**
   * Handle starting a new game
   */
  const handleStartGame = (e) => {
    e.preventDefault();
    
    dispatch({
      type: 'GAME_START',
      payload: newGameSettings
    });
  };
  
  /**
   * Handle loading a game
   */
  const handleLoadGame = (e) => {
    e.preventDefault();
    
    if (!gameId || !encryptionKey) return;
    
    dispatch({
      type: 'GAME_LOAD',
      payload: { gameId, encryptionKey }
    });
  };
  
  /**
   * Handle saving the current game
   */
  const handleSaveGame = () => {
    if (!gameState) return;
    
    dispatch({
      type: 'GAME_SAVE',
      payload: {
        gameId: gameState.gameId,
        encryptionKey: localStorage.getItem(`encryptionKey_${gameState.gameId}`) || ''
      }
    });
  };
  
  /**
   * Handle undo action
   */
  const handleUndo = () => {
    if (!gameState) return;
    
    dispatch({
      type: 'GAME_UNDO',
      payload: {
        gameId: gameState.gameId,
        encryptionKey: localStorage.getItem(`encryptionKey_${gameState.gameId}`) || ''
      }
    });
  };
  
  /**
   * Handle redo action
   */
  const handleRedo = () => {
    if (!gameState) return;
    
    dispatch({
      type: 'GAME_REDO',
      payload: {
        gameId: gameState.gameId,
        encryptionKey: localStorage.getItem(`encryptionKey_${gameState.gameId}`) || '',
        redoAction: {} // This would be populated from a client-side redo stack
      }
    });
  };
  
  return (
    <div className="mb-6">
      {/* Game Status */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
        <h3 className="font-bold mb-2">Game Status</h3>
        {gameState ? (
          <div className="text-sm">
            <p>Game ID: <span className="font-mono">{gameState.gameId}</span></p>
            <p>Mode: {gameState.settings?.mode || 'N/A'}</p>
            <p>Phase: {gameState.currentPhase || 'N/A'}</p>
            <p>Turn: {gameState.currentTurn || 'N/A'}</p>
            <p>Current Player: {gameState.currentPlayer || 'N/A'}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No active game</p>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
          <p className="text-sm font-bold">Error</p>
          <p className="text-sm">{error.message || JSON.stringify(error)}</p>
        </div>
      )}
      
      {/* Game Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* New Game Form */}
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="font-bold mb-2">New Game</h3>
          <form onSubmit={handleStartGame}>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Game Mode</label>
              <select 
                className="w-full p-2 border rounded text-sm"
                value={newGameSettings.mode}
                onChange={(e) => setNewGameSettings({
                  ...newGameSettings,
                  mode: e.target.value
                })}
              >
                <option value="full">Full (Rules Enforced)</option>
                <option value="unrestricted">Unrestricted</option>
                <option value="companion">Companion</option>
              </select>
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Scenario</label>
              <select 
                className="w-full p-2 border rounded text-sm"
                value={newGameSettings.scenario}
                onChange={(e) => setNewGameSettings({
                  ...newGameSettings,
                  scenario: e.target.value
                })}
              >
                <option value="standard">Standard</option>
                <option value="quick">Quick Game</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start New Game'}
            </button>
          </form>
        </div>
        
        {/* Load Game Form */}
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="font-bold mb-2">Load Game</h3>
          <form onSubmit={handleLoadGame}>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Game ID</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded text-sm font-mono"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter game ID"
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Encryption Key</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded text-sm font-mono"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder="Enter encryption key"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-green-300"
              disabled={isLoading || !gameId || !encryptionKey}
            >
              {isLoading ? 'Loading...' : 'Load Game'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Game Actions */}
      {gameState && (
        <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
          <h3 className="font-bold mb-2">Game Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 text-sm"
              onClick={handleSaveGame}
              disabled={isLoading}
            >
              Save Game
            </button>
            
            <button 
              className="bg-amber-100 text-amber-800 px-3 py-1 rounded hover:bg-amber-200 text-sm"
              onClick={handleUndo}
              disabled={isLoading || !gameState.history || gameState.history.length === 0}
            >
              Undo
            </button>
            
            <button 
              className="bg-amber-100 text-amber-800 px-3 py-1 rounded hover:bg-amber-200 text-sm"
              onClick={handleRedo}
              disabled={isLoading}
            >
              Redo
            </button>
            
            <button 
              className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 text-sm"
              onClick={() => dispatch({ type: 'GAME_RESET' })}
            >
              End Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Make the component available globally
window.GameControls = GameControls;

export default GameControls;
