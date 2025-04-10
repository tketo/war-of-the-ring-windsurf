// src/components/game/GameBoard.js
const { useState, useEffect } = React;
const { useSelector, useDispatch } = ReactRedux;

/**
 * GameBoard component renders the main game map and handles region interactions
 */
const GameBoard = () => {
  const gameState = useSelector(state => state.game.data);
  const dispatch = useDispatch();
  
  // State for selected region and units
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);
  
  /**
   * Handle region click
   * @param {string} regionId - ID of the clicked region
   */
  const handleRegionClick = (regionId) => {
    if (!gameState) return;
    
    const region = gameState.regions.find(r => r.regionId === regionId);
    if (region) {
      setSelectedRegion(region);
    }
  };
  
  /**
   * Handle unit selection
   * @param {Object} unit - Unit to select/deselect
   */
  const handleUnitSelect = (unit) => {
    if (selectedUnits.some(u => u.type === unit.type && u.faction === unit.faction)) {
      setSelectedUnits(selectedUnits.filter(u => 
        !(u.type === unit.type && u.faction === unit.faction)
      ));
    } else {
      setSelectedUnits([...selectedUnits, unit]);
    }
  };
  
  /**
   * Initiate unit movement
   * @param {string} targetRegionId - Destination region ID
   */
  const handleMoveUnits = (targetRegionId) => {
    if (!selectedRegion || !selectedUnits.length) return;
    
    // Dispatch move action
    dispatch({
      type: 'GAME_ACTION',
      payload: {
        type: 'moveUnits',
        fromRegion: selectedRegion.regionId,
        toRegion: targetRegionId,
        units: selectedUnits
      }
    });
    
    // Reset selections
    setSelectedRegion(null);
    setSelectedUnits([]);
  };
  
  // If no game state, show placeholder
  if (!gameState) {
    return (
      <div className="border-2 border-gray-200 rounded-lg p-8 mb-6 bg-amber-50 text-center">
        <h2 className="text-2xl font-bold mb-4">Game Board</h2>
        <p className="text-gray-600">No active game. Start or join a game to begin.</p>
      </div>
    );
  }
  
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 mb-6 bg-amber-50">
      <h2 className="text-2xl font-bold text-center mb-4">Game Board</h2>
      
      {/* Map Placeholder - This would be replaced with an SVG map */}
      <div className="relative w-full h-96 bg-blue-100 rounded-lg mb-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-600">Interactive map will be implemented here</p>
        </div>
        
        {/* Example region elements - would be generated from game state */}
        {gameState.regions && gameState.regions.map(region => (
          <div 
            key={region.regionId}
            className={`absolute p-2 rounded-lg cursor-pointer ${
              selectedRegion?.regionId === region.regionId 
                ? 'bg-yellow-200 border-2 border-yellow-500' 
                : 'hover:bg-blue-200'
            }`}
            style={{
              // Placeholder positioning - would be based on map coordinates
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 80}%`,
              minWidth: '60px',
              minHeight: '40px'
            }}
            onClick={() => handleRegionClick(region.regionId)}
          >
            <div className="text-xs font-bold">{region.regionId}</div>
            {region.controlledBy && (
              <div className={`text-xs ${
                region.controlledBy === 'freePeoples' ? 'text-blue-700' : 'text-red-700'
              }`}>
                {region.controlledBy}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Region Details */}
      {selectedRegion && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold mb-2">{selectedRegion.regionId}</h3>
          <p className="text-sm mb-2">
            Controlled by: {selectedRegion.controlledBy || 'None'}
          </p>
          
          <h4 className="text-sm font-bold mt-2">Units:</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedRegion.units && selectedRegion.units.map((unit, index) => (
              <div 
                key={`${unit.type}-${unit.faction}-${index}`}
                className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                  selectedUnits.some(u => u.type === unit.type && u.faction === unit.faction)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => handleUnitSelect(unit)}
              >
                {unit.count} {unit.type} ({unit.faction})
              </div>
            ))}
          </div>
          
          {selectedUnits.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-bold">Selected Units:</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedUnits.map((unit, index) => (
                  <div 
                    key={`selected-${unit.type}-${unit.faction}-${index}`}
                    className="px-2 py-1 text-xs rounded-full bg-blue-500 text-white"
                  >
                    {unit.count} {unit.type} ({unit.faction})
                  </div>
                ))}
              </div>
              
              <div className="mt-2">
                <p className="text-xs mb-1">Select destination:</p>
                <div className="flex flex-wrap gap-1">
                  {gameState.regions
                    .filter(r => r.regionId !== selectedRegion.regionId)
                    .map(region => (
                      <button
                        key={`move-to-${region.regionId}`}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                        onClick={() => handleMoveUnits(region.regionId)}
                      >
                        {region.regionId}
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Make the component available globally
window.GameBoard = GameBoard;

export default GameBoard;
