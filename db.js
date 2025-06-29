const knex = require('knex');
require('dotenv').config();

const database = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = database;