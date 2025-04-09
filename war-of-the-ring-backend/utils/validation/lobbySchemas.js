/**
 * Validation schemas for lobby-related API endpoints
 */

// Lobby creation validation schema
const lobbyCreateSchema = {
  types: {
    name: 'string',
    maxPlayers: 'number',
    mode: 'string',
    expansions: 'array',
    scenario: 'string',
    isPrivate: 'boolean'
  },
  enums: {
    mode: ['full', 'unrestricted', 'companion']
  },
  custom: {
    name: (value) => {
      if (value && (value.length < 3 || value.length > 50)) {
        return 'Lobby name must be between 3 and 50 characters';
      }
      return true;
    },
    maxPlayers: (value) => {
      if (value !== undefined && (!Number.isInteger(value) || value < 1 || value > 4)) {
        return 'Max players must be an integer between 1 and 4';
      }
      return true;
    },
    expansions: (value) => {
      if (value && !Array.isArray(value)) {
        return 'Expansions must be an array';
      }
      return true;
    }
  }
};

// Lobby join validation schema
const lobbyJoinSchema = {
  required: ['lobbyId'],
  types: {
    lobbyId: 'string',
    inviteCode: 'string',
    faction: 'string'
  },
  enums: {
    faction: ['Free Peoples', 'Shadow']
  },
  custom: {
    lobbyId: (value) => {
      if (!value || value.length < 5) {
        return 'Invalid lobby ID';
      }
      return true;
    },
    inviteCode: (value) => {
      if (value && value.length !== 6) {
        return 'Invite code must be 6 characters';
      }
      return true;
    }
  }
};

// Lobby leave validation schema
const lobbyLeaveSchema = {
  required: ['lobbyId'],
  types: {
    lobbyId: 'string'
  },
  custom: {
    lobbyId: (value) => {
      if (!value || value.length < 5) {
        return 'Invalid lobby ID';
      }
      return true;
    }
  }
};

// Lobby ready validation schema
const lobbyReadySchema = {
  required: ['lobbyId', 'ready'],
  types: {
    lobbyId: 'string',
    ready: 'boolean'
  },
  custom: {
    lobbyId: (value) => {
      if (!value || value.length < 5) {
        return 'Invalid lobby ID';
      }
      return true;
    }
  }
};

// Lobby start validation schema
const lobbyStartSchema = {
  required: ['lobbyId'],
  types: {
    lobbyId: 'string'
  },
  custom: {
    lobbyId: (value) => {
      if (!value || value.length < 5) {
        return 'Invalid lobby ID';
      }
      return true;
    }
  }
};

module.exports = {
  lobbyCreateSchema,
  lobbyJoinSchema,
  lobbyLeaveSchema,
  lobbyReadySchema,
  lobbyStartSchema
};
