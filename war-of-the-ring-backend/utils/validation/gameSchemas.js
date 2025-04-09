/**
 * Validation schemas for game-related API endpoints
 */

// Game start validation schema
const gameStartSchema = {
  required: ['mode'],
  types: {
    mode: 'string',
    expansions: 'array',
    scenario: 'string'
  },
  enums: {
    mode: ['full', 'unrestricted', 'companion']
  },
  custom: {
    expansions: (value) => {
      if (value && !Array.isArray(value)) {
        return 'Expansions must be an array';
      }
      return true;
    }
  }
};

// Game move validation schema
const gameMoveSchema = {
  required: ['gameId', 'move'],
  types: {
    gameId: 'string',
    move: 'object',
    encryptionKey: 'string'
  },
  custom: {
    gameId: (value) => {
      if (!/^[a-f0-9]{24,}$/i.test(value)) {
        return 'Invalid game ID format';
      }
      return true;
    },
    move: (value) => {
      if (!value.type) {
        return 'Move must have a type';
      }
      return true;
    }
  }
};

// Game state validation schema
const gameStateSchema = {
  required: ['gameId'],
  types: {
    gameId: 'string',
    encryptionKey: 'string'
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

// Game save validation schema
const gameSaveSchema = {
  required: ['gameId'],
  types: {
    gameId: 'string',
    encryptionKey: 'string'
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

// Game load validation schema
const gameLoadSchema = {
  required: ['gameId'],
  types: {
    gameId: 'string',
    encryptionKey: 'string'
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

// Game undo validation schema
const gameUndoSchema = {
  required: ['gameId'],
  types: {
    gameId: 'string',
    encryptionKey: 'string'
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

// Game redo validation schema
const gameRedoSchema = {
  required: ['gameId', 'redoAction'],
  types: {
    gameId: 'string',
    redoAction: 'object',
    encryptionKey: 'string'
  },
  custom: {
    gameId: (value) => {
      if (!/^[a-f0-9]{24,}$/i.test(value)) {
        return 'Invalid game ID format';
      }
      return true;
    },
    redoAction: (value) => {
      if (!value.type) {
        return 'Redo action must have a type';
      }
      return true;
    }
  }
};

// Game replay validation schema
const gameReplaySchema = {
  required: ['gameId'],
  types: {
    gameId: 'string',
    startIndex: 'number',
    endIndex: 'number',
    encryptionKey: 'string'
  },
  custom: {
    gameId: (value) => {
      if (!/^[a-f0-9]{24,}$/i.test(value)) {
        return 'Invalid game ID format';
      }
      return true;
    },
    startIndex: (value) => {
      if (value !== undefined && value < 0) {
        return 'Start index must be non-negative';
      }
      return true;
    },
    endIndex: (value) => {
      if (value !== undefined && value < 0) {
        return 'End index must be non-negative';
      }
      return true;
    }
  }
};

module.exports = {
  gameStartSchema,
  gameMoveSchema,
  gameStateSchema,
  gameSaveSchema,
  gameLoadSchema,
  gameUndoSchema,
  gameRedoSchema,
  gameReplaySchema
};
