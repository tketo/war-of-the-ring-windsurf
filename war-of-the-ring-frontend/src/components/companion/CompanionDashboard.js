/**
 * Companion Dashboard Component
 * 
 * This component provides a simplified interface to assist with physical gameplay
 * by tracking dice rolls, Hunt Pool, Political Track, Victory Points, Corruption,
 * and Fellowship progress.
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

// Sub-components
import DiceTracker from './DiceTracker';
import HuntPool from './HuntPool';
import PoliticalTrack from './PoliticalTrack';
import VictoryPoints from './VictoryPoints';
import CorruptionTracker from './CorruptionTracker';
import FellowshipTracker from './FellowshipTracker';
import ValidActions from './ValidActions';

const CompanionDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const gameState = useSelector(state => state.game.data);
  const settings = useSelector(state => state.settings);
  
  // Local state for toggles
  const [showDice, setShowDice] = useState(true);
  const [showHunt, setShowHunt] = useState(true);
  const [showPolitical, setShowPolitical] = useState(true);
  const [showVictory, setShowVictory] = useState(true);
  const [showCorruption, setShowCorruption] = useState(true);
  const [showFellowship, setShowFellowship] = useState(true);
  const [showActions, setShowActions] = useState(true);
  
  // Handle section toggle
  const toggleSection = (section, currentState) => {
    switch(section) {
      case 'dice':
        setShowDice(!currentState);
        break;
      case 'hunt':
        setShowHunt(!currentState);
        break;
      case 'political':
        setShowPolitical(!currentState);
        break;
      case 'victory':
        setShowVictory(!currentState);
        break;
      case 'corruption':
        setShowCorruption(!currentState);
        break;
      case 'fellowship':
        setShowFellowship(!currentState);
        break;
      case 'actions':
        setShowActions(!currentState);
        break;
      default:
        break;
    }
  };
  
  // Handle reset of all trackers
  const handleReset = () => {
    if (window.confirm(t('companion.confirmReset'))) {
      dispatch({ type: 'RESET_COMPANION_STATE' });
    }
  };
  
  return (
    <div className="companion-dashboard">
      <header className="bg-blue-800 text-white p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold text-center">{t('companion.title')}</h1>
        <p className="text-center text-sm mt-2">{t('companion.subtitle')}</p>
      </header>
      
      <main className="bg-white p-4 rounded-b-lg shadow-md mb-4">
        {/* Control Panel */}
        <div className="flex flex-wrap justify-between items-center mb-4 p-2 bg-gray-100 rounded">
          <div className="text-lg font-bold">{t('companion.controlPanel')}</div>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleReset}
            >
              {t('companion.reset')}
            </button>
          </div>
        </div>
        
        {/* Toggleable Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dice Tracker */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <div 
              className="flex justify-between items-center p-2 bg-blue-100 cursor-pointer"
              onClick={() => toggleSection('dice', showDice)}
            >
              <h2 className="font-bold">{t('companion.diceTracker')}</h2>
              <span>{showDice ? '▼' : '►'}</span>
            </div>
            {showDice && <DiceTracker />}
          </div>
          
          {/* Hunt Pool */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <div 
              className="flex justify-between items-center p-2 bg-red-100 cursor-pointer"
              onClick={() => toggleSection('hunt', showHunt)}
            >
              <h2 className="font-bold">{t('companion.huntPool')}</h2>
              <span>{showHunt ? '▼' : '►'}</span>
            </div>
            {showHunt && <HuntPool />}
          </div>
          
          {/* Political Track */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <div 
              className="flex justify-between items-center p-2 bg-purple-100 cursor-pointer"
              onClick={() => toggleSection('political', showPolitical)}
            >
              <h2 className="font-bold">{t('companion.politicalTrack')}</h2>
              <span>{showPolitical ? '▼' : '►'}</span>
            </div>
            {showPolitical && <PoliticalTrack />}
          </div>
          
          {/* Victory Points */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <div 
              className="flex justify-between items-center p-2 bg-yellow-100 cursor-pointer"
              onClick={() => toggleSection('victory', showVictory)}
            >
              <h2 className="font-bold">{t('companion.victoryPoints')}</h2>
              <span>{showVictory ? '▼' : '►'}</span>
            </div>
            {showVictory && <VictoryPoints />}
          </div>
          
          {/* Corruption Tracker */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <div 
              className="flex justify-between items-center p-2 bg-gray-100 cursor-pointer"
              onClick={() => toggleSection('corruption', showCorruption)}
            >
              <h2 className="font-bold">{t('companion.corruptionTracker')}</h2>
              <span>{showCorruption ? '▼' : '►'}</span>
            </div>
            {showCorruption && <CorruptionTracker />}
          </div>
          
          {/* Fellowship Tracker */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <div 
              className="flex justify-between items-center p-2 bg-green-100 cursor-pointer"
              onClick={() => toggleSection('fellowship', showFellowship)}
            >
              <h2 className="font-bold">{t('companion.fellowshipTracker')}</h2>
              <span>{showFellowship ? '▼' : '►'}</span>
            </div>
            {showFellowship && <FellowshipTracker />}
          </div>
        </div>
        
        {/* Valid Actions */}
        <div className="mt-4 border border-gray-200 rounded overflow-hidden">
          <div 
            className="flex justify-between items-center p-2 bg-blue-200 cursor-pointer"
            onClick={() => toggleSection('actions', showActions)}
          >
            <h2 className="font-bold">{t('companion.validActions')}</h2>
            <span>{showActions ? '▼' : '►'}</span>
          </div>
          {showActions && <ValidActions />}
        </div>
      </main>
      
      <footer className="text-center text-gray-500 text-sm">
        <p>{t('companion.footer')}</p>
      </footer>
    </div>
  );
};

export default CompanionDashboard;
