// src/components/game/PlayerInfo.js
const { useSelector } = ReactRedux;

/**
 * PlayerInfo component displays information about players and their characters
 */
const PlayerInfo = () => {
  const gameState = useSelector(state => state.game.data);
  
  // If no game state, show placeholder
  if (!gameState) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-bold mb-2">Free Peoples</h3>
          <p className="text-sm text-gray-600">No active game</p>
        </div>
        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-bold mb-2">Shadow</h3>
          <p className="text-sm text-gray-600">No active game</p>
        </div>
      </div>
    );
  }
  
  // Group characters by faction
  const freePeoplesCharacters = gameState.characters ? gameState.characters.filter(c => 
    ['gondor', 'rohan', 'elves', 'dwarves', 'northmen'].includes(c.faction)
  ) : [];
  
  const shadowCharacters = gameState.characters ? gameState.characters.filter(c => 
    ['mordor', 'isengard', 'harad', 'rhun', 'angmar'].includes(c.faction)
  ) : [];
  
  // Group players by faction
  const freePeoplesPlayers = gameState.players ? gameState.players.filter(p => p.faction === 'freePeoples') : [];
  const shadowPlayers = gameState.players ? gameState.players.filter(p => p.faction === 'shadow') : [];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Free Peoples */}
      <div className="border border-gray-200 rounded p-4 bg-blue-50">
        <h3 className="font-bold mb-2 text-blue-800">Free Peoples</h3>
        
        {/* Players */}
        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-1">Players:</h4>
          {freePeoplesPlayers.length > 0 ? (
            <ul className="text-sm">
              {freePeoplesPlayers.map(player => (
                <li key={player.playerId} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full ${player.isActive ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
                  {player.playerId} ({player.role})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No players</p>
          )}
        </div>
        
        {/* Characters */}
        <div>
          <h4 className="text-sm font-semibold mb-1">Characters:</h4>
          {freePeoplesCharacters.length > 0 ? (
            <ul className="text-sm">
              {freePeoplesCharacters.map(character => (
                <li key={character.characterId} className="mb-1">
                  <div className="font-medium">{character.characterId}</div>
                  <div className="text-xs text-gray-600">
                    Location: {character.location} • 
                    Status: {character.status}
                    {character.modifiers && character.modifiers.length > 0 && (
                      <span> • Modifiers: {character.modifiers.join(', ')}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No characters</p>
          )}
        </div>
        
        {/* Action Dice */}
        {gameState.actionDice && gameState.actionDice.freePeoples && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-1">Action Dice:</h4>
            <div className="flex flex-wrap gap-1">
              {gameState.actionDice.freePeoples.map((die, index) => (
                <div 
                  key={`fp-die-${index}`}
                  className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center text-xs font-bold"
                >
                  {die.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Shadow */}
      <div className="border border-gray-200 rounded p-4 bg-red-50">
        <h3 className="font-bold mb-2 text-red-800">Shadow</h3>
        
        {/* Players */}
        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-1">Players:</h4>
          {shadowPlayers.length > 0 ? (
            <ul className="text-sm">
              {shadowPlayers.map(player => (
                <li key={player.playerId} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full ${player.isActive ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
                  {player.playerId} ({player.role})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No players</p>
          )}
        </div>
        
        {/* Characters */}
        <div>
          <h4 className="text-sm font-semibold mb-1">Characters:</h4>
          {shadowCharacters.length > 0 ? (
            <ul className="text-sm">
              {shadowCharacters.map(character => (
                <li key={character.characterId} className="mb-1">
                  <div className="font-medium">{character.characterId}</div>
                  <div className="text-xs text-gray-600">
                    Location: {character.location} • 
                    Status: {character.status}
                    {character.modifiers && character.modifiers.length > 0 && (
                      <span> • Modifiers: {character.modifiers.join(', ')}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No characters</p>
          )}
        </div>
        
        {/* Action Dice */}
        {gameState.actionDice && gameState.actionDice.shadow && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-1">Action Dice:</h4>
            <div className="flex flex-wrap gap-1">
              {gameState.actionDice.shadow.map((die, index) => (
                <div 
                  key={`shadow-die-${index}`}
                  className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center text-xs font-bold"
                >
                  {die.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Make the component available globally
window.PlayerInfo = PlayerInfo;

export default PlayerInfo;
