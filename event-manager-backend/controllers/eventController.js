const Event = require('../models/Event');

exports.getEvents = (req, res) => {
    Event.getAll()
        .then(result => res.status(200).json(result.rows))
        .catch(err => {
            console.error('Error fetching events:', err);
            res.status(500).json({ error: 'Failed to fetch events', details: err.message });
        });
};

exports.createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        eventData.manager_id = req.userId; // assuming the userId is the manager_id
        const result = await Event.create(eventData);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(400).json({ message: 'Error creating event', details: err });
    }
};


exports.deleteEvent = (req, res) => {
    const eventId = req.params.id;
    Event.delete(eventId)
        .then(() => res.status(200).json({ message: 'Event deleted successfully' }))
        .catch(err => {
            console.error('Error deleting event:', err);
            res.status(500).json({ error: 'Failed to delete event', details: err.message });
        });
};

exports.updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const eventData = req.body;
        const result = await Event.update(eventId, eventData);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(400).json({ message: 'Error updating event', details: err });
    }
};

exports.registerEvent = (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.userId;
    console.log('Event ID:', eventId, 'User ID:', userId);
    
    Event.register(eventId, userId)
        .then(result => res.status(200).json(result.rows[0]))
        .catch(err => {
            console.error('Error registering for event:', err);
            res.status(500).json({ error: 'Failed to register for event', details: err.message });
        });
};


exports.lockEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        console.log("event id >> ", eventId);
        const result = await Event.lock(eventId);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error locking event:', err);
        res.status(400).json({ message: 'Error locking event', details: err });
    }
};

exports.unlockEvent = (req, res) => {
    const eventId = req.params.id;
    Event.unlock(eventId)
        .then(result => res.status(200).json({ message: 'Event unlocked successfully' }))
        .catch(err => {
            console.error('Error unlocking event:', err);
            res.status(500).json({ message: 'Failed to unlock event', details: err.message });
        });
};

exports.getEventDetails = (req, res) => {
    const eventId = req.params.id;

    Event.getById(eventId)
        .then(result => res.status(200).json(result.rows[0]))
        .catch(err => {
            console.error('Error fetching event details:', err);
            res.status(500).json({ error: 'Failed to fetch event details', details: err.message });
        });
};

exports.registerEvent = (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.userId;

    Event.isRegistered(eventId, userId)
        .then(result => {
            if (result.rows.length > 0) {
                res.status(400).json({ message: 'User already registered for this event' });
            } else {
                Event.register(eventId, userId)
                    .then(result => res.status(200).json(result.rows[0]))
                    .catch(err => {
                        console.error('Error registering for event:', err);
                        res.status(500).json({ error: 'Failed to register for event', details: err.message });
                    });
            }
        })
        .catch(err => {
            console.error('Error checking registration:', err);
            res.status(500).json({ error: 'Failed to check registration', details: err.message });
        });
};

exports.unregisterEvent = (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.userId;

    Event.unregister(eventId, userId)
        .then(result => res.status(200).json(result.rows[0]))
        .catch(err => {
            console.error('Error unregistering for event:', err);
            res.status(500).json({ error: 'Failed to unregister for event', details: err.message });
        });
};

exports.isRegistered = (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.userId;

    Event.isRegistered(eventId, userId)
        .then(result => res.status(200).json({ isRegistered: result.rows.length > 0 }))
        .catch(err => {
            console.error('Error checking registration:', err);
            res.status(500).json({ error: 'Failed to check registration', details: err.message });
        });
};

exports.getEventsByManager = (req, res) => {
    const userId = req.userId;
    console.log('Fetching events for manager with ID:', userId); // Debug log
    Event.findByManager(userId)
        .then(result => res.status(200).json(result.rows))
        .catch(err => {
            console.error('Error fetching events:', err); // Detailed error log
            res.status(500).json({ error: 'Failed to fetch events', details: err.message });
        });
};

exports.verifyEvent = (req, res) => {
    const eventId = req.params.id;
    Event.verifyEvent(eventId)
        .then(result => res.status(200).json(result.rows[0]))
        .catch(err => res.status(400).json({ message: 'Error verifying event', details: err }));
};

exports.getUnverifiedEvents = (req, res) => {
    Event.getUnverifiedEvents()
        .then(result => res.status(200).json(result.rows))
        .catch(err => res.status(400).json({ message: 'Error fetching unverified events', details: err }));
};

exports.getVerifiedEvents = (req, res) => {
    Event.getVerifiedEvents()
        .then(result => res.status(200).json(result.rows))
        .catch(err => res.status(400).json({ message: 'Error fetching verified events', details: err }));
};