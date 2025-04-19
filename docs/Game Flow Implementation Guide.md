# War of the Ring - Game Flow Implementation Guide

This document outlines the implementation approach for the War of the Ring game flow, focusing on simplicity and accuracy to the rules.

## Game Turn Structure

### 1. Recover Action Dice and Draw Event Cards

**Implementation Approach:**
- Store the base number of action dice for each team in the game configuration
- Track any modifiers to dice count from cards or special abilities
- At the start of each turn:
  ```javascript
  function startNewTurn(gameState) {
    // Reset action dice
    gameState.turnState.actionDice = {
      Free: generateActionDice('Free', gameState.diceModifiers.Free),
      Shadow: generateActionDice('Shadow', gameState.diceModifiers.Shadow)
    };
    
    // Draw event cards
    for (const player of gameState.players) {
      drawEventCard(gameState, player.id, 'character');
      drawEventCard(gameState, player.id, 'strategy');
    }
    
    // Set turn phase
    gameState.turnState.phase = 'Fellowship';
    gameState.turnState.activeTeam = 'Free';
    gameState.turnState.selectedDie = null;
  }
  ```

### 2. Fellowship Phase

**Implementation Approach:**
- Provide UI options only for valid actions based on the Fellowship's position
- Track whether each action has been taken this turn
  ```javascript
  function processFellowshipPhaseAction(gameState, action, params) {
    switch (action) {
      case 'declareFellowship':
        // Can only be done if fellowship is hidden
        if (gameState.fellowship.revealed) {
          return false;
        }
        
        // Validate the target region based on progress counter
        const currentPosition = getFellowshipPosition(gameState);
        const targetRegion = params.regionId;
        
        // Ensure the target region is within reach based on progress counter
        if (!isValidFellowshipMove(gameState, currentPosition, targetRegion, gameState.fellowship.progress)) {
          return false;
        }
        
        // Move ring-bearers to the declared position
        moveRingBearers(gameState, targetRegion);
        
        // Reset progress counter but keep fellowship hidden
        // "The Fellowship Progress counter remains Hidden side up."
        gameState.fellowship.progress = 0;
        gameState.fellowship.revealed = false;
        
        return true;
        
      case 'healRingbearers':
        // Can only be done in Free Peoples city/stronghold not under enemy control
        const fellowshipRegion = getFellowshipPosition(gameState);
        const region = gameState.regions[fellowshipRegion];
        if (region && 
            ['city', 'stronghold'].includes(region.settlement) && 
            region.control === 'Free') {
          gameState.fellowship.corruption = Math.max(0, gameState.fellowship.corruption - 1);
          return true;
        }
        return false;
        
      case 'activateNation':
        // Can only activate a nation if in its city/stronghold
        const nationRegion = gameState.regions[params.regionId];
        if (nationRegion && 
            ['city', 'stronghold'].includes(nationRegion.settlement) &&
            nationRegion.nation === params.nationId &&
            !gameState.nations[params.nationId].active) {
          gameState.nations[params.nationId].active = true;
          return true;
        }
        return false;
        
      case 'changeGuide':
        // Can only change to highest-level companion
        const newGuide = Object.entries(gameState.characters)
          .find(([id, character]) => 
            id === params.companionId && 
            character.type === 'companion' && 
            character.inFellowship
          );
          
        if (newGuide && isHighestLevelCompanion(gameState, newGuide[0])) {
          gameState.fellowship.guide = newGuide[0];
          return true;
        }
        return false;
    }
  }
  
  // Helper function to check if a fellowship move is valid
  function isValidFellowshipMove(gameState, fromRegion, toRegion, maxSteps) {
    // If staying in the same region, always valid
    if (fromRegion === toRegion) {
      return true;
    }
    
    // Check if the move is within the allowed number of steps
    // and doesn't cross impassable terrain
    // This would use a pathfinding algorithm to find the shortest valid path
    const path = findShortestPath(gameState, fromRegion, toRegion);
    
    // No valid path exists
    if (!path) {
      return false;
    }
    
    // Path is longer than allowed steps
    if (path.length - 1 > maxSteps) {
      return false;
    }
    
    return true;
  }
  
  // Move the ring-bearers (and companions in fellowship) to a new region
  function moveRingBearers(gameState, targetRegion) {
    // Update all ring-bearers and companions in fellowship
    Object.entries(gameState.characters).forEach(([id, character]) => {
      if (character.inFellowship) {
        gameState.characters[id].regionId = targetRegion;
      }
    });
  }
  
  function moveFellowship(gameState, steps) {
    // Increment progress counter
    gameState.fellowship.progress += steps;
    
    // If the fellowship was revealed, hide it after movement
    if (gameState.fellowship.revealed) {
      gameState.fellowship.revealed = false;
    }
    
    return true;
  }
  
  function revealFellowship(gameState, huntSuccess = false) {
    // Can only reveal if currently hidden
    if (gameState.fellowship.revealed) {
      return false;
    }
    
    // Get current position and progress
    const currentPosition = getFellowshipPosition(gameState);
    const progress = gameState.fellowship.progress;
    
    // For Shadow-initiated reveals (hunt or event card)
    if (huntSuccess) {
      // Free Peoples player chooses where to place the fellowship
      // This would be handled via UI interaction, but for implementation:
      // 1. Get valid regions within progress steps
      const validRegions = getValidFellowshipRevealRegions(gameState, currentPosition, progress);
      
      // 2. Let Free Peoples player choose a region (simulated here)
      const chosenRegion = validRegions[0]; // In real implementation, this would be a player choice
      
      // 3. Move ring-bearers to the chosen region
      moveRingBearers(gameState, chosenRegion);
      
      // 4. Check for Shadow stronghold effects
      const region = gameState.regions[chosenRegion];
      if (region && region.settlement === 'stronghold' && region.control === 'Shadow') {
        // Draw additional hunt tiles for Shadow stronghold
        // This would trigger additional hunt resolution
        drawAdditionalHuntTiles(gameState, 1);
      }
    }
    
    // Set fellowship to revealed
    gameState.fellowship.revealed = true;
    gameState.fellowship.progress = 0; // Reset progress counter
    
    return true;
  }
  
  // Get valid regions for fellowship reveal based on progress
  function getValidFellowshipRevealRegions(gameState, fromRegion, maxSteps) {
    const validRegions = [];
    
    // For each region in the game
    Object.entries(gameState.regions).forEach(([regionId, region]) => {
      // Skip if it's a Free Peoples City/Stronghold controlled by Free Peoples
      // (for Shadow-initiated reveals)
      if (region.settlement && 
          ['city', 'stronghold'].includes(region.settlement) && 
          region.originalControl === 'Free' && 
          region.control === 'Free') {
        return;
      }
      
      // Check if the region is within reach
      if (isValidFellowshipMove(gameState, fromRegion, regionId, maxSteps)) {
        validRegions.push(regionId);
      }
    });
    
    return validRegions;
  }
  
  function hideFellowship(gameState) {
    // Can only hide if currently revealed
    if (!gameState.fellowship.revealed) {
      return false;
    }
    
    // Set fellowship to hidden
    gameState.fellowship.revealed = false;
    
    return true;
  }
  
  function separateCompanion(gameState, characterId) {
    // Character must exist and be in the fellowship
    const character = gameState.characters[characterId];
    if (!character || !character.inFellowship) {
      return false;
    }
    
    // Cannot separate ring-bearers (Frodo and Sam)
    if (character.type === 'ring-bearer') {
      return false;
    }
    
    // Fellowship must be revealed to separate a companion
    if (!gameState.fellowship.revealed) {
      return false;
    }
    
    // Update companion status
    character.inFellowship = false;
    
    // If the guide is separated, assign a new guide
    if (gameState.fellowship.guide === characterId) {
      const newGuide = findHighestLevelCompanion(gameState);
      if (newGuide) {
        gameState.fellowship.guide = newGuide;
      }
    }
    
    return true;
  }
  
  // Helper function to find the highest level companion in the fellowship
  function findHighestLevelCompanion(gameState) {
    // Get all companions in the fellowship (excluding ring-bearers)
    const companions = Object.entries(gameState.characters)
      .filter(([id, character]) => 
        character.type === 'companion' && 
        character.inFellowship
      );
    
    if (companions.length === 0) {
      // If no companions remain, check if Gollum is available
      const gollum = gameState.characters['gollum'];
      if (gollum && gollum.inFellowship) {
        return 'gollum';
      }
      return null;
    }
    
    // Find the highest level companion
    let highestLevel = 0;
    let highestCompanions = [];
    
    companions.forEach(([id, character]) => {
      if (character.level > highestLevel) {
        highestLevel = character.level;
        highestCompanions = [id];
      } else if (character.level === highestLevel) {
        highestCompanions.push(id);
      }
    });
    
    // If there's a tie, Free Peoples player chooses (default to first one)
    // In real implementation, this would be a player choice
    return highestCompanions[0];
  }
  ```

### 3. Hunt Allocation

**Implementation Approach:**
- Calculate min/max hunt dice based on game state
- Provide UI to allocate dice within these constraints
  ```javascript
  function validateHuntAllocation(gameState, numDice) {
    const minRequired = gameState.huntState.freeRetrievedLastTurn ? 1 : 0;
    
    // Maximum is the number of companions in the fellowship
    // Note: Gollum can only be guide when all other companions have separated,
    // so if he's the guide, the companion count will already be correct (1)
    const maxAllowed = Math.max(1, countCompanionsForHunt(gameState));
    
    return numDice >= minRequired && numDice <= maxAllowed;
  }
  
  function allocateHuntDice(gameState, numDice) {
    if (!validateHuntAllocation(gameState, numDice)) {
      return false;
    }
    
    // Move dice from action pool to hunt box
    const shadowDice = gameState.turnState.actionDice.Shadow;
    for (let i = 0; i < numDice; i++) {
      if (i < shadowDice.length) {
        gameState.huntState.huntBox.push(shadowDice[i]);
      }
    }
    
    // Remove allocated dice from action pool
    gameState.turnState.actionDice.Shadow = shadowDice.slice(numDice);
    
    // Update game phase
    gameState.turnState.phase = 'ActionRoll';
    
    return true;
  }
  ```

### 4. Action Roll

**Implementation Approach:**
- Roll remaining dice not in hunt box
- Automatically move Eye results to hunt box
  ```javascript
  function rollActionDice(gameState) {
    // Roll Free Peoples dice
    gameState.turnState.actionDice.Free = gameState.turnState.actionDice.Free.map(die => ({
      ...die,
      type: rollDie('Free')
    }));
    
    // Roll Shadow dice and handle Eye results
    const shadowDiceAfterRoll = gameState.turnState.actionDice.Shadow.map(die => ({
      ...die,
      type: rollDie('Shadow')
    }));
    
    // Move Eye results to hunt box
    const nonEyeDice = [];
    shadowDiceAfterRoll.forEach(die => {
      if (die.type === 'eye') {
        gameState.huntState.huntBox.push(die);
      } else {
        nonEyeDice.push(die);
      }
    });
    
    gameState.turnState.actionDice.Shadow = nonEyeDice;
    
    // Update game phase
    gameState.turnState.phase = 'Action';
    gameState.turnState.activeTeam = 'Free'; // Free Peoples go first
  }
  ```

### 5. Action Resolution

**Implementation Approach:**
- Track active team and selected die
- Handle passing and discarding dice
- Move fellowship movement dice to hunt box
  ```javascript
  function selectActionDie(gameState, dieIndex, actionType) {
    const activeTeam = gameState.turnState.activeTeam;
    const dice = gameState.turnState.actionDice[activeTeam];
    
    if (dieIndex >= dice.length) {
      return false;
    }
    
    // Select the die
    const selectedDie = dice[dieIndex];
    
    // Handle Will of the West conversion for Free Peoples
    if (activeTeam === 'Free' && selectedDie.type === 'will') {
      // Convert to the desired die type based on action
      // Will of the West can be converted to any result except another Will of the West
      // In real implementation, this would be a player choice
      if (actionType && actionType !== 'will') {
        selectedDie.type = actionType;
      } else {
        // Default to character if no action type specified
        selectedDie.type = 'character';
      }
    }
    
    gameState.turnState.selectedDie = selectedDie;
    
    // Remove from action dice pool
    gameState.turnState.actionDice[activeTeam] = [
      ...dice.slice(0, dieIndex),
      ...dice.slice(dieIndex + 1)
    ];
    
    // If Free Peoples selected a character die for fellowship movement
    if (activeTeam === 'Free' && selectedDie.type === 'character' && 
        actionType === 'moveFellowship') {
      gameState.huntState.huntBox.push(selectedDie);
      gameState.turnState.selectedDie = null; // Die is used immediately
    }
    
    return true;
  }
  
  function completeAction(gameState) {
    // Clear selected die
    gameState.turnState.selectedDie = null;
    
    // Switch active team
    const freeDice = gameState.turnState.actionDice.Free.length;
    const shadowDice = gameState.turnState.actionDice.Shadow.length;
    
    // If both teams have dice, alternate
    if (freeDice > 0 && shadowDice > 0) {
      gameState.turnState.activeTeam = gameState.turnState.activeTeam === 'Free' ? 'Shadow' : 'Free';
    }
    // If only one team has dice, they continue
    else if (freeDice > 0) {
      gameState.turnState.activeTeam = 'Free';
    }
    else if (shadowDice > 0) {
      gameState.turnState.activeTeam = 'Shadow';
    }
    // If no dice remain, move to victory check
    else {
      gameState.turnState.phase = 'VictoryCheck';
    }
  }
  
  function passAction(gameState) {
    // Can only pass if the other team has more dice
    const activeTeam = gameState.turnState.activeTeam;
    const otherTeam = activeTeam === 'Free' ? 'Shadow' : 'Free';
    
    if (gameState.turnState.actionDice[activeTeam].length < 
        gameState.turnState.actionDice[otherTeam].length) {
      // Switch active team
      gameState.turnState.activeTeam = otherTeam;
      return true;
    }
    
    return false;
  }
  
  function discardDie(gameState, dieIndex) {
    const activeTeam = gameState.turnState.activeTeam;
    const dice = gameState.turnState.actionDice[activeTeam];
    
    if (dieIndex >= dice.length) {
      return false;
    }
    
    // Remove die without effect
    gameState.turnState.actionDice[activeTeam] = [
      ...dice.slice(0, dieIndex),
      ...dice.slice(dieIndex + 1)
    ];
    
    // Complete action (switch teams)
    completeAction(gameState);
    
    return true;
  }
  ```

### 6. Victory Check

**Implementation Approach:**
- Check military victory conditions
- If no victory, start new turn
  ```javascript
  function checkVictory(gameState) {
    // Check Shadow military victory (control X Free settlements)
    const shadowControlledFreeSettlements = Object.values(gameState.regions)
      .filter(r => r.settlement && r.originalControl === 'Free' && r.control === 'Shadow')
      .length;
      
    if (shadowControlledFreeSettlements >= gameState.victoryConditions.shadowMilitaryThreshold) {
      return { victor: 'Shadow', type: 'military' };
    }
    
    // Check Free military victory (control X Shadow settlements)
    const freeControlledShadowSettlements = Object.values(gameState.regions)
      .filter(r => r.settlement && r.originalControl === 'Shadow' && r.control === 'Free')
      .length;
      
    if (freeControlledShadowSettlements >= gameState.victoryConditions.freeMilitaryThreshold) {
      return { victor: 'Free', type: 'military' };
    }
    
    // Check Ring victory - Frodo and Sam must be at Mount Doom
    const frodo = gameState.characters['frodo'];
    if (frodo && frodo.regionId === 'mount-doom' && gameState.fellowship.corruption < 12) {
      return { victor: 'Free', type: 'ring' };
    }
    
    // Check corruption victory
    if (gameState.fellowship.corruption >= 12) {
      return { victor: 'Shadow', type: 'corruption' };
    }
    
    // No victory yet, start new turn
    startNewTurn(gameState);
    return null;
  }
  ```

## Key Implementation Principles

1. **State-Driven UI**: Only show valid actions based on current game state
2. **Minimal Validation**: Rely on game state to determine valid actions rather than complex validation rules
3. **Automatic Progression**: Advance game phases automatically when possible
4. **Clear Feedback**: Provide clear feedback on why actions are invalid
5. **Simplified Conditions**: Avoid checking for impossible conditions; focus on what's actually possible given the current state

## Game State Structure

The game state should track:

```javascript
{
  turnState: {
    round: 1,
    phase: 'Fellowship', // Fellowship, HuntAllocation, ActionRoll, Action, VictoryCheck
    activeTeam: 'Free', // Free, Shadow
    selectedDie: null, // Currently selected die for action
    actionDice: {
      Free: [], // Array of dice objects
      Shadow: []
    }
  },
  fellowship: {
    revealed: false, // Whether the fellowship is currently revealed
    progress: 0, // Progress counter (only meaningful when hidden)
    corruption: 0,
    guide: 'gandalf' // ID of the current guide
  },
  characters: {
    // Ring-bearers (always move together, not counted as companions for hunt purposes)
    'frodo': { 
      type: 'ring-bearer', 
      level: 1, 
      regionId: 'rivendell', 
      inFellowship: true, 
      exhausted: false 
    },
    'sam': { 
      type: 'ring-bearer', 
      level: 1, 
      regionId: 'rivendell', 
      inFellowship: true, 
      exhausted: false 
    },
    // Companions (can separate from fellowship, counted for hunt purposes)
    'gandalf': { 
      type: 'companion', 
      level: 3, 
      regionId: 'rivendell', 
      inFellowship: true, 
      exhausted: false 
    },
    'aragorn': { 
      type: 'companion', 
      level: 3, 
      regionId: 'rivendell', 
      inFellowship: true, 
      exhausted: false 
    },
    // Shadow characters (minions) move independently
    'witch-king': { 
      type: 'minion', 
      level: 3, 
      regionId: 'minas-morgul', 
      exhausted: false 
    }
    // Additional characters...
  },
  huntState: {
    huntBox: [], // Dice in hunt box
    freeRetrievedLastTurn: false
  },
  regions: {}, // Map of region objects
  nations: {}, // Map of nation objects
  players: [], // Array of player objects
  diceModifiers: {
    Free: 0,
    Shadow: 0
  },
  victoryConditions: {
    shadowMilitaryThreshold: 10,
    freeMilitaryThreshold: 4
  }
}
```

## Fellowship Position Inference

The fellowship's position is inferred from the board state:

```javascript
// Helper function to get the fellowship's current position
function getFellowshipPosition(gameState) {
  // Find Frodo's position (the Ring-bearer is always in the fellowship)
  const frodo = gameState.characters['frodo'];
  
  if (!frodo || !frodo.inFellowship) {
    throw new Error('Frodo must always be in the fellowship');
  }
  
  return frodo.regionId;
}

// Helper function to get all companions in the fellowship
// Note: This only counts actual companions, not ring-bearers
function getCompanionsInFellowship(gameState) {
  return Object.entries(gameState.characters)
    .filter(([id, character]) => 
      character.type === 'companion' && character.inFellowship)
    .map(([id, character]) => id);
}

// Helper function to count companions for hunt box purposes
function countCompanionsForHunt(gameState) {
  // Only count actual companions, not ring-bearers
  return Object.values(gameState.characters)
    .filter(character => 
      character.type === 'companion' && character.inFellowship)
    .length;
}
```
