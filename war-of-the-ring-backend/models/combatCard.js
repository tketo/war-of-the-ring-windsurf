const mongoose = require('mongoose');

// Combat card schema
const combatCardSchema = new mongoose.Schema({
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
  faction: {
    type: String,
    enum: ['Free Peoples', 'Shadow', 'Neutral'],
    required: true
  },
  combatBonus: {
    type: Number,
    default: 0
  },
  leaderBonus: {
    type: Number,
    default: 0
  },
  specialEffect: {
    type: String,
    default: ''
  },
  conditions: {
    type: [String],
    default: []
  },
  linkedEventCards: {
    type: [String],
    default: []
  },
  i18n: {
    type: Map,
    of: {
      name: String,
      specialEffect: String
    }
  }
});

// Create and export the model
const CombatCard = mongoose.model('CombatCard', combatCardSchema);

module.exports = CombatCard;
