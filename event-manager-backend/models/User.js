const { Pool } = require('pg');
const config = require('../config');
const argon2 = require('argon2');
const pool = new Pool({
    connectionString: `postgres://${config.db.user}:${config.db.password}@localhost/${config.db.database}`,
  });

  
  const User = {
    create: async (userData) => {
        const { username, password } = userData;
        const hashedPassword = await argon2.hash(password);
        return pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, password]
        );
    },
    findByUsername: (username) => {
        return pool.query('SELECT * FROM users WHERE username = $1', [username]);
    },
    findById: (id) => {
        return pool.query('SELECT * FROM users WHERE id = $1', [id]);
    },
    updateTokenTime: (id, tokenTime) => {
        console.log(`Updating token time for user id: ${id} to ${tokenTime}`); // Debug log
        return pool.query('UPDATE users SET token_time = $1 WHERE id = $2', [tokenTime, id]);
    }
};


module.exports = User;
