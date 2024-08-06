const app = require('./app');
const { Pool } = require('pg');
const config = require('./config');
require('./scheduler'); // Add this line to start the scheduler

console.log('Database configuration:', config.db);  // Add this line for debugging

const pool = new Pool({
    connectionString: `postgres://${config.db.user}:${config.db.password}@localhost/${config.db.database}`,
  });

app.set('port', process.env.PORT || 3001);


pool.connect()
    .then(client => {
        return client
            .query('SELECT NOW() AND ')
            .then(res => {
                client.release();
                console.log(res.rows);
                app.listen(app.get('port'), () => {
                    console.log(`Server running on port ${app.get('port')}`);
                });
            })
            .catch(err => {
                client.release();
                console.error(err.stack);
            });
    })
    .catch(err => {
        console.error('Database connection error:', err);  // Add this line
    });
