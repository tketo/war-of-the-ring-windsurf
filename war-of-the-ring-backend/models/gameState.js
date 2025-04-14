const mongoose = require('mongoose');
const crypto = require('crypto');

// History item schema for tracking game state changes
const historyItemSchema = new mongoose.Schema({
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
  mode: { 
    type: String, 
    enum: ["Full", "Companion"], 
    default: "Full" 
  },
  rulesEnforced: { 
    type: Boolean, 
    default: true 
  },
  playerCount: {
    type: Number,
    enum: [1, 2, 3, 4],
    default: 2
  },
  expansions: { 
    type: [String], 
    default: [] 
  },
  scenario: { 
    type: String, 
    default: "Base" 
  },
  players: [{
    id: { 
      type: String, 
      required: true 
    },
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
    isAI: { 
      type: Boolean, 
      default: false 
    },
    aiStrategy: { 
      type: String, 
      default: null 
    },
    isLeading: { 
      type: Boolean, 
      default: false 
    },
    hand: { 
      type: [String], 
      default: [] 
    },
    controlledNations: { 
      type: [String], 
      default: [] 
    }
  }],
  board: {
    regions: {
      type: Map,
      of: {
        name: { 
          type: String, 
          required: true 
        },
        control: { 
          type: String, 
          default: null 
        },
        siegeStatus: { 
          type: String, 
          enum: ["in", "out"], 
          default: "out" 
        },
        nation: { 
          type: String, 
          required: true 
        },
        deployments: [{
          group: { 
            type: String, 
            enum: ["normal", "besieged", "sieging", "rearGuard"], 
            default: "normal" 
          },
          units: {
            regular: { 
              type: Number, 
              default: 0 
            },
            elite: { 
              type: Number, 
              default: 0 
            },
            owner: { 
              type: String, 
              required: true 
            }
          },
          leaders: { 
            type: Number, 
            default: 0 
          }
        }],
        characters: { 
          type: [String], 
          default: [] 
        },
        structure: {
          type: { 
            type: String, 
            enum: ["town", "city", "stronghold", "fortification", null], 
            default: null 
          },
          category: { 
            type: String, 
            enum: ["settlement", "fortification", null], 
            default: null 
          },
          canMuster: { 
            type: Boolean, 
            default: false 
          },
          vp: { 
            type: Number, 
            default: 0 
          }
        }
      }
    },
    actionDiceArea: {
      free: [{ 
        type: String, 
        selected: { 
          type: Boolean, 
          default: false 
        } 
      }],
      shadow: [{ 
        type: String, 
        selected: { 
          type: Boolean, 
          default: false 
        } 
      }]
    },
    combatDiceArea: { 
      free: [Number], 
      shadow: [Number] 
    },
    huntBox: { 
      dice: { 
        type: Number, 
        default: 0 
      }, 
      tile: { 
        type: String, 
        default: null 
      } 
    },
    elvenRings: { 
      free: { 
        type: Number, 
        default: 3 
      }, 
      shadow: { 
        type: Number, 
        default: 0 
      } 
    },
    eventDecks: {
      freeCharacter: { 
        type: [String], 
        default: [] 
      },
      freeStrategy: { 
        type: [String], 
        default: [] 
      },
      shadowCharacter: { 
        type: [String], 
        default: [] 
      },
      shadowStrategy: { 
        type: [String], 
        default: [] 
      }
    },
    huntPool: { 
      tiles: { 
        type: [String], 
        default: [] 
      }, 
      count: { 
        type: Number, 
        default: 16 
      } 
    },
    fellowshipTrack: {
      progress: { 
        value: { 
          type: Number, 
          default: 0 
        }, 
        hidden: { 
          type: Boolean, 
          default: true 
        } 
      },
      corruption: { 
        type: Number, 
        default: 0 
      }
    },
    politicalTrack: {
      type: Map,
      of: { 
        position: { 
          type: String, 
          required: true 
        }, 
        active: { 
          type: Boolean, 
          default: false 
        } 
      }
    },
    guideBox: { 
      companion: { 
        type: String, 
        default: "gandalf_grey" 
      } 
    },
    fellowshipBox: { 
      companions: { 
        type: [String], 
        default: [] 
      } 
    },
    victoryPoints: { 
      free: { 
        type: Number, 
        default: 0 
      }, 
      shadow: { 
        type: Number, 
        default: 0 
      } 
    },
    mordorTrack: { 
      position: { 
        type: String, 
        default: null 
      } 
    },
    gollum: { 
      location: { 
        type: String, 
        default: null 
      } 
    }
  },
  offBoard: {
    free: { 
      hand: { 
        type: [String], 
        default: [] 
      }, 
      discards: { 
        type: [String], 
        default: [] 
      }, 
      reserves: { 
        type: Map, 
        of: { 
          regular: Number, 
          elite: Number 
        }, 
        default: {} 
      }, 
      graveyard: { 
        type: [String], 
        default: [] 
      } 
    },
    shadow: { 
      hand: { 
        type: [String], 
        default: [] 
      }, 
      discards: { 
        type: [String], 
        default: [] 
      }, 
      reserves: { 
        type: Map, 
        of: { 
          regular: Number, 
          elite: Number 
        }, 
        default: {} 
      }, 
      graveyard: { 
        type: [String], 
        default: [] 
      } 
    }
  },
  turn: {
    phase: { 
      type: String, 
      required: true,
      default: 'setup',
      enum: ['setup', 'recover', 'fellowship', 'hunt', 'action', 'combat', 'victory', 'end']
    },
    activePlayer: { 
      type: String, 
      required: true 
    },
    turnOrder: { 
      type: [String], 
      default: [] 
    }
  },
  combat: {
    attacker: { 
      type: String, 
      default: null 
    },
    defender: { 
      type: String, 
      default: null 
    },
    region: { 
      type: String, 
      default: null 
    },
    round: { 
      type: Number, 
      default: 0 
    },
    leadershipForfeited: { 
      free: { 
        type: Boolean, 
        default: false 
      }, 
      shadow: { 
        type: Boolean, 
        default: false 
      } 
    },
    combatCards: { 
      free: { 
        type: String, 
        default: null 
      }, 
      shadow: { 
        type: String, 
        default: null 
      } 
    }
  },
  history: [historyItemSchema],
  replay: { 
    actions: { 
      type: [Object], 
      default: [] 
    }, 
    currentStep: { 
      type: Number, 
      default: 0 
    } 
  },
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
gameStateSchema.methods.addToHistory = function(action, player, committed = false) {
  this.history.push({
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
    item.action.phase === phase
  );
};

// Create and export the model
const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;
