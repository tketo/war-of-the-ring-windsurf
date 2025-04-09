/**
 * Validation schemas for card-related API endpoints
 */

// Card details validation schema
const cardDetailsSchema = {
  required: ['id'],
  types: {
    id: 'string'
  },
  custom: {
    id: (value) => {
      if (!value || value.length < 1) {
        return 'Invalid card ID';
      }
      return true;
    }
  }
};

// Card play validation schema
const cardPlaySchema = {
  required: ['gameId', 'cardId'],
  types: {
    gameId: 'string',
    cardId: 'string',
    target: 'string',
    options: 'object'
  },
  custom: {
    gameId: (value) => {
      if (!/^[a-f0-9]{24,}$/i.test(value)) {
        return 'Invalid game ID format';
      }
      return true;
    },
    cardId: (value) => {
      if (!value || value.length < 1) {
        return 'Invalid card ID';
      }
      return true;
    }
  }
};

// Card state validation schema
const cardStateSchema = {
  required: ['gameId', 'cardId'],
  types: {
    gameId: 'string',
    cardId: 'string'
  },
  custom: {
    gameId: (value) => {
      if (!/^[a-f0-9]{24,}$/i.test(value)) {
        return 'Invalid game ID format';
      }
      return true;
    },
    cardId: (value) => {
      if (!value || value.length < 1) {
        return 'Invalid card ID';
      }
      return true;
    }
  }
};

// Card draw validation schema
const cardDrawSchema = {
  required: ['gameId', 'deckType'],
  types: {
    gameId: 'string',
    deckType: 'string'
  },
  enums: {
    deckType: ['event', 'combat']
  },
  custom: {
    gameId: (value) => {
      if (!/^[a-f0-9]{24,}$/i.test(value)) {
        return 'Invalid game ID format';
      }
      return true;
    }
  }
};

module.exports = {
  cardDetailsSchema,
  cardPlaySchema,
  cardStateSchema,
  cardDrawSchema
};
