const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const eventController = require('../controllers/eventController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

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

module.exports = router;
