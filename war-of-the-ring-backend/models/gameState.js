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
        characters: [{ 
          id: { type: String, required: true },
          owner: { type: String, required: true }
        }],
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
        type: { type: String, required: true }
      }],
      shadow: [{ 
        type: { type: String, required: true }
      }]
    },
    selectedDiceArea: {
      free: [{ 
        type: { type: String, required: true },
        index: { type: Number, required: true }
      }],
      shadow: [{ 
        type: { type: String, required: true },
        index: { type: Number, required: true }
      }]
    },
    usedDiceArea: {
      free: [{ 
        type: { type: String, required: true }
      }],
      shadow: [{ 
        type: { type: String, required: true }
      }]
    },
    combatDiceArea: { 
      free: [Number], 
      shadow: [Number] 
    },
    huntBox: { 
      diceArea: [{ 
        type: { type: String, required: true },
        team: { type: String, required: true }
      }],
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
      tiles: [{ 
        id: { type: String, required: true }
      }],
      regular: {
        type: Number,
        default: 6
      },
      eye: {
        type: Number,
        default: 2
      }
    },
    reservedHuntTilesArea: {
      type: Map,
      of: [{ id: { type: String, required: true } }]
    },
    tableCardsArea: {
      type: Map,
      of: {
        id: { type: String, required: true },
        owner: { type: String, required: true },
        type: { 
          type: String, 
          enum: ["combat", "event", "character"],
          required: true
        }
      }
    },
    fellowshipTrack: {
      progress: { 
        value: { 
          type: Number, 
          default: 0 
        }
      },
      corruption: { 
        type: Number, 
        default: 0 
      }
    },
    fellowshipBox: { 
      companions: [{ 
        id: { type: String, required: true },
        owner: { type: String, required: true }
      }]
    },
    guideBox: { 
      companion: { 
        type: String, 
        default: null 
      } 
    },
    politicalTrack: {
      type: Map,
      of: {
        position: { 
          type: Number, 
          default: 0 
        },
        face: {
          type: String,
          enum: ["active", "passive"],
          default: "passive"
        }
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
      },
      owner: {
        type: String,
        default: null
      }
    }
  },
  offBoard: {
    free: { 
      hand: [{ 
        id: { type: String, required: true }
      }], 
      discards: [{ 
        id: { type: String, required: true }
      }], 
      reserves: { 
        type: Map, 
        of: { 
          regular: Number, 
          elite: Number 
        }
      }, 
      graveyard: [{ 
        id: { type: String, required: true },
        owner: { type: String, required: true }
      }]
    },
    shadow: { 
      hand: [{ 
        id: { type: String, required: true }
      }], 
      discards: [{ 
        id: { type: String, required: true }
      }], 
      reserves: { 
        type: Map, 
        of: { 
          regular: Number, 
          elite: Number 
        }
      }, 
      graveyard: [{ 
        id: { type: String, required: true },
        owner: { type: String, required: true }
      }]
    },
    playerAreas: {
      type: Map,
      of: {
        hand: [{ id: { type: String, required: true } }],
        reserved: [{ id: { type: String, required: true } }]
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

// Helper methods for state inference

// Check if a region is under siege based on deployment groups
gameStateSchema.methods.hasSiege = function(regionId) {
  const region = this.board.regions.get(regionId);
  if (!region) return false;
  
  const besiegedDeployment = region.deployments.find(d => d.group === 'besieged');
  const siegingDeployment = region.deployments.find(d => d.group === 'sieging');
  
  return besiegedDeployment && siegingDeployment;
};

// Check if the fellowship is hidden based on progress value and hunt tile
gameStateSchema.methods.isFellowshipHidden = function() {
  // Fellowship is hidden if no hunt tile is revealed
  return !this.board.huntBox.tile;
};

// Check if a nation is at war based on political track face
gameStateSchema.methods.isAtWar = function(nationId) {
  const nationTrack = this.board.politicalTrack.get(nationId);
  if (!nationTrack) return false;
  
  return nationTrack.face === 'active';
};

// Create and export the model
const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;
