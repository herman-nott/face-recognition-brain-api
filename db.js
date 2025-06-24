const knex = require('knex');

const database = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: 'ger06man',
    database: 'face_recognition_brain_db',
  },
});

module.exports = database;