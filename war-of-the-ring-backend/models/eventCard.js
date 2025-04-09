const mongoose = require('mongoose');

// Event card schema
const eventCardSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['Character', 'Strategy', 'Army', 'Muster'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  effect: {
    type: String,
    required: true
  },
  conditions: {
    type: [String],
    default: []
  },
  linkedCombatCards: {
    type: [String],
    default: []
  },
  i18n: {
    type: Map,
    of: {
      name: String,
      text: String,
      effect: String
    }
  }
});

// Create and export the model
const EventCard = mongoose.model('EventCard', eventCardSchema);

module.exports = EventCard;
