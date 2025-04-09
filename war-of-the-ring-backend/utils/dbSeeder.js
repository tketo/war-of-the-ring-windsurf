const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { EventCard, CombatCard, Character, Region } = require('../models');
require('dotenv').config();

/**
 * Seed the database with initial game data
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/war-of-the-ring', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB');
    }
    
    // Path to data files
    const dataDir = path.join(__dirname, '../../data');
    
    // Seed event cards
    await seedCollection(
      path.join(dataDir, 'eventcards.json'),
      'eventcards',
      EventCard,
      'Event Cards'
    );
    
    // Seed combat cards
    await seedCollection(
      path.join(dataDir, 'combatcards.json'),
      'combatcards',
      CombatCard,
      'Combat Cards'
    );
    
    // Seed characters
    await seedCollection(
      path.join(dataDir, 'characters.json'),
      'characters',
      Character,
      'Characters'
    );
    
    // Seed regions
    await seedCollection(
      path.join(dataDir, 'regions.json'),
      'regions',
      Region,
      'Regions'
    );
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

/**
 * Seed a specific collection from a JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {string} collectionKey - Key in the JSON file that contains the array of items
 * @param {mongoose.Model} Model - Mongoose model to use
 * @param {string} displayName - Display name for logging
 */
async function seedCollection(filePath, collectionKey, Model, displayName) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${filePath} does not exist. Skipping ${displayName} seeding.`);
      return;
    }
    
    // Read and parse the JSON file
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Check if the collection key exists in the data
    if (!data[collectionKey] || !Array.isArray(data[collectionKey])) {
      console.warn(`Warning: ${collectionKey} not found or not an array in ${filePath}. Skipping ${displayName} seeding.`);
      return;
    }
    
    const items = data[collectionKey];
    console.log(`Found ${items.length} ${displayName} to seed`);
    
    // Clear existing data
    await Model.deleteMany({});
    console.log(`Cleared existing ${displayName}`);
    
    // Insert new data
    if (items.length > 0) {
      await Model.insertMany(items);
      console.log(`Seeded ${items.length} ${displayName}`);
    }
  } catch (error) {
    console.error(`Error seeding ${displayName}:`, error);
    throw error;
  }
}

// Export the seeding function
module.exports = seedDatabase;

// If this script is run directly, execute the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed, exiting...');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
