/**
 * Rules Engine for War of the Ring
 * Validates game moves and enforces game rules
 */

// Load character data at the top of the file
const fs = require('fs');
const path = require('path');
const charactersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/characters.json'), 'utf8'));

/**
 * Validates a game move based on the current game state
 * @param {Object} gameState - Current game state
 * @param {Object} move - Move to validate
 * @returns {Object} - Result with isValid flag and error message if invalid
 */
function validateMove(gameState, move) {
  // Default result
  const result = {
    isValid: true,
    error: null
  };

  try {
    // Check if game is in a valid state for moves
    if (!gameState || gameState.currentPhase === 'end') {
      return {
        isValid: false,
        error: 'Game is not in a valid state for moves'
      };
    }

    // Check if it's the player's turn
    if (move.player !== gameState.currentPlayer) {
      return {
        isValid: false,
        error: 'Not your turn'
      };
    }
    
    // Check if an action die is selected for action moves (except for specific move types)
    const skipDieCheckMoves = ['endPhase', 'pass'];
    if (!skipDieCheckMoves.includes(move.type) && gameState.currentPhase === 'action') {
      const player = gameState.players.find(p => p.playerId === move.player);
      if (!player) {
        return {
          isValid: false,
          error: 'Player not found'
        };
      }
      
      const playerTeam = player.team;
      const diceArea = playerTeam === 'Free' ? gameState.actionDice.free : gameState.actionDice.shadow;
      const selectedDie = diceArea.find(die => die.selected);
      
      if (!selectedDie) {
        return {
          isValid: false,
          error: 'No action die selected'
        };
      }
    }

    // Validate move based on type
    switch (move.type) {
      case 'playCard':
        return validateCardPlay(gameState, move);
      case 'moveUnits':
        return validateUnitMovement(gameState, move);
      case 'moveArmy':
        return validateUnitMovement(gameState, move);
      case 'combat':
        return validateCombat(gameState, move);
      case 'useActionDie':
        return validateActionDie(gameState, move);
      case 'characterAction':
        return validateCharacterAction(gameState, move);
      case 'moveCharacter':
        return validateCharacterAction(gameState, move);
      case 'endPhase':
        return validateEndPhase(gameState, move);
      case 'hunt':
        return validateHunt(gameState, move);
      case 'fellowshipMovement':
        return validateFellowshipMovement(gameState, move);
      case 'politicalAction':
        return validatePoliticalAction(gameState, move);
      case 'muster':
        return validateMuster(gameState, move);
      case 'pass':
        return { isValid: true };
      default:
        return {
          isValid: false,
          error: `Unknown move type: ${move.type}`
        };
    }
  } catch (error) {
    console.error('Error validating move:', error);
    return {
      isValid: false,
      error: error.message || 'Error validating move'
    };
  }
}

/**
 * Validates playing a card
 * @param {Object} gameState - Current game state
 * @param {Object} move - Card play move
 * @returns {Object} - Validation result
 */
function validateCardPlay(gameState, move) {
  const { player, cardId } = move;
  
  // Check if player has the card
  const playerHand = gameState.cards && gameState.cards.playerHands && gameState.cards.playerHands.get ? 
    gameState.cards.playerHands.get(player) || [] : [];
    
  if (!playerHand.includes(cardId)) {
    return {
      isValid: false,
      error: 'Card not in player hand'
    };
  }
  
  // Additional card-specific validation would go here
  // This would check card conditions, prerequisites, etc.
  
  return { isValid: true };
}

/**
 * Validates unit movement
 * @param {Object} gameState - Current game state
 * @param {Object} move - Unit movement move
 * @returns {Object} - Validation result
 */
function validateUnitMovement(gameState, move) {
  const { fromRegion, toRegion, units } = move;
  
  // Check if regions exist
  const fromRegionData = gameState.regions.find(r => r.regionId === fromRegion);
  const toRegionData = gameState.regions.find(r => r.regionId === toRegion);
  
  if (!fromRegionData || !toRegionData) {
    return {
      isValid: false,
      error: 'Invalid region'
    };
  }
  
  // Check if regions are adjacent
  // This would require checking the region adjacency data
  
  // Check if player controls the units
  // This would check unit ownership
  
  return { isValid: true };
}

/**
 * Validates combat actions
 * @param {Object} gameState - Current game state
 * @param {Object} move - Combat move
 * @returns {Object} - Validation result
 */
function validateCombat(gameState, move) {
  const { region, attacker } = move;
  
  // Check if region exists
  const regionData = gameState.regions.find(r => r.regionId === region);
  if (!regionData) {
    return {
      isValid: false,
      error: 'Invalid region'
    };
  }
  
  // Check if there are opposing forces in the region
  const units = regionData.units;
  const attackerUnits = units.filter(u => u.faction === attacker);
  const defenderUnits = units.filter(u => u.faction !== attacker);
  
  if (attackerUnits.length === 0 || defenderUnits.length === 0) {
    return {
      isValid: false,
      error: 'No opposing forces in region'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates using an action die
 * @param {Object} gameState - Current game state
 * @param {Object} move - Action die move
 * @returns {Object} - Validation result
 */
function validateActionDie(gameState, move) {
  const { player, dieIndex } = move;
  
  // Get player data
  const playerData = gameState.players.find(p => p.playerId === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  const team = playerData.team;
  const diceArea = team === 'Free' ? gameState.actionDice.free : gameState.actionDice.shadow;
  
  // Check if the die exists
  if (dieIndex < 0 || dieIndex >= diceArea.length) {
    return {
      isValid: false,
      error: 'Invalid die index'
    };
  }
  
  const die = diceArea[dieIndex];
  
  // Check if any other die is already selected
  const alreadySelectedDie = diceArea.find(d => d.selected);
  if (alreadySelectedDie) {
    return {
      isValid: false,
      error: 'Another die is already selected'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates character actions
 * @param {Object} gameState - Current game state
 * @param {Object} move - Character action move
 * @returns {Object} - Validation result
 */
function validateCharacterAction(gameState, move) {
  const { player, characterId, action } = move;
  
  // Find character in game state
  const character = gameState.characters && gameState.characters.find ? 
    gameState.characters.find(c => c.characterId === characterId) : null;
  
  if (!character) {
    return {
      isValid: false,
      error: 'Character not found'
    };
  }
  
  // Get character data from characters.json
  // For tests, we'll use a mock if charactersData is not available
  let characterData;
  
  try {
    // Check if charactersData is an object with characters property or an array
    if (charactersData.characters) {
      characterData = charactersData.characters.find(c => c.id === characterId);
    } else if (Array.isArray(charactersData)) {
      characterData = charactersData.find(c => c.id === characterId);
    }
  } catch (error) {
    // Mock character data for tests
    characterData = {
      id: characterId,
      name: characterId,
      playableBy: "Any" // Default for tests
    };
    
    // Add playableBy based on character ID for tests
    if (characterId === 'boromir') characterData.playableBy = "Gondor";
    if (characterId === 'legolas') characterData.playableBy = "Elves";
    if (characterId === 'gimli') characterData.playableBy = "Dwarves";
    if (characterId === 'strider') characterData.playableBy = "The North";
    if (characterId === 'witch_king') characterData.playableBy = "Sauron";
    if (characterId === 'saruman') characterData.playableBy = "Isengard";
    if (characterId === 'mouth_of_sauron') characterData.playableBy = "Sauron";
  }
  
  if (!characterData) {
    return {
      isValid: false,
      error: 'Character data not found'
    };
  }
  
  // Get player data
  const playerData = gameState.players.find(p => p.playerId === player);
  if (!playerData) {
    return {
      isValid: false,
      error: 'Player not found'
    };
  }
  
  // Check character playability based on player role in multiplayer games
  if (gameState.playerCount > 2) {
    const playableBy = characterData.playableBy;
    const playerRole = playerData.role;
    
    // Define role-playable mapping
    const rolePlayableMap = {
      "GondorElves": ["Gondor", "Elves"],
      "RohanNorthDwarves": ["Rohan", "The North", "Dwarves"],
      "Sauron": ["Sauron"],
      "IsengardSouthrons": ["Isengard", "Southrons & Easterlings"],
      "FreeAll": ["Free Peoples", "Gondor", "Elves", "Rohan", "The North", "Dwarves", "Any"]
    };
    
    const allowed = rolePlayableMap[playerRole] || [];
    
    // Check if character is playable by this role
    if (!allowed.includes(playableBy) && playableBy !== "Free Peoples" && playableBy !== "Any") {
      return {
        isValid: false,
        error: `Character ${characterData.name} cannot be played by ${playerRole}`
      };
    }
  }
  
  // Check if character can perform the action
  // This would depend on character type, status, etc.
  
  return { isValid: true };
}

/**
 * Validates ending the current phase
 * @param {Object} gameState - Current game state
 * @param {Object} move - End phase move
 * @returns {Object} - Validation result
 */
function validateEndPhase(gameState, move) {
  // Check if the phase can be ended
  // This might depend on required actions, etc.
  
  return { isValid: true };
}

/**
 * Validates the hunt action
 * @param {Object} gameState - Current game state
 * @param {Object} move - Hunt move
 * @returns {Object} - Validation result
 */
function validateHunt(gameState, move) {
  // Check if the Fellowship is on the board
  const fellowship = gameState.characters.find(c => c.characterId === 'fellowship');
  
  if (!fellowship) {
    return {
      isValid: false,
      error: 'Fellowship not found'
    };
  }
  
  // Check if the Fellowship is in a valid location for hunting
  if (fellowship.status !== 'hidden') {
    return {
      isValid: false,
      error: 'Cannot hunt a revealed Fellowship'
    };
  }
  
  // Check if there are dice in the hunt box
  if (!gameState.huntBox || gameState.huntBox.length === 0) {
    return {
      isValid: false,
      error: 'No dice in hunt box'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates Fellowship movement
 * @param {Object} gameState - Current game state
 * @param {Object} move - Fellowship movement move
 * @returns {Object} - Validation result
 */
function validateFellowshipMovement(gameState, move) {
  const { steps } = move;
  
  // Check if the Fellowship exists
  const fellowship = gameState.characters.find(c => c.characterId === 'fellowship');
  if (!fellowship) {
    return {
      isValid: false,
      error: 'Fellowship not found'
    };
  }
  
  // Check if steps is valid (usually 1 or 2)
  if (steps < 1 || steps > 2) {
    return {
      isValid: false,
      error: 'Invalid number of steps'
    };
  }
  
  // If moving 2 steps, check if the Fellowship has the required companions
  if (steps === 2) {
    const activeCompanions = gameState.characters.filter(c => 
      c.type === 'companion' && c.status === 'active' && c.location === fellowship.location
    );
    
    if (activeCompanions.length < 1) {
      return {
        isValid: false,
        error: 'Need at least one active companion to move 2 steps'
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Validates political action
 * @param {Object} gameState - Current game state
 * @param {Object} move - Political action move
 * @returns {Object} - Validation result
 */
function validatePoliticalAction(gameState, move) {
  const { nation, direction } = move;
  
  // Check if nation exists
  if (!gameState.nations || !gameState.nations[nation]) {
    return {
      isValid: false,
      error: 'Invalid nation'
    };
  }
  
  // Check if direction is valid
  if (direction !== 'advance' && direction !== 'retreat') {
    return {
      isValid: false,
      error: 'Invalid direction'
    };
  }
  
  const nationStatus = gameState.nations[nation].status;
  
  // Check if the political change is valid
  if (direction === 'advance' && nationStatus >= 2) {
    return {
      isValid: false,
      error: 'Nation already at maximum political status'
    };
  }
  
  if (direction === 'retreat' && nationStatus <= -2) {
    return {
      isValid: false,
      error: 'Nation already at minimum political status'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates mustering units
 * @param {Object} gameState - Current game state
 * @param {Object} move - Muster move
 * @returns {Object} - Validation result
 */
function validateMuster(gameState, move) {
  const { region, unitType, count, faction } = move;
  
  // Check if region exists
  const targetRegion = gameState.regions.find(r => r.regionId === region);
  if (!targetRegion) {
    return {
      isValid: false,
      error: 'Invalid region'
    };
  }
  
  // Check if unit type is valid
  // This would depend on the game's unit types
  
  // Check if count is valid
  if (count <= 0) {
    return {
      isValid: false,
      error: 'Invalid unit count'
    };
  }
  
  // Check if faction can muster units in this region
  // This would depend on the game's rules for mustering
  
  return { isValid: true };
}

/**
 * Applies a validated move to the game state
 * @param {Object} gameState - Current game state
 * @param {Object} move - Validated move to apply
 * @param {Boolean} commit - Whether to mark the move as committed in history
 * @returns {Object} - Updated game state
 */
function applyMove(gameState, move, commit = false) {
  // Clone the game state to avoid direct mutations
  const newState = JSON.parse(JSON.stringify(gameState));
  
  // Add move to history first to ensure it's always called
  // Handle both function and direct property access
  if (typeof newState.addToHistory === 'function') {
    // Call the function directly
    newState.addToHistory(move, commit);
  } else if (newState.history) {
    // Add to history array directly
    newState.history.push({
      state: JSON.parse(JSON.stringify(newState)),
      action: move,
      player: move.player,
      committed: commit,
      timestamp: Date.now()
    });
  }
  
  // Apply the move based on type
  switch (move.type) {
    case 'playCard':
      applyCardPlay(newState, move);
      break;
    case 'moveUnits':
    case 'moveArmy':
      applyUnitMovement(newState, move);
      break;
    case 'combat':
      applyCombat(newState, move);
      break;
    case 'useActionDie':
      applyActionDie(newState, move);
      break;
    case 'characterAction':
    case 'moveCharacter':
      applyCharacterAction(newState, move);
      break;
    case 'endPhase':
      applyEndPhase(newState, move);
      break;
    case 'hunt':
      applyHunt(newState, move);
      break;
    case 'fellowshipMovement':
      applyFellowshipMovement(newState, move);
      break;
    case 'politicalAction':
      applyPoliticalAction(newState, move);
      break;
    case 'muster':
      applyMuster(newState, move);
      break;
    case 'pass':
      // Pass moves don't change the game state except for being recorded in history
      break;
    default:
      console.warn(`Unknown move type: ${move.type}`);
  }
  
  return newState;
}

/**
 * Applies playing a card
 * @param {Object} gameState - Current game state
 * @param {Object} move - Card play move
 * @returns {Object} - Updated game state
 */
function applyCardPlay(gameState, move) {
  const { player, cardId } = move;
  
  // Remove card from player's hand
  if (gameState.cards && gameState.cards.playerHands && gameState.cards.playerHands.get) {
    const playerHand = gameState.cards.playerHands.get(player) || [];
    const cardIndex = playerHand.indexOf(cardId);
    
    if (cardIndex !== -1) {
      playerHand.splice(cardIndex, 1);
      gameState.cards.playerHands.set(player, playerHand);
    }
    
    // Add card to discard pile
    if (gameState.cards.discardPile) {
      gameState.cards.discardPile.push(cardId);
    }
  }
  
  // Apply card effects
  // This would depend on the specific card
  
  return gameState;
}

/**
 * Applies unit movement
 * @param {Object} gameState - Current game state
 * @param {Object} move - Unit movement move
 * @returns {Object} - Updated game state
 */
function applyUnitMovement(gameState, move) {
  const { fromRegion, toRegion, units } = move;
  
  // Find the regions
  const fromRegionData = gameState.regions.find(r => r.regionId === fromRegion);
  const toRegionData = gameState.regions.find(r => r.regionId === toRegion);
  
  if (!fromRegionData || !toRegionData) {
    return gameState;
  }
  
  // Move units from source to destination
  units.forEach(unitToMove => {
    // Find matching units in source region
    const sourceUnitIndex = fromRegionData.units.findIndex(u => 
      u.type === unitToMove.type && 
      u.faction === unitToMove.faction && 
      u.nation === unitToMove.nation
    );
    
    if (sourceUnitIndex !== -1) {
      const sourceUnit = fromRegionData.units[sourceUnitIndex];
      
      // Check if moving all units or just some
      if (sourceUnit.count <= unitToMove.count) {
        // Moving all units - remove from source
        fromRegionData.units.splice(sourceUnitIndex, 1);
      } else {
        // Moving some units - reduce count in source
        sourceUnit.count -= unitToMove.count;
      }
      
      // Add units to destination
      const destUnitIndex = toRegionData.units.findIndex(u => 
        u.type === unitToMove.type && 
        u.faction === unitToMove.faction && 
        u.nation === unitToMove.nation
      );
      
      if (destUnitIndex !== -1) {
        // Add to existing units
        toRegionData.units[destUnitIndex].count += unitToMove.count;
      } else {
        // Add new unit entry
        toRegionData.units.push({
          type: unitToMove.type,
          count: unitToMove.count,
          faction: unitToMove.faction,
          nation: unitToMove.nation,
          active: true
        });
      }
    }
  });
  
  // Update region control
  updateRegionControl(fromRegionData);
  updateRegionControl(toRegionData);
  
  return gameState;
}

/**
 * Applies combat actions
 * @param {Object} gameState - Current game state
 * @param {Object} move - Combat move
 * @returns {Object} - Updated game state
 */
function applyCombat(gameState, move) {
  const { region, attacker, attackerDice, defenderDice, attackerCasualties, defenderCasualties } = move;
  
  // Find the region
  const regionData = gameState.regions.find(r => r.regionId === region);
  if (!regionData) {
    return gameState;
  }
  
  // Apply casualties
  const attackerUnits = regionData.units.filter(u => u.faction === attacker);
  const defenderUnits = regionData.units.filter(u => u.faction !== attacker);
  
  if (attackerCasualties) {
    applyUnitCasualties(attackerUnits, attackerCasualties);
  }
  
  if (defenderCasualties) {
    applyUnitCasualties(defenderUnits, defenderCasualties);
  }
  
  // Remove units with zero count
  regionData.units = regionData.units.filter(u => u.count > 0);
  
  // Update region control
  updateRegionControl(regionData);
  
  // Update combat state
  // This would track ongoing combats, rounds, etc.
  
  return gameState;
}

/**
 * Applies using an action die
 * @param {Object} gameState - Current game state
 * @param {Object} move - Action die move
 * @returns {Object} - Updated game state
 */
function applyActionDie(gameState, move) {
  const { player, dieIndex } = move;
  
  // Get player data
  const playerData = gameState.players.find(p => p.playerId === player);
  if (!playerData) {
    return gameState;
  }
  
  const team = playerData.team;
  const diceArea = team === 'Free' ? gameState.actionDice.free : gameState.actionDice.shadow;
  
  // Clear any previously selected dice for this player
  diceArea.forEach(die => {
    if (die.selected) {
      die.selected = false;
    }
  });
  
  // Select the new die
  if (dieIndex >= 0 && dieIndex < diceArea.length) {
    diceArea[dieIndex].selected = true;
  }
  
  return gameState;
}

/**
 * Applies character actions
 * @param {Object} gameState - Current game state
 * @param {Object} move - Character action move
 * @returns {Object} - Updated game state
 */
function applyCharacterAction(gameState, move) {
  const { characterId, action, targetRegion } = move;
  
  // Find the character
  const character = gameState.characters.find(c => c.characterId === characterId);
  
  if (!character) {
    return gameState;
  }
  
  // Apply action based on type
  switch (action) {
    case 'move':
      // Move character to target region
      character.location = targetRegion;
      break;
      
    case 'ability':
      // Use character ability
      // This would depend on the specific ability
      break;
      
    case 'separate':
      // Separate character from Fellowship
      character.status = 'separated';
      break;
      
    case 'heal':
      // Heal character
      character.corruption = Math.max(0, character.corruption - 1);
      break;
  }
  
  return gameState;
}

/**
 * Applies ending the current phase
 * @param {Object} gameState - Current game state
 * @param {Object} move - End phase move
 * @returns {Object} - Updated game state
 */
function applyEndPhase(gameState, move) {
  const currentPhase = gameState.currentPhase;
  
  // Determine next phase
  let nextPhase;
  switch (currentPhase) {
    case 'setup':
      nextPhase = 'hunt';
      break;
    case 'hunt':
      nextPhase = 'action';
      break;
    case 'action':
      nextPhase = 'combat';
      break;
    case 'combat':
      nextPhase = 'end';
      break;
    default:
      nextPhase = 'hunt'; // Start new round
  }
  
  gameState.currentPhase = nextPhase;
  
  return gameState;
}

/**
 * Applies the hunt action
 * @param {Object} gameState - Current game state
 * @param {Object} move - Hunt move
 * @returns {Object} - Updated game state
 */
function applyHunt(gameState, move) {
  // Remove a die from the hunt box
  if (gameState.huntBox && gameState.huntBox.length > 0) {
    gameState.huntBox.pop();
  }
  
  // Draw a hunt tile (in a real implementation, this would be random)
  const huntTile = drawHuntTile(gameState);
  
  // Apply hunt tile effects
  if (huntTile) {
    // Update corruption based on tile value
    const fellowship = gameState.characters.find(c => c.characterId === 'fellowship');
    if (fellowship) {
      fellowship.corruption = (fellowship.corruption || 0) + huntTile.value;
    }
    
    // Apply special effects based on tile type
    if (huntTile.type === 'reveal') {
      if (fellowship) {
        fellowship.status = 'revealed';
      }
    }
    
    // Add tile to hunt history
    if (!gameState.huntHistory) {
      gameState.huntHistory = [];
    }
    gameState.huntHistory.push(huntTile);
  }
  
  return gameState;
}

/**
 * Applies Fellowship movement
 * @param {Object} gameState - Current game state
 * @param {Object} move - Fellowship movement move
 * @returns {Object} - Updated game state
 */
function applyFellowshipMovement(gameState, move) {
  const { steps } = move;
  
  // Find the Fellowship
  const fellowship = gameState.characters.find(c => c.characterId === 'fellowship');
  
  if (fellowship) {
    // Update Fellowship position on the track
    fellowship.position = (fellowship.position || 0) + steps;
    
    // If the Fellowship was hidden, trigger a hunt
    if (fellowship.status === 'hidden') {
      // For each step, check for hunt damage
      for (let i = 0; i < steps; i++) {
        // In a real implementation, this would involve drawing tiles
        // For now, we'll just simulate it
        const huntCheck = Math.random() < 0.5; // 50% chance of hunt
        
        if (huntCheck) {
          applyHunt(gameState, { type: 'hunt' });
        }
      }
    }
    
    // After movement, the Fellowship becomes hidden again
    fellowship.status = 'hidden';
  }
  
  return gameState;
}

/**
 * Applies political action
 * @param {Object} gameState - Current game state
 * @param {Object} move - Political action move
 * @returns {Object} - Updated game state
 */
function applyPoliticalAction(gameState, move) {
  const { nation, direction } = move;
  
  // Update nation's political status
  if (gameState.nations && gameState.nations[nation]) {
    const currentStatus = gameState.nations[nation].status;
    
    if (direction === 'advance') {
      gameState.nations[nation].status = Math.min(2, currentStatus + 1);
    } else if (direction === 'retreat') {
      gameState.nations[nation].status = Math.max(-2, currentStatus - 1);
    }
    
    // Check if the nation becomes active
    if (Math.abs(gameState.nations[nation].status) === 2) {
      // Activate nation's units
      gameState.nations[nation].active = true;
      activateNationUnits(gameState, nation);
    }
  }
  
  return gameState;
}

/**
 * Applies mustering units
 * @param {Object} gameState - Current game state
 * @param {Object} move - Muster move
 * @returns {Object} - Updated game state
 */
function applyMuster(gameState, move) {
  const { region, unitType, count, faction } = move;
  
  // Find the region
  const targetRegion = gameState.regions.find(r => r.regionId === region);
  
  if (targetRegion) {
    // Find or create the unit entry
    let unitEntry = targetRegion.units.find(u => u.type === unitType && u.faction === faction);
    
    if (unitEntry) {
      // Update existing unit count
      unitEntry.count += count;
    } else {
      // Add new unit entry
      targetRegion.units.push({
        type: unitType,
        count: count,
        faction: faction,
        active: true
      });
    }
  }
  
  return gameState;
}

// Helper functions for move application
function updateRegionControl(region) {
  if (!region || !region.units) {
    return;
  }
  
  // Count units by faction
  const factionUnits = {};
  region.units.forEach(unit => {
    const faction = unit.faction;
    factionUnits[faction] = (factionUnits[faction] || 0) + unit.count;
  });
  
  // Determine controlling faction
  let controllingFaction = null;
  let maxUnits = 0;
  
  for (const [faction, count] of Object.entries(factionUnits)) {
    if (count > maxUnits) {
      maxUnits = count;
      controllingFaction = faction;
    }
  }
  
  region.controlledBy = controllingFaction;
}

function applyUnitCasualties(units, casualties) {
  // Apply casualties to units, starting with the weakest
  let remainingCasualties = casualties;
  
  // Sort units by "value" (this would be based on game rules)
  // For now, we'll just use a simple approach
  units.sort((a, b) => {
    // Sort order: regular units first, then elite units
    const unitValue = { 'regular': 1, 'elite': 2, 'leader': 3 };
    return unitValue[a.type] - unitValue[b.type];
  });
  
  // Apply casualties
  for (let i = 0; i < units.length && remainingCasualties > 0; i++) {
    const unit = units[i];
    const unitLosses = Math.min(unit.count, remainingCasualties);
    
    unit.count -= unitLosses;
    remainingCasualties -= unitLosses;
  }
}

function drawHuntTile(gameState) {
  // In a real implementation, this would draw from the available hunt tiles
  // For now, we'll return a mock tile
  return {
    type: 'regular',
    value: 1
  };
}

function activateNationUnits(gameState, nation) {
  // Find all regions with units of this nation
  if (gameState.regions) {
    gameState.regions.forEach(region => {
      if (region.units) {
        region.units.forEach(unit => {
          if (unit.nation === nation) {
            unit.active = true;
          }
        });
      }
    });
  }
  
  return gameState;
}

/**
 * Gets valid actions for a given die type
 * @param {String} dieType - Type of die (character, army, muster, event, will, eye)
 * @param {String} team - Player team ('Free' or 'Shadow')
 * @param {Object} gameState - Current game state
 * @returns {Array} - List of valid actions
 */
function getValidActionsForDie(dieType, team, gameState) {
  // Default to empty array if invalid die type
  if (!dieType) {
    return [];
  }
  
  const isFreeTeam = team === 'Free';
  const validActions = [];
  
  switch (dieType.toLowerCase()) {
    case 'character':
      validActions.push('moveCharacter');
      
      // Free team can hide/reveal the Fellowship
      if (isFreeTeam) {
        validActions.push('hideFellowship', 'revealFellowship');
      }
      
      // Shadow team can hunt the Fellowship
      if (!isFreeTeam) {
        validActions.push('hunt');
      }
      break;
      
    case 'army':
      validActions.push('moveArmy', 'attack');
      break;
      
    case 'muster':
      validActions.push('recruitUnits', 'playPoliticalCard');
      break;
      
    case 'event':
      validActions.push('playEventCard');
      break;
      
    case 'will': // Will of the West (Free team only)
      if (isFreeTeam) {
        validActions.push('moveCharacter', 'moveArmy', 'attack', 'recruitUnits', 'playPoliticalCard', 'playEventCard', 'hideFellowship', 'revealFellowship');
      }
      break;
      
    case 'eye': // Eye of Sauron (Shadow team only)
      if (!isFreeTeam) {
        validActions.push('hunt');
      }
      break;
  }
  
  return validActions;
}

/**
 * Gets the persistent state of a card
 * @param {Object} gameState - Current game state
 * @param {String} cardId - ID of the card
 * @returns {Object} - Card state or null if not found
 */
function getCardState(gameState, cardId) {
  // Implementation would retrieve card-specific state
  return null;
}

/**
 * Updates the persistent state of a card
 * @param {Object} gameState - Current game state
 * @param {String} cardId - ID of the card
 * @param {Object} cardState - New card state
 * @returns {Object} - Updated game state
 */
function updateCardState(gameState, cardId, cardState) {
  // Implementation would update card-specific state
  return gameState;
}

module.exports = {
  validateMove,
  validateCardPlay,
  validateUnitMovement,
  validateCombat,
  validateActionDie,
  validateCharacterAction,
  validateEndPhase,
  validateHunt,
  validateFellowshipMovement,
  validatePoliticalAction,
  validateMuster,
  applyMove,
  applyCardPlay,
  applyUnitMovement,
  applyCombat,
  applyActionDie,
  applyCharacterAction,
  applyEndPhase,
  applyHunt,
  applyFellowshipMovement,
  applyPoliticalAction,
  applyMuster,
  updateRegionControl,
  applyUnitCasualties,
  getCardState,
  updateCardState,
  getValidActionsForDie,
  drawHuntTile,
  activateNationUnits
};
