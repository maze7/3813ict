const express = require('express');
const UserModel = require('../models/user.model'); // Import the User model
const isAuthenticated = require('../middleware/auth.middleware');
const { hasRole } = require("../middleware/role.middleware");

const router = express.Router();
router.use(isAuthenticated);

// List users
router.get('/list', hasRole('superAdmin'), (req, res) => {
    try {
        const users = UserModel.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error getting users.', error: err.message });
    }
});

// Delete user
router.delete('/:id', hasRole('superAdmin'), (req, res) => {
    try {
        UserModel.deleteUser(req.params.id);
        res.status(200).json({ message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user.', error: err.message });
    }
});

router.put('/:id', hasRole('superAdmin'), (req, res) => {
    try {
        const { user } = req.body;

        UserModel.updateUser(user);
        res.status(200).json( { message: 'User updated.' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user.', error: err.message });
    }
})

// Ban or unban a user
router.post('/:id/ban', hasRole('superAdmin'), (req, res) => {
    try {
        const { banned } = req.body;
        const user = UserModel.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.banned = banned;
        user.flagged = false;
        UserModel.updateUser(user);

        return res.status(200).json({ status: banned });
    } catch (err) {
        res.status(500).json({ message: 'Error banning user', error: err.message });
    }
});

// Flag or unflag a user
router.post('/:id/flag', hasRole('superAdmin'), (req, res) => {
    try {
        const { flagged } = req.body;
        const user = UserModel.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.flagged = flagged;
        UserModel.updateUser(user);

        return res.status(200).json({ status: flagged });
    } catch (err) {
        res.status(500).json({ message: 'Error flagging user', error: err.message });
    }
});

module.exports = router;
