const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model'); // Import the User model

const router = express.Router();

const defaultAvatars = [
    'ben.png',
    'billcropped.png',
    'frank.png',
    'kitty.png',
    'max.png',
    'ronald.png',
    'sleepysally.png',
    'wendy.png',
];

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the username or email is already in use
        const existingUser = await UserModel.findOne({ $or: [{ username: email }, { email }] }).select('+password');
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already in use.' });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new UserModel({
            username,
            email,
            password: passwordHash,
            avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user.', error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await UserModel.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { _id: user._id, username: user.username, roles: user.roles, banned: user.banned, flagged: user.flagged, avatar: user.avatar },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in.', error: err.message });
    }
});

module.exports = router;
