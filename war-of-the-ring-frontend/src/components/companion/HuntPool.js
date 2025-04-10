/**
 * Hunt Pool Component for Companion Mode
 * 
 * Allows tracking of the Hunt Pool and Hunt Tile draws during physical gameplay.
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const HuntPool = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const companionState = useSelector(state => state.companion);
  
  // Local state for Hunt Pool
  const [huntPool, setHuntPool] = useState({
    regular: companionState?.hunt?.regular || 0,
    eye: companionState?.hunt?.eye || 0
  });
  
  // Local state for Hunt Tile history
  const [huntTileHistory, setHuntTileHistory] = useState(
    companionState?.hunt?.tileHistory || []
  );
  
  // Local state for new tile draw
  const [newTile, setNewTile] = useState({
    type: 'regular', // 'regular', 'reveal', 'character'
    value: 0
  });
  
  // Handle Hunt Pool change
  const handlePoolChange = (type, value) => {
    // Ensure value is a number between 0 and 20
    const numValue = Math.max(0, Math.min(20, parseInt(value) || 0));
    
    setHuntPool({
      ...huntPool,
      [type]: numValue
    });
  };
  
  // Handle new tile type change
  const handleTileTypeChange = (e) => {
    setNewTile({
      ...newTile,
      type: e.target.value
    });
  };
  
  // Handle new tile value change
  const handleTileValueChange = (e) => {
    // Ensure value is a number between 0 and 6
    const numValue = Math.max(0, Math.min(6, parseInt(e.target.value) || 0));
    
    setNewTile({
      ...newTile,
      value: numValue
    });
  };
  
  // Add a new Hunt Tile to history
  const addHuntTile = () => {
    if (newTile.value === 0 && newTile.type !== 'character') {
      return; // Don't add tiles with 0 value (except character tiles)
    }
    
    const newHistory = [
      ...huntTileHistory,
      {
        ...newTile,
        timestamp: Date.now()
      }
    ];
    
    setHuntTileHistory(newHistory);
    
    // Reset the new tile input
    setNewTile({
      type: 'regular',
      value: 0
    });
  };
  
  // Remove a Hunt Tile from history
  const removeTile = (index) => {
    const newHistory = [...huntTileHistory];
    newHistory.splice(index, 1);
    setHuntTileHistory(newHistory);
  };
  
  // Save Hunt Pool to Redux store
  const saveHuntPool = () => {
    dispatch({
      type: 'UPDATE_COMPANION_HUNT',
      payload: {
        regular: huntPool.regular,
        eye: huntPool.eye,
        tileHistory: huntTileHistory
      }
    });
  };
  
  // Reset Hunt Pool
  const resetHuntPool = () => {
    // Default values based on game rules
    setHuntPool({
      regular: 12, // Starting regular hunt tiles
      eye: 0       // Starting eye tiles
    });
    
    setHuntTileHistory([]);
    
    dispatch({
      type: 'RESET_COMPANION_HUNT'
    });
  };
  
  // Draw a random Hunt Tile (simulates tile draw for physical game)
  const drawRandomTile = () => {
    // Calculate probabilities based on current pool
    const totalTiles = huntPool.regular + huntPool.eye;
    
    if (totalTiles === 0) {
      return; // No tiles to draw
    }
    
    // Determine if we draw an eye or regular tile
    const isEye = Math.random() < (huntPool.eye / totalTiles);
    
    if (isEye) {
      // Eye tile
      const newHistory = [
        ...huntTileHistory,
        {
          type: 'eye',
          value: 0, // Eye tiles don't have a numerical value
          timestamp: Date.now()
        }
      ];
      
      setHuntTileHistory(newHistory);
      
      // Reduce eye tiles in pool
      setHuntPool({
        ...huntPool,
        eye: Math.max(0, huntPool.eye - 1)
      });
    } else {
      // Regular tile - random value between 1 and 3
      const tileValue = Math.floor(Math.random() * 3) + 1;
      
      // Randomly determine if it's a reveal tile (25% chance)
      const tileType = Math.random() < 0.25 ? 'reveal' : 'regular';
      
      const newHistory = [
        ...huntTileHistory,
        {
          type: tileType,
          value: tileValue,
          timestamp: Date.now()
        }
      ];
      
      setHuntTileHistory(newHistory);
      
      // Reduce regular tiles in pool
      setHuntPool({
        ...huntPool,
        regular: Math.max(0, huntPool.regular - 1)
      });
    }
  };
  
  return (
    <div className="p-2">
      {/* Hunt Pool Counts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col items-center">
          <label className="text-sm mb-1">{t('companion.regularTiles')}</label>
          <input
            type="number"
            min="0"
            max="20"
            value={huntPool.regular}
            onChange={(e) => handlePoolChange('regular', e.target.value)}
            className="w-16 h-8 text-center border rounded"
          />
        </div>
        
        <div className="flex flex-col items-center">
          <label className="text-sm mb-1">{t('companion.eyeTiles')}</label>
          <input
            type="number"
            min="0"
            max="20"
            value={huntPool.eye}
            onChange={(e) => handlePoolChange('eye', e.target.value)}
            className="w-16 h-8 text-center border rounded"
          />
        </div>
      </div>
      
      {/* Add New Tile */}
      <div className="p-2 bg-gray-50 rounded border mb-3">
        <h4 className="font-semibold mb-2">{t('companion.addTile')}</h4>
        <div className="flex flex-wrap items-end space-x-2">
          <div>
            <label className="text-xs block mb-1">{t('companion.tileType')}</label>
            <select
              value={newTile.type}
              onChange={handleTileTypeChange}
              className="border rounded p-1"
            >
              <option value="regular">{t('companion.tileTypes.regular')}</option>
              <option value="reveal">{t('companion.tileTypes.reveal')}</option>
              <option value="eye">{t('companion.tileTypes.eye')}</option>
              <option value="character">{t('companion.tileTypes.character')}</option>
            </select>
          </div>
          
          {newTile.type !== 'eye' && (
            <div>
              <label className="text-xs block mb-1">{t('companion.tileValue')}</label>
              <input
                type="number"
                min="0"
                max="6"
                value={newTile.value}
                onChange={handleTileValueChange}
                className="w-12 h-8 text-center border rounded"
                disabled={newTile.type === 'eye'}
              />
            </div>
          )}
          
          <button 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={addHuntTile}
          >
            {t('companion.add')}
          </button>
          
          <button 
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            onClick={drawRandomTile}
          >
            {t('companion.drawRandom')}
          </button>
        </div>
      </div>
      
      {/* Hunt Tile History */}
      <div className="mb-3">
        <h4 className="font-semibold mb-2">{t('companion.tileHistory')}</h4>
        {huntTileHistory.length === 0 ? (
          <p className="text-sm text-gray-500">{t('companion.noTilesDrawn')}</p>
        ) : (
          <div className="max-h-40 overflow-y-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1">{t('companion.tileType')}</th>
                  <th className="p-1">{t('companion.tileValue')}</th>
                  <th className="p-1">{t('companion.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {huntTileHistory.map((tile, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-1 text-center">
                      {t(`companion.tileTypes.${tile.type}`)}
                    </td>
                    <td className="p-1 text-center">
                      {tile.type === 'eye' ? '-' : tile.value}
                    </td>
                    <td className="p-1 text-center">
                      <button 
                        className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                        onClick={() => removeTile(index)}
                      >
                        {t('companion.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <button 
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={resetHuntPool}
        >
          {t('companion.reset')}
        </button>
        <button 
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={saveHuntPool}
        >
          {t('companion.save')}
        </button>
      </div>
    </div>
  );
};

export default HuntPool;
