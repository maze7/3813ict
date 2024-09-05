const express = require('express');
const UserModel = require('../models/user.model'); // Import the User model
const isAuthenticated = require('../middleware/auth.middleware');
const {hasRole} = require("../middleware/role.middleware");

const router = express.Router();
router.use(isAuthenticated);

// List users
router.get('/list', hasRole('superAdmin'), async (req, res) => {
    try {
        const users = await UserModel.find({});

        res.status(201).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error getting users.', error: err.message });
    }
});

// delete user
router.delete('/:id', hasRole('superAdmin'), async (req, res) => {
    try {
        await UserModel.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Error getting users.', error: err.message });
    }
});

// ban or unban a user
router.post('/:id/ban', hasRole('superAdmin'), async (req, res) => {
    try {
        const { banned } = req.body;
        const user= await UserModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.banned = banned;
        await user.save();

        return res.status(200).json({ status: banned });
    } catch (err) {
        res.status(500).json({ message: 'Error banning user', error: err.message });
    }
});

// flag or unflag a user
router.post('/:id/flag', hasRole('superAdmin'), async (req, res) => {
    try {
        const { flagged } = req.body;
        const user= await UserModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.flagged = flagged;
        await user.save();

        return res.status(200).json({ status: flagged });
    } catch (err) {
        res.status(500).json({ message: 'Error flagging user', error: err.message });
    }
});

module.exports = router;
