const mongoose = require('mongoose');
const crypto = require('crypto');

// History item schema for tracking game state changes
const historyItemSchema = new mongoose.Schema({
  state: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  action: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  committed: {
    type: Boolean,
    default: false
  },
  player: {
    type: String,
    required: true
  }
});

// Game state schema
const gameStateSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  players: [{
    playerId: String,
    team: { 
      type: String, 
      enum: ["Free", "Shadow"],
      required: true
    },
    role: { 
      type: String, 
      enum: ["FreeAll", "GondorElves", "RohanNorthDwarves", "Sauron", "Saruman"],
      required: true
    },
    isAI: Boolean,
    aiStrategy: String,
    isLeading: Boolean,
    hand: [String], // Cards held, max 4 in 4-player
    controlledNations: [String] // Nation codes: "3" (Gondor), "7" (Sauron), etc.
  }],
  playerCount: {
    type: Number,
    enum: [1, 2, 3, 4],
    default: 2
  },
  currentPhase: {
    type: String,
    enum: ['setup', 'hunt', 'action', 'combat', 'end'],
    default: 'setup'
  },
  currentTurn: {
    type: Number,
    default: 1
  },
  currentPlayer: {
    type: String
  },
  turnOrder: {
    type: [String],
    default: []
  },
  actionDice: {
    free: [{
      type: String,
      selected: Boolean
    }],
    shadow: [{
      type: String,
      selected: Boolean
    }]
  },
  characters: [{
    characterId: String,
    location: String,
    status: String,
    modifiers: [String],
    corruption: {
      type: Number,
      default: 0
    },
    position: {
      type: Number,
      default: 0
    }
  }],
  regions: [{
    regionId: String,
    controlledBy: String,
    units: [{
      type: String,
      count: Number,
      faction: String,
      nation: String,
      active: {
        type: Boolean,
        default: false
      }
    }]
  }],
  nations: {
    north: {
      status: {
        type: Number,
        default: 0,
        min: -2,
        max: 2
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    rohan: {
      status: {
        type: Number,
        default: 0,
        min: -2,
        max: 2
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    gondor: {
      status: {
        type: Number,
        default: 0,
        min: -2,
        max: 2
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    elves: {
      status: {
        type: Number,
        default: 2, // Elves start active for Free Peoples
        min: -2,
        max: 2
      },
      active: {
        type: Boolean,
        default: true
      }
    },
    dwarves: {
      status: {
        type: Number,
        default: 0,
        min: -2,
        max: 2
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    southEast: {
      status: {
        type: Number,
        default: -2, // South/East starts active for Shadow
        min: -2,
        max: 2
      },
      active: {
        type: Boolean,
        default: true
      }
    }
  },
  huntBox: [String], // Dice allocated to the hunt box
  huntPool: {
    regular: {
      type: Number,
      default: 12
    },
    eye: {
      type: Number,
      default: 0
    }
  },
  huntHistory: [{
    type: {
      type: String,
      enum: ['regular', 'reveal', 'eye', 'character']
    },
    value: Number,
    drawnAt: {
      type: Date,
      default: Date.now
    }
  }],
  victoryPoints: {
    freePeoples: {
      type: Number,
      default: 0
    },
    shadow: {
      type: Number,
      default: 0
    }
  },
  cards: {
    eventDeck: [String],
    eventDiscard: [String],
    combatDeck: [String],
    combatDiscard: [String],
    playerHands: {
      type: Map,
      of: [String]
    }
  },
  history: [historyItemSchema],
  settings: {
    mode: {
      type: String,
      enum: ['full', 'unrestricted', 'companion'],
      default: 'full'
    },
    rulesEnforced: {
      type: Boolean,
      default: true
    },
    expansions: [String],
    scenario: String
  },
  // Encrypted field for sensitive data
  encryptedData: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
gameStateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Encryption/decryption methods using AES-256
gameStateSchema.methods.encrypt = function(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

gameStateSchema.methods.decrypt = function(encryptedData, key) {
  const textParts = encryptedData.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

// Method to add an action to history
gameStateSchema.methods.addToHistory = function(state, action, player, committed = false) {
  this.history.push({
    state: state,
    action: action,
    player: player,
    committed: committed,
    timestamp: Date.now()
  });
};

// Method to get uncommitted history for a phase (for undo/redo in Rules Enforced mode)
gameStateSchema.methods.getUncommittedHistory = function(phase) {
  return this.history.filter(item => 
    !item.committed && 
    item.state.currentPhase === phase
  );
};

// Create and export the model
const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;
