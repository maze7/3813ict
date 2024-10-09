const express = require('express');
const UserModel = require('../models/user.model'); // Mongoose User model
const isAuthenticated = require('../middleware/auth.middleware');
const { hasRole } = require("../middleware/role.middleware");

const router = express.Router();
router.use(isAuthenticated);

// List users
router.get('/list', hasRole('superAdmin'), async (req, res) => {
    try {
        const users = await UserModel.find(); // Fetch all users
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error getting users.', error: err.message });
    }
});

// Delete user
router.delete('/:id', hasRole('superAdmin'), async (req, res) => {
    try {
        await UserModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user.', error: err.message });
    }
});

// Update user
router.put('/:id', hasRole('superAdmin'), async (req, res) => {
    try {
        const { user } = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, user, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated.', user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user.', error: err.message });
    }
});

// Ban or unban a user
router.post('/:id/ban', hasRole('superAdmin'), async (req, res) => {
    try {
        const { banned } = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            { banned, flagged: false },  // Update both banned and flagged fields
            { new: true }  // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ status: updatedUser.banned });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error banning user', error: err.message });
    }
});

// Flag or unflag a user
router.post('/:id/flag', hasRole('superAdmin'), async (req, res) => {
    try {
        const { flagged } = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            { flagged },  // Update the flagged field
            { new: true }  // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ status: updatedUser.flagged });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error flagging user', error: err.message });
    }
});

module.exports = router;
