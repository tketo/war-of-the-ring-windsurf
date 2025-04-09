/**
 * Unit tests for AI strategies
 */
const aiManager = require('../../../ai/aiManager');
const RandomStrategy = require('../../../ai/randomStrategy');
const QuellerStrategy = require('../../../ai/quellerStrategy');
const FellowshipStrategy = require('../../../ai/fellowshipStrategy');

// Mock validateMove function to always return valid
jest.mock('../../../utils/rulesEngine', () => ({
  validateMove: jest.fn().mockReturnValue({ isValid: true })
}));

// Mock game state for testing
const createMockGameState = () => ({
  gameId: 'test-game-123',
  currentPhase: 'action',
  currentPlayer: 'player1',
  players: [
    { playerId: 'player1', faction: 'freePeoples', role: 'player', isActive: true },
    { playerId: 'player2', faction: 'shadow', role: 'player', isActive: true }
  ],
  actionDice: {
    freePeoples: ['character', 'army', 'muster', 'event', 'will'],
    shadow: ['character', 'army', 'muster', 'event', 'eye']
  },
  characters: [
    { 
      characterId: 'fellowship', 
      location: 'rivendell', 
      status: 'hidden',
      corruption: 0,
      progress: 0
    },
    {
      characterId: 'gandalf',
      location: 'rivendell',
      status: 'active',
      canBearRing: true
    }
  ],
  units: [
    { type: 'regular', count: 2, faction: 'freePeoples', nation: 'gondor', active: true },
    { type: 'elite', count: 1, faction: 'freePeoples', nation: 'gondor', active: true },
    { type: 'regular', count: 3, faction: 'shadow', nation: 'mordor', active: true },
    { type: 'elite', count: 2, faction: 'shadow', nation: 'southEast', active: true }
  ],
  regions: [
    { regionId: 'region1', controlledBy: 'freePeoples', combat: false },
    { regionId: 'region2', controlledBy: null, combat: false },
    { regionId: 'region3', controlledBy: 'shadow', combat: false }
  ],
  nations: {
    north: { status: 0, active: false },
    rohan: { status: 0, active: false },
    gondor: { status: 0, active: false },
    elves: { status: 2, active: true },
    dwarves: { status: 0, active: false },
    southEast: { status: -2, active: true }
  },
  huntBox: ['eye', 'eye'],
  huntPool: {
    regular: 12,
    eye: 0
  },
  cards: {
    playerHands: new Map([
      ['ai_freePeoples', [{ id: 'card1', type: 'event' }, { id: 'card2', type: 'combat' }]],
      ['ai_shadow', [{ id: 'card3', type: 'event' }, { id: 'card4', type: 'combat' }]]
    ])
  }
});

describe('AI Manager', () => {
  test('should provide list of available strategies', () => {
    const strategies = aiManager.getAvailableStrategies();
    expect(strategies.length).toBe(3);
    expect(strategies.map(s => s.id)).toContain('random');
    expect(strategies.map(s => s.id)).toContain('queller');
    expect(strategies.map(s => s.id)).toContain('fellowship');
  });

  test('should create and retrieve AI instances', () => {
    const ai = aiManager.createAI('test-game', 'freePeoples', 'random');
    expect(ai).toBeInstanceOf(RandomStrategy);
    
    const retrievedAI = aiManager.getAI('test-game', 'freePeoples');
    expect(retrievedAI).toBe(ai);
    
    aiManager.removeAI('test-game', 'freePeoples');
    expect(aiManager.getAI('test-game', 'freePeoples')).toBeNull();
  });
});

describe('AI Strategies - Basic Functionality', () => {
  let mockGameState;
  
  beforeEach(() => {
    mockGameState = createMockGameState();
  });
  
  test('each strategy should return info', () => {
    // Test Random Strategy
    const randomAI = new RandomStrategy();
    const randomInfo = randomAI.getInfo();
    expect(randomInfo).toHaveProperty('name');
    expect(randomInfo).toHaveProperty('difficulty');
    
    // Test Queller Strategy
    const quellerAI = new QuellerStrategy();
    const quellerInfo = quellerAI.getInfo();
    expect(quellerInfo).toHaveProperty('name');
    expect(quellerInfo).toHaveProperty('difficulty');
    
    // Test Fellowship Strategy
    const fellowshipAI = new FellowshipStrategy();
    const fellowshipInfo = fellowshipAI.getInfo();
    expect(fellowshipInfo).toHaveProperty('name');
    expect(fellowshipInfo).toHaveProperty('difficulty');
  });
  
  test('each strategy should evaluate game states', () => {
    // Test Random Strategy
    const randomAI = new RandomStrategy();
    const randomScore = randomAI.evaluateState(mockGameState, 'freePeoples');
    expect(typeof randomScore).toBe('number');
    
    // Test Queller Strategy
    const quellerAI = new QuellerStrategy();
    const quellerScore = quellerAI.evaluateState(mockGameState, 'freePeoples');
    expect(typeof quellerScore).toBe('number');
    
    // Test Fellowship Strategy
    const fellowshipAI = new FellowshipStrategy();
    const fellowshipScore = fellowshipAI.evaluateState(mockGameState, 'freePeoples');
    expect(typeof fellowshipScore).toBe('number');
  });
});

describe('Fellowship Strategy - Specific Tests', () => {
  let mockGameState;
  let fellowshipAI;
  
  beforeEach(() => {
    mockGameState = createMockGameState();
    fellowshipAI = new FellowshipStrategy();
  });
  
  test('should react to opponent moves', () => {
    // Initial weights
    const initialWeights = { ...fellowshipAI.weights };
    
    // React to a hunt move as Free Peoples
    fellowshipAI.reactToOpponentMove(mockGameState, { type: 'hunt' }, 'freePeoples');
    
    // Weights should be adjusted but still sum to approximately 1
    const weightSum = Object.values(fellowshipAI.weights).reduce((sum, w) => sum + w, 0);
    expect(weightSum).toBeCloseTo(1, 1);
    
    // React to a fellowship movement as Shadow
    fellowshipAI.weights = { ...initialWeights }; // Reset weights
    fellowshipAI.reactToOpponentMove(mockGameState, { type: 'fellowshipMovement' }, 'shadow');
    
    // Weights should be adjusted but still sum to approximately 1
    const weightSum2 = Object.values(fellowshipAI.weights).reduce((sum, w) => sum + w, 0);
    expect(weightSum2).toBeCloseTo(1, 1);
  });
  
  test('should generate moves based on game phase', () => {
    // Setup phase
    mockGameState.currentPhase = 'setup';
    let moves = fellowshipAI.generatePossibleMoves(mockGameState, 'freePeoples');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0].type).toBe('setup');
    
    // Hunt phase
    mockGameState.currentPhase = 'hunt';
    moves = fellowshipAI.generatePossibleMoves(mockGameState, 'shadow');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.some(m => m.type === 'allocateHuntDice')).toBe(true);
    
    // Action phase
    mockGameState.currentPhase = 'action';
    moves = fellowshipAI.generatePossibleMoves(mockGameState, 'freePeoples');
    expect(moves.length).toBeGreaterThan(0);
    
    // End phase
    mockGameState.currentPhase = 'end';
    moves = fellowshipAI.generatePossibleMoves(mockGameState, 'freePeoples');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0].type).toBe('endTurn');
  });
});
