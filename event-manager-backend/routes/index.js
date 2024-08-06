const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const eventController = require('../controllers/eventController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const { Pool } = require('pg');
const config = require("../config");

const pool = new Pool({
    connectionString: `postgres://${config.db.user}:${config.db.password}@localhost/${config.db.database}`,
  });

// User routes
router.post('/users', userController.createUser);
router.get('/users/:id', authMiddleware, userController.getUserById);
router.post('/logout', authMiddleware, userController.logout);
router.post('/login', userController.login);
router.get('/events', eventController.getEvents); // Ensure this line is correctly defined
router.post('/events/:id/register', authMiddleware, eventController.registerEvent);
router.get('/events/:id', eventController.getEventDetails);
router.post('/events/:id/unregister', authMiddleware, eventController.unregisterEvent);
router.post('/events/:id/isRegistered', authMiddleware, eventController.isRegistered);
router.post('/events/:id/lock', authMiddleware, eventController.lockEvent);
router.post('/events/:id/unlock', authMiddleware, eventController.unlockEvent);
router.post('/users/:id/make-event-manager', userController.makeEventManager);
router.post('/users/:id/downgrade', userController.downgradeUser);
router.get('/users', userController.getAllUsers);

// Event Manager routes
router.post('/events', authMiddleware, eventController.createEvent);
router.delete('/events/:id', authMiddleware, eventController.deleteEvent);
router.put('/events/:id', authMiddleware, eventController.updateEvent);
router.get('/events/manager/all', authMiddleware, eventController.getEventsByManager);

// Admin routes
router.post('/verify-event/:id', authMiddleware, eventController.verifyEvent);
router.get('/unverified-events', authMiddleware, eventController.getUnverifiedEvents);
router.get('/verified-events', authMiddleware, eventController.getVerifiedEvents);


// Get comments for an event
router.get('/events/:eventId/comments', async (req, res) => {
    const { eventId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM comments WHERE event_id = $1', [eventId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Add a new comment
router.post('/events/:eventId/comments', async (req, res) => {
    const { eventId } = req.params;
    const { userId, comment } = req.body;
    try {
        const result = await pool.query('INSERT INTO comments (event_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *', [eventId, userId, comment]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Get votes for an event
router.get('/events/:eventId/votes', async (req, res) => {
    const { eventId } = req.params;
    try {
        const result = await pool.query('SELECT SUM(vote) as votes FROM votes WHERE event_id = $1', [eventId]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch votes' });
    }
});

// Add or update a vote
router.post('/events/:eventId/votes', async (req, res) => {
    const { eventId } = req.params;
    const { userId, vote } = req.body;
    try {
        const result = await pool.query('INSERT INTO votes (event_id, user_id, vote) VALUES ($1, $2, $3) ON CONFLICT (event_id, user_id) DO UPDATE SET vote = $3 RETURNING *', [eventId, userId, vote]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add/update vote' });
    }
});

module.exports = router;
