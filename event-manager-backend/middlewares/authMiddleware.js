const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.log('No token provided');
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('Invalid token format');
        return res.status(403).json({ message: 'Invalid token format' });
    }

    try {
        console.log("Token:", token);
        const decoded = jwt.verify(token, config.secret);
        console.log("Decoded token:", decoded);

        const userId = decoded.id;
        const tokenTime = decoded.tokenTime;

        const result = await User.findById(userId);
        if (result.rows.length === 0) {
            console.log('Invalid token: user not found');
            return res.status(403).json({ message: 'Invalid token' });
        }
        

        const user = result.rows[0];
        console.log("User token time:", user.token_time);
        console.log("Token time from token:", tokenTime);

        if (BigInt(user.token_time) !== BigInt(tokenTime)) {
            console.log('Invalid token: token times do not match');
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.userId = userId;
        next();
    } catch (err) {
        console.error('Failed to authenticate token:', err);
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

module.exports = authMiddleware;
