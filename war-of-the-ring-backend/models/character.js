const mongoose = require('mongoose');

// Ability schema for character abilities
const abilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  i18n: {
    type: Map,
    of: {
      name: String,
      description: String
    }
  }
});

// Character schema
const characterSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  faction: {
    type: String,
    enum: ['Free Peoples', 'Shadow'],
    required: true
  },
  type: {
    type: String,
    enum: ['companion', 'minion', 'other'],
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  leadership: {
    type: Number,
    default: 0
  },
  actionDieBonus: {
    type: Number,
    default: 0
  },
  abilities: [abilitySchema],
  startingLocation: {
    type: String,
    default: ''
  },
  i18n: {
    type: Map,
    of: {
      name: String,
      title: String
    }
  }
});

// Create and export the model
const Character = mongoose.model('Character', characterSchema);

module.exports = Character;
