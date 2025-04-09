const gameSchemas = require('./gameSchemas');
const playerSchemas = require('./playerSchemas');
const lobbySchemas = require('./lobbySchemas');
const cardSchemas = require('./cardSchemas');

module.exports = {
  ...gameSchemas,
  ...playerSchemas,
  ...lobbySchemas,
  ...cardSchemas
};
