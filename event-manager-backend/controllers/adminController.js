const Event = require('../models/Event');
const User = require('../models/User');

exports.verifyEvent = (req, res) => {
    Event.verify(req.body.eventId)
        .then(result => res.status(200).json(result.rows[0]))
        .catch(err => res.status(400).json(err));
};

exports.verifyEventManager = (req, res) => {
    User.verifyEventManager(req.body.userId)
        .then(result => res.status(200).json(result.rows[0]))
        .catch(err => res.status(400).json(err));
};
