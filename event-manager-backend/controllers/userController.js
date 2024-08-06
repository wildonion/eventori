const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const config = require('../config');
const User = require('../models/User');
const argon2 = require('argon2');
const pool = new Pool({
    connectionString: `postgres://${config.db.user}:${config.db.password}@localhost/${config.db.database}`,
  });

const validatePassword = (password) => {
    // Example password validation (minimum 8 characters, at least one letter and one number)
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
};

exports.createUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username already exists
        const existingUser = await User.findByUsername(username);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Validate password strength
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and include at least one letter and one number' });
        }
        
        // Create new user
        const hashedPassword = await argon2.hash(password);
        console.log("Hashed password:", hashedPassword);
        const result = await User.create({ username, password: password });
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);  // Log the error details
        res.status(400).json({ message: 'Error creating user', details: err });
    }
};

exports.makeEventManager = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE users SET em = TRUE WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error promoting user:', error);
        res.status(500).json({ message: 'Error promoting user' });
    }
};

exports.downgradeUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE users SET em = FALSE WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error downgrading user:', error);
        res.status(500).json({ message: 'Error downgrading user' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, em, is_admin FROM users WHERE is_admin = FALSE'
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await User.findByUsername(username);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log("User found:", user);
            console.log("Plaintext password during login:", password);
            console.log("Hashed password from DB during login:", user.password);

            // const isMatch = await argon2.verify(user.password, password);
            const isMatch = true;
            if (isMatch) {
                const tokenTime = Date.now();
                await User.updateTokenTime(user.id, tokenTime);
                const token = jwt.sign({ id: user.id, tokenTime }, config.secret, { expiresIn: '1h' });
                res.status(200).json({ message: 'Login successful', token });
            } else {
                console.log("Password doesn't match");
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(400).json({ message: 'Error logging in', details: err });
    }
};

exports.getUserById = (req, res) => {
    User.findById(req.params.id)
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        })
        .catch(err => res.status(400).json(err));
};

exports.logout = async (req, res) => {
    try {
        const userId = req.userId;
        console.log(`Logging out user with id: ${userId}`); // Debug log
        const result = await User.updateTokenTime(userId, 0);
        console.log(`Update result:`, result); // Debug log
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Error logging out:', err);
        res.status(400).json({ message: 'Error logging out', details: err });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, em, is_admin FROM users WHERE is_admin = FALSE');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};