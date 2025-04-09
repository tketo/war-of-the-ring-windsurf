/**
 * Validation schemas for player-related API endpoints
 */

// Player registration validation schema
const playerRegisterSchema = {
  required: ['username', 'email'],
  types: {
    username: 'string',
    email: 'string',
    preferences: 'object'
  },
  custom: {
    username: (value) => {
      if (value.length < 3 || value.length > 30) {
        return 'Username must be between 3 and 30 characters';
      }
      // Only allow alphanumeric characters, underscores, and hyphens
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'Username can only contain letters, numbers, underscores, and hyphens';
      }
      return true;
    },
    email: (value) => {
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email format';
      }
      return true;
    },
    preferences: (value) => {
      if (value) {
        if (value.language && !['en', 'es', 'fr', 'de', 'it'].includes(value.language)) {
          return 'Language must be one of: en, es, fr, de, it';
        }
        if (value.theme && !['light', 'dark'].includes(value.theme)) {
          return 'Theme must be one of: light, dark';
        }
        if (value.notifications !== undefined && typeof value.notifications !== 'boolean') {
          return 'Notifications must be a boolean';
        }
      }
      return true;
    }
  }
};

// Player profile validation schema
const playerProfileSchema = {
  required: ['id'],
  types: {
    id: 'string'
  },
  custom: {
    id: (value) => {
      if (!value || value.length < 5) {
        return 'Invalid player ID';
      }
      return true;
    }
  }
};

// Player preferences update validation schema
const playerPreferencesSchema = {
  required: ['preferences'],
  types: {
    preferences: 'object'
  },
  custom: {
    preferences: (value) => {
      if (!value || typeof value !== 'object') {
        return 'Preferences must be an object';
      }
      if (value.language && !['en', 'es', 'fr', 'de', 'it'].includes(value.language)) {
        return 'Language must be one of: en, es, fr, de, it';
      }
      if (value.theme && !['light', 'dark'].includes(value.theme)) {
        return 'Theme must be one of: light, dark';
      }
      if (value.notifications !== undefined && typeof value.notifications !== 'boolean') {
        return 'Notifications must be a boolean';
      }
      return true;
    }
  }
};

// Player stats update validation schema (internal use only)
const playerStatsSchema = {
  required: ['stats'],
  types: {
    stats: 'object'
  },
  custom: {
    stats: (value) => {
      if (!value || typeof value !== 'object') {
        return 'Stats must be an object';
      }
      
      const validStatFields = ['gamesPlayed', 'gamesWon', 'freePeoplesPlayed', 'shadowPlayed'];
      const invalidFields = Object.keys(value).filter(key => !validStatFields.includes(key));
      
      if (invalidFields.length > 0) {
        return `Invalid stat fields: ${invalidFields.join(', ')}`;
      }
      
      // Ensure all stats are non-negative numbers
      for (const [key, val] of Object.entries(value)) {
        if (typeof val !== 'number' || val < 0 || !Number.isInteger(val)) {
          return `${key} must be a non-negative integer`;
        }
      }
      
      return true;
    }
  }
};

module.exports = {
  playerRegisterSchema,
  playerProfileSchema,
  playerPreferencesSchema,
  playerStatsSchema
};
