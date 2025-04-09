const mongoose = require('mongoose');

// Region schema
const regionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['settlement', 'city', 'stronghold', 'wilderness'],
    required: true
  },
  nation: {
    type: String,
    required: true
  },
  politicalStatus: {
    type: String,
    enum: ['active', 'passive', 'at war'],
    default: 'passive'
  },
  victoryPoints: {
    type: Number,
    default: 0
  },
  adjacentRegions: {
    type: [String],
    default: []
  },
  specialRules: {
    type: [String],
    default: []
  },
  i18n: {
    type: Map,
    of: {
      name: String,
      specialRules: [String]
    }
  }
});

// Create and export the model
const Region = mongoose.model('Region', regionSchema);

module.exports = Region;
