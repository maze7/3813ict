const express = require('express');
const UserModel = require('../models/user.model'); // Import the User model
const isAuthenticated = require('../middleware/auth.middleware');

const router = express.Router();
router.use(isAuthenticated);

// Register route
router.get('/list', async (req, res) => {
    try {
        const users = await UserModel.find({});

        res.status(201).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error getting users.', error: err.message });
    }
});

module.exports = router;
