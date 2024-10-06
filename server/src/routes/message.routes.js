const express = require('express');
const UserModel = require('../models/user.model'); // Mongoose User model
const isAuthenticated = require('../middleware/auth.middleware');
const MessageModel = require("../models/message.model");

const router = express.Router();
router.use(isAuthenticated);

// List messages for a specific channel
router.get('/:groupId/:channelId', async (req, res) => {
    try {
        const messages = await MessageModel.find({
            group: req.params.groupId,
            channel: req.params.channelId,
        }).populate('group user').sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error getting messages', error: err.message });
    }
});

module.exports = router;
