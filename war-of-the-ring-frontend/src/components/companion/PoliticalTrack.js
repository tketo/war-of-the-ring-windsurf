/**
 * Political Track Component for Companion Mode
 * 
 * Allows tracking of the political status of nations during physical gameplay.
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const PoliticalTrack = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const companionState = useSelector(state => state.companion);
  
  // Local state for political track
  const [politicalStatus, setPoliticalStatus] = useState({
    north: companionState?.political?.north || 0,
    rohan: companionState?.political?.rohan || 0,
    gondor: companionState?.political?.gondor || 0,
    elves: companionState?.political?.elves || 2, // Elves start at active
    dwarves: companionState?.political?.dwarves || 0,
    southEast: companionState?.political?.southEast || -2 // South/East starts at active for Shadow
  });
  
  // Political status labels
  const statusLabels = {
    '-2': t('companion.political.activeShadow'),
    '-1': t('companion.political.atWarShadow'),
    '0': t('companion.political.neutral'),
    '1': t('companion.political.atWarFreePeoples'),
    '2': t('companion.political.activeFreePeoples')
  };
  
  // Status colors
  const statusColors = {
    '-2': 'bg-red-200 text-red-800',
    '-1': 'bg-red-100 text-red-700',
    '0': 'bg-gray-100 text-gray-700',
    '1': 'bg-blue-100 text-blue-700',
    '2': 'bg-blue-200 text-blue-800'
  };
  
  // Handle political status change
  const handleStatusChange = (nation, direction) => {
    // Get current value
    const currentValue = politicalStatus[nation];
    
    // Calculate new value, ensuring it stays within -2 to 2 range
    let newValue = currentValue;
    if (direction === 'up' && currentValue < 2) {
      newValue = currentValue + 1;
    } else if (direction === 'down' && currentValue > -2) {
      newValue = currentValue - 1;
    }
    
    // Update state
    setPoliticalStatus({
      ...politicalStatus,
      [nation]: newValue
    });
  };
  
  // Save political status to Redux store
  const savePoliticalStatus = () => {
    dispatch({
      type: 'UPDATE_COMPANION_POLITICAL',
      payload: politicalStatus
    });
  };
  
  // Reset political status to default values
  const resetPoliticalStatus = () => {
    const defaultStatus = {
      north: 0,
      rohan: 0,
      gondor: 0,
      elves: 2, // Elves start at active
      dwarves: 0,
      southEast: -2 // South/East starts at active for Shadow
    };
    
    setPoliticalStatus(defaultStatus);
    
    dispatch({
      type: 'RESET_COMPANION_POLITICAL'
    });
  };
  
  // Render a nation's political status control
  const renderNationControl = (nation, label) => {
    const value = politicalStatus[nation];
    
    return (
      <div className="mb-3 border rounded p-2">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">{label}</span>
          <div className={`px-2 py-1 rounded text-xs ${statusColors[value]}`}>
            {statusLabels[value]}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            onClick={() => handleStatusChange(nation, 'down')}
            disabled={value <= -2}
          >
            -
          </button>
          
          <div className="flex items-center">
            {/* Status indicator dots */}
            <div className="flex space-x-1">
              <div className={`w-3 h-3 rounded-full ${value <= -2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${value <= -1 ? 'bg-red-400' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${value === 0 ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${value >= 1 ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${value >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>
          
          <button
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            onClick={() => handleStatusChange(nation, 'up')}
            disabled={value >= 2}
          >
            +
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-2">
      <div className="mb-4">
        {renderNationControl('north', t('companion.nations.north'))}
        {renderNationControl('rohan', t('companion.nations.rohan'))}
        {renderNationControl('gondor', t('companion.nations.gondor'))}
        {renderNationControl('elves', t('companion.nations.elves'))}
        {renderNationControl('dwarves', t('companion.nations.dwarves'))}
        {renderNationControl('southEast', t('companion.nations.southEast'))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <button 
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={resetPoliticalStatus}
        >
          {t('companion.reset')}
        </button>
        <button 
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={savePoliticalStatus}
        >
          {t('companion.save')}
        </button>
      </div>
    </div>
  );
};

export default PoliticalTrack;
