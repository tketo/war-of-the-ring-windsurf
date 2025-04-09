const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const Game = require('../../../models/game');
const EventCard = require('../../../models/eventCard');
const CombatCard = require('../../../models/combatCard');

// Mock the authentication middleware
jest.mock('../../../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  }
}));

describe('Card Routes', () => {
  let gameId, freePeoplesCardId, shadowCardId, combatCardId;

  beforeEach(async () => {
    // Clear the games and cards collections before each test
    await Game.deleteMany({});
    await EventCard.deleteMany({});
    await CombatCard.deleteMany({});
    
    // Create test event cards
    const freePeoplesCard = await EventCard.create({
      name: 'Free Peoples Test Card',
      faction: 'free-peoples',
      type: 'character',
      effect: 'Test effect for free peoples',
      requirements: {
        characters: ['gandalf']
      }
    });
    freePeoplesCardId = freePeoplesCard._id.toString();
    
    const shadowCard = await EventCard.create({
      name: 'Shadow Test Card',
      faction: 'shadow',
      type: 'army',
      effect: 'Test effect for shadow',
      requirements: {
        regions: ['mordor']
      }
    });
    shadowCardId = shadowCard._id.toString();
    
    // Create test combat card
    const combatCard = await CombatCard.create({
      name: 'Test Combat Card',
      faction: 'free-peoples',
      strength: 3,
      effect: 'Add +2 to combat roll',
      requirements: {
        characters: ['aragorn']
      }
    });
    combatCardId = combatCard._id.toString();
    
    // Create a test game
    const game = await Game.create({
      mode: 'standard',
      players: [
        { id: 'test-user-id', faction: 'free-peoples' },
        { id: 'opponent-id', faction: 'shadow' }
      ],
      state: {
        turn: 1,
        phase: 'action',
        activePlayer: 'test-user-id',
        regions: [
          { id: 'gondor', controlledBy: 'free-peoples', units: [] },
          { id: 'mordor', controlledBy: 'shadow', units: [] }
        ],
        characters: [
          { id: 'gandalf', location: 'gondor', faction: 'free-peoples' },
          { id: 'witch-king', location: 'mordor', faction: 'shadow' }
        ],
        playerHands: {
          'test-user-id': {
            eventCards: [freePeoplesCardId],
            combatCards: [combatCardId]
          },
          'opponent-id': {
            eventCards: [shadowCardId],
            combatCards: []
          }
        }
      }
    });
    gameId = game._id.toString();
  });

  describe('POST /card/play', () => {
    it('should play an event card successfully', async () => {
      const response = await request(app)
        .post('/card/play')
        .send({
          gameId,
          cardId: freePeoplesCardId,
          cardType: 'event',
          target: {
            character: 'gandalf'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('state');
      
      // Verify the card was removed from the player's hand
      const game = await Game.findById(gameId);
      expect(game.state.playerHands['test-user-id'].eventCards).not.toContain(freePeoplesCardId);
      
      // Verify the card effect was applied (this would depend on the game logic implementation)
      expect(game.state.cardEffects).toBeDefined();
      expect(game.state.cardEffects).toHaveLength(1);
      expect(game.state.cardEffects[0].cardId).toBe(freePeoplesCardId);
    });

    it('should return 400 when trying to play a card not in hand', async () => {
      const nonExistentCardId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/card/play')
        .send({
          gameId,
          cardId: nonExistentCardId,
          cardType: 'event',
          target: {
            character: 'gandalf'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Card not in hand');
    });

    it('should return 403 when trying to play a card from another faction', async () => {
      const response = await request(app)
        .post('/card/play')
        .send({
          gameId,
          cardId: shadowCardId,
          cardType: 'event',
          target: {
            region: 'mordor'
          }
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Cannot play card from another faction');
    });

    it('should return 400 when requirements are not met', async () => {
      // Update the game state to remove Gandalf
      await Game.findByIdAndUpdate(gameId, {
        'state.characters': [
          { id: 'witch-king', location: 'mordor', faction: 'shadow' }
        ]
      });
      
      const response = await request(app)
        .post('/card/play')
        .send({
          gameId,
          cardId: freePeoplesCardId,
          cardType: 'event',
          target: {
            character: 'gandalf'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Card requirements not met');
    });
  });

  describe('POST /card/combat', () => {
    it('should play a combat card successfully', async () => {
      // Set up a combat scenario
      await Game.findByIdAndUpdate(gameId, {
        'state.activeCombat': {
          region: 'gondor',
          attackers: ['witch-king'],
          defenders: ['gandalf'],
          attackerFaction: 'shadow',
          defenderFaction: 'free-peoples',
          stage: 'card-selection'
        }
      });
      
      const response = await request(app)
        .post('/card/combat')
        .send({
          gameId,
          cardId: combatCardId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('combat');
      
      // Verify the card was played in combat
      const game = await Game.findById(gameId);
      expect(game.state.activeCombat.cards).toBeDefined();
      expect(game.state.activeCombat.cards['test-user-id']).toBe(combatCardId);
      
      // Verify the card was removed from the player's hand
      expect(game.state.playerHands['test-user-id'].combatCards).not.toContain(combatCardId);
    });

    it('should return 400 when no active combat is happening', async () => {
      const response = await request(app)
        .post('/card/combat')
        .send({
          gameId,
          cardId: combatCardId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No active combat');
    });

    it('should return 400 when combat is not in card selection stage', async () => {
      // Set up a combat scenario in a different stage
      await Game.findByIdAndUpdate(gameId, {
        'state.activeCombat': {
          region: 'gondor',
          attackers: ['witch-king'],
          defenders: ['gandalf'],
          attackerFaction: 'shadow',
          defenderFaction: 'free-peoples',
          stage: 'dice-rolling'
        }
      });
      
      const response = await request(app)
        .post('/card/combat')
        .send({
          gameId,
          cardId: combatCardId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Not in card selection stage');
    });

    it('should return 400 when player is not involved in combat', async () => {
      // Set up a combat scenario with different players
      await Game.findByIdAndUpdate(gameId, {
        'state.activeCombat': {
          region: 'mordor',
          attackers: [],
          defenders: [],
          attackerFaction: 'free-peoples',
          defenderFaction: 'shadow',
          stage: 'card-selection',
          participants: ['other-player-id', 'opponent-id']
        }
      });
      
      const response = await request(app)
        .post('/card/combat')
        .send({
          gameId,
          cardId: combatCardId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Not involved in this combat');
    });
  });

  describe('GET /card/list', () => {
    it('should list all event cards', async () => {
      const response = await request(app)
        .get('/card/list?type=event');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cards');
      expect(response.body.data.cards).toHaveLength(2);
      
      // Verify card details
      const cardNames = response.body.data.cards.map(card => card.name);
      expect(cardNames).toContain('Free Peoples Test Card');
      expect(cardNames).toContain('Shadow Test Card');
    });

    it('should list all combat cards', async () => {
      const response = await request(app)
        .get('/card/list?type=combat');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cards');
      expect(response.body.data.cards).toHaveLength(1);
      expect(response.body.data.cards[0].name).toBe('Test Combat Card');
    });

    it('should filter cards by faction', async () => {
      const response = await request(app)
        .get('/card/list?type=event&faction=shadow');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cards).toHaveLength(1);
      expect(response.body.data.cards[0].name).toBe('Shadow Test Card');
    });

    it('should return 400 for invalid card type', async () => {
      const response = await request(app)
        .get('/card/list?type=invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid card type');
    });
  });

  describe('GET /card/:id', () => {
    it('should get details of an event card', async () => {
      const response = await request(app)
        .get(`/card/${freePeoplesCardId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('card');
      expect(response.body.data.card.name).toBe('Free Peoples Test Card');
      expect(response.body.data.card.faction).toBe('free-peoples');
      expect(response.body.data.card.type).toBe('character');
    });

    it('should get details of a combat card', async () => {
      const response = await request(app)
        .get(`/card/${combatCardId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('card');
      expect(response.body.data.card.name).toBe('Test Combat Card');
      expect(response.body.data.card.strength).toBe(3);
    });

    it('should return 404 for non-existent card', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/card/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Card not found');
    });
  });
});
