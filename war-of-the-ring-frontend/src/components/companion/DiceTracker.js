/**
 * Dice Tracker Component for Companion Mode
 * 
 * Allows tracking of action dice for both Free Peoples and Shadow players
 * during physical gameplay.
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const DiceTracker = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const companionState = useSelector(state => state.companion);
  
  // Local state for dice roll input
  const [freePeoplesDice, setFreePeoplesDice] = useState({
    character: 0,
    army: 0,
    muster: 0,
    event: 0,
    will: 0,
    unused: 0
  });
  
  const [shadowDice, setShadowDice] = useState({
    character: 0,
    army: 0,
    muster: 0,
    event: 0,
    eye: 0,
    unused: 0
  });
  
  // Handle dice count change
  const handleDiceChange = (faction, diceType, value) => {
    // Ensure value is a number between 0 and 10
    const numValue = Math.max(0, Math.min(10, parseInt(value) || 0));
    
    if (faction === 'freePeoples') {
      setFreePeoplesDice({
        ...freePeoplesDice,
        [diceType]: numValue
      });
    } else {
      setShadowDice({
        ...shadowDice,
        [diceType]: numValue
      });
    }
  };
  
  // Save dice counts to Redux store
  const saveDiceCounts = () => {
    dispatch({
      type: 'UPDATE_COMPANION_DICE',
      payload: {
        freePeoples: freePeoplesDice,
        shadow: shadowDice
      }
    });
  };
  
  // Reset dice counts
  const resetDiceCounts = () => {
    setFreePeoplesDice({
      character: 0,
      army: 0,
      muster: 0,
      event: 0,
      will: 0,
      unused: 0
    });
    
    setShadowDice({
      character: 0,
      army: 0,
      muster: 0,
      event: 0,
      eye: 0,
      unused: 0
    });
    
    dispatch({
      type: 'RESET_COMPANION_DICE'
    });
  };
  
  // Roll random dice (simulates dice roll for physical game)
  const rollRandomDice = (faction) => {
    const diceTypes = faction === 'freePeoples' 
      ? ['character', 'army', 'muster', 'event', 'will', 'will'] 
      : ['character', 'army', 'muster', 'event', 'eye', 'eye'];
    
    // Default dice counts based on game rules
    const diceCount = faction === 'freePeoples' ? 4 : 7;
    const result = {
      character: 0,
      army: 0,
      muster: 0,
      event: 0,
      will: 0,
      eye: 0,
      unused: 0
    };
    
    // Simulate dice rolls
    for (let i = 0; i < diceCount; i++) {
      const randomIndex = Math.floor(Math.random() * 6);
      const diceType = diceTypes[randomIndex];
      result[diceType]++;
    }
    
    // Update state
    if (faction === 'freePeoples') {
      setFreePeoplesDice(result);
    } else {
      setShadowDice(result);
    }
  };
  
  // Render dice input for a specific faction
  const renderDiceInputs = (faction, diceState, specialDie) => {
    const diceTypes = ['character', 'army', 'muster', 'event', specialDie, 'unused'];
    
    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">
            {faction === 'freePeoples' ? t('companion.freePeoples') : t('companion.shadow')}
          </h3>
          <div className="space-x-2">
            <button 
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              onClick={() => rollRandomDice(faction)}
            >
              {t('companion.rollDice')}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {diceTypes.map(diceType => (
            <div key={`${faction}-${diceType}`} className="flex flex-col items-center">
              <label className="text-xs mb-1">
                {t(`companion.diceTypes.${diceType}`)}
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={diceState[diceType]}
                onChange={(e) => handleDiceChange(faction, diceType, e.target.value)}
                className="w-12 h-8 text-center border rounded"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free Peoples Dice */}
        <div className="border rounded bg-blue-50">
          {renderDiceInputs('freePeoples', freePeoplesDice, 'will')}
        </div>
        
        {/* Shadow Dice */}
        <div className="border rounded bg-red-50">
          {renderDiceInputs('shadow', shadowDice, 'eye')}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-3">
        <button 
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={resetDiceCounts}
        >
          {t('companion.reset')}
        </button>
        <button 
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={saveDiceCounts}
        >
          {t('companion.save')}
        </button>
      </div>
      
      {/* Current Dice Summary */}
      {(companionState?.dice?.freePeoples || companionState?.dice?.shadow) && (
        <div className="mt-3 p-2 bg-gray-50 rounded border">
          <h4 className="font-semibold mb-1">{t('companion.currentDice')}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <strong>{t('companion.freePeoples')}:</strong>{' '}
              {companionState?.dice?.freePeoples ? (
                <span>
                  {Object.entries(companionState.dice.freePeoples)
                    .filter(([type, count]) => count > 0)
                    .map(([type, count]) => `${count} ${t(`companion.diceTypes.${type}`)}`)
                    .join(', ')}
                </span>
              ) : t('companion.none')}
            </div>
            <div>
              <strong>{t('companion.shadow')}:</strong>{' '}
              {companionState?.dice?.shadow ? (
                <span>
                  {Object.entries(companionState.dice.shadow)
                    .filter(([type, count]) => count > 0)
                    .map(([type, count]) => `${count} ${t(`companion.diceTypes.${type}`)}`)
                    .join(', ')}
                </span>
              ) : t('companion.none')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceTracker;
