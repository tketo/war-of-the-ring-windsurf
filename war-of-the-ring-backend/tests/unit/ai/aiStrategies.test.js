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
    { playerId: 'player1', team: 'Free', role: 'GondorElves', isActive: true },
    { playerId: 'player2', team: 'Shadow', role: 'Sauron', isActive: true }
  ],
  actionDice: {
    free: [
      { type: 'character', selected: false },
      { type: 'army', selected: false },
      { type: 'muster', selected: false },
      { type: 'event', selected: false },
      { type: 'will', selected: false }
    ],
    shadow: [
      { type: 'character', selected: false },
      { type: 'army', selected: false },
      { type: 'muster', selected: false },
      { type: 'event', selected: false },
      { type: 'eye', selected: false }
    ]
  },
  characters: [
    { 
      characterId: 'fellowship', 
      location: 'rivendell', 
      status: 'hidden',
      corruption: 0,
      position: 0
    },
    {
      characterId: 'gandalf',
      type: 'companion',
      location: 'rivendell',
      status: 'active'
    }
  ],
  regions: [
    {
      regionId: 'region1', 
      controlledBy: 'Free', 
      combat: false,
      units: [
        { type: 'regular', count: 2, team: 'Free', nation: 'gondor', active: true },
        { type: 'elite', count: 1, team: 'Free', nation: 'gondor', active: true }
      ]
    },
    {
      regionId: 'region2', 
      controlledBy: 'Shadow', 
      combat: false,
      units: [
        { type: 'regular', count: 3, team: 'Shadow', nation: 'mordor', active: true },
        { type: 'elite', count: 2, team: 'Shadow', nation: 'mordor', active: true }
      ]
    }
  ],
  nations: {
    gondor: { status: 0, active: true },
    rohan: { status: 0, active: false },
    north: { status: 0, active: false },
    elves: { status: 0, active: true },
    dwarves: { status: 0, active: false },
    mordor: { status: -2, active: true },
    isengard: { status: -1, active: true },
    southEast: { status: -1, active: false }
  },
  cards: new Map([
    ['player1', [{ id: 'card1', type: 'event' }, { id: 'card2', type: 'combat' }]],
    ['player2', [{ id: 'card3', type: 'event' }, { id: 'card4', type: 'character' }]]
  ])
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
    const ai = aiManager.createAI('test-game', 'Free', 'random');
    expect(ai).toBeInstanceOf(RandomStrategy);
    
    const retrievedAI = aiManager.getAI('test-game', 'Free');
    expect(retrievedAI).toBe(ai);
    
    aiManager.removeAI('test-game', 'Free');
    expect(aiManager.getAI('test-game', 'Free')).toBeNull();
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
    const randomScore = randomAI.evaluateState(mockGameState, 'Free');
    expect(typeof randomScore).toBe('number');
    
    // Test Queller Strategy
    const quellerAI = new QuellerStrategy();
    const quellerScore = quellerAI.evaluateState(mockGameState, 'Free');
    expect(typeof quellerScore).toBe('number');
    
    // Test Fellowship Strategy
    const fellowshipAI = new FellowshipStrategy();
    const fellowshipScore = fellowshipAI.evaluateState(mockGameState, 'Free');
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
    
    // React to a hunt move as Free
    fellowshipAI.reactToOpponentMove(mockGameState, { type: 'hunt' }, 'Free');
    
    // Weights should be adjusted but still sum to approximately 1
    const weightSum = Object.values(fellowshipAI.weights).reduce((sum, w) => sum + w, 0);
    expect(weightSum).toBeCloseTo(1, 1);
    
    // React to a fellowship movement as Shadow
    fellowshipAI.weights = { ...initialWeights }; // Reset weights
    fellowshipAI.reactToOpponentMove(mockGameState, { type: 'fellowshipMovement' }, 'Shadow');
    
    // Weights should be adjusted but still sum to approximately 1
    const weightSum2 = Object.values(fellowshipAI.weights).reduce((sum, w) => sum + w, 0);
    expect(weightSum2).toBeCloseTo(1, 1);
  });
  
  test('should generate moves based on game phase', () => {
    // Setup phase
    mockGameState.currentPhase = 'setup';
    let moves = fellowshipAI.generatePossibleMoves(mockGameState, 'Free');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0].type).toBe('setup');
    
    // Hunt phase
    mockGameState.currentPhase = 'hunt';
    moves = fellowshipAI.generatePossibleMoves(mockGameState, 'Shadow');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.some(m => m.type === 'allocateHuntDice')).toBe(true);
    
    // Action phase
    mockGameState.currentPhase = 'action';
    moves = fellowshipAI.generatePossibleMoves(mockGameState, 'Free');
    expect(moves.length).toBeGreaterThan(0);
    
    // End phase
    mockGameState.currentPhase = 'end';
    moves = fellowshipAI.generatePossibleMoves(mockGameState, 'Free');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0].type).toBe('endTurn');
  });
});
