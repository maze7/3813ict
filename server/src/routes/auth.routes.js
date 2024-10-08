const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model'); // Import the User model
const router = express.Router();

const defaultAvatars = [
    '/uploads/ben.png',
    '/uploads/billcropped.png',
    '/uploads/frank.png',
    '/uploads/kitty.png',
    '/uploads/max.png',
    '/uploads/ronald.png',
    '/uploads/sleepysally.png',
    '/uploads/wendy.png',
];

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the user with the same username or email already exists
        const existingUser = await UserModel.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already in use.' });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = await UserModel.create({
            username,
            email,
            password: passwordHash,
            roles: ['user'],
            avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
            banned: false,
            flagged: false,
        });

        res.status(201).json({ message: 'User registered successfully.', userId: newUser._id });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user.', error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.banned) {
            return res.status(403).json({ message: 'Banned user.' });
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
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in.', error: err.message });
    }
});

const isAuthenticated = require('../middleware/auth.middleware');
router.post('/avatar', isAuthenticated, async (req, res) => {
    try {
        const { url } = req.body;

        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            { avatar: url },
            { new: true }
        );

        console.log(user);

        if (!user) {
            return res.status(401).json({ message: 'Invalid user.' });
        }

        const token = jwt.sign(
            { _id: user._id, username: user.username, roles: user.roles, banned: user.banned, flagged: user.flagged, avatar: user.avatar },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Error updating avatar', error: err.message });
    }
})

module.exports = router;
