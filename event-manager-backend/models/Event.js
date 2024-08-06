const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
    connectionString: `postgres://${config.db.user}:${config.db.password}@localhost/${config.db.database}`,
  });
const Event = {
    getAll: async () => {
        return pool.query(`
            SELECT events.*, users.id AS manager_id, users.username AS manager_username 
            FROM events 
            JOIN users ON events.manager_id = users.id
            WHERE events.is_verified = true
        `);
    },
    create: async (eventData) => {
        const { name, description, location, start_time, end_time, capacity, manager_id } = eventData;
        return pool.query(
            'INSERT INTO events (name, description, location, start_time, end_time, capacity, manager_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, description, location, start_time, end_time, capacity, manager_id]
        );
    },
    delete: (eventId) => {
        return pool.query('DELETE FROM events WHERE id = $1', [eventId]);
    },
    update: async (eventId, eventData) => {
        const { id } = req.params;
        const { name, description, location, start_time, end_time, capacity } = req.body;

        try {
            const result = await pool.query(
                'UPDATE events SET name = $1, description = $2, location = $3, start_time = $4, end_time = $5, capacity = $6 WHERE id = $7 RETURNING *',
                [name, description, location, start_time, end_time, capacity, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Event not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ message: 'Error updating event' });
        }
    },
    register: (eventId, userId) => {
        return pool.query('INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2) RETURNING *', [eventId, userId])
            .catch(err => {
                console.error('Database query error:', err);
                throw err;
            });
    },
    verify: (eventId) => {
        return pool.query('UPDATE events SET verified = true WHERE id = $1 RETURNING *', [eventId]);
    },
    getById: (eventId) => {
        return pool.query('SELECT * FROM events WHERE id = $1', [eventId])
            .catch(err => {
                console.error('Database query error:', err);
                throw err;
            });
    },
    unregister: (eventId, userId) => {
        return pool.query('DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2 RETURNING *', [eventId, userId])
            .catch(err => {
                console.error('Database query error:', err);
                throw err;
            });
    },
    isRegistered: (eventId, userId) => {
        return pool.query('SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2', [eventId, userId])
            .catch(err => {
                console.error('Database query error:', err);
                throw err;
            });
    },
    findByManager: (userId) => {
        console.log('Querying events for manager with ID:', userId); // Debug log
        return pool.query('SELECT * FROM events WHERE manager_id = $1', [userId])
            .catch(err => {
                console.error('Database query error:', err); // Detailed error log
                throw err;
            });
    },
    lock: async (eventId) => {
        return pool.query('UPDATE events SET is_locked = TRUE WHERE id = $1 RETURNING *', [eventId]);
    },
    unlock: (id) => {
        return pool.query('UPDATE events SET is_locked = FALSE WHERE id = $1 RETURNING *', [id]);
    },
    setFinished: async (eventId) => {
        return pool.query('UPDATE events SET is_finished = TRUE WHERE id = $1 RETURNING *', [eventId]);
    },
    verifyEvent: async (eventId) => {
        await pool.query('UPDATE events SET is_verified = true WHERE id = $1', [eventId]);
        return pool.query(`
            SELECT events.*, users.id AS manager_id, users.username AS manager_username 
            FROM events 
            JOIN users ON events.manager_id = users.id
            WHERE events.id = $1
        `, [eventId]);    
    },
    getUnverifiedEvents: async () => {
        return pool.query(`
            SELECT events.*, users.id AS manager_id, users.username AS manager_username 
            FROM events 
            JOIN users ON events.manager_id = users.id
            WHERE events.is_verified = false
        `);
    },
    getVerifiedEvents: () => {
        return pool.query('SELECT * FROM events WHERE is_verified = TRUE');
    }
};

module.exports = Event;
