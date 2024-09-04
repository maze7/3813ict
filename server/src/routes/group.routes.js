const express = require('express');
const GroupModel = require('../models/group.model');
const router = express.Router();
const isAuthenticated = require('../middleware/auth.middleware');

router.use(isAuthenticated);

// TODO: Add isGroupAdmin or isSuperAdmin middleware
router.post('/', async (req, res) => {
    try {
        const { name, acronym } = req.body;
        const group = new GroupModel({
            name,
            acronym,
            owner: req.user._id,
            admins: [req.user._id],
        })

        await group.save();

        // populate the reference fields
        const populated = await GroupModel.findById(group._id).populate({
            path: 'members admins pendingAdmins pendingMembers channels.members',
            select: '-password',
        });

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Error creating group', error: err.message });
    }
});

// get all groups (list)
router.get('/', async (req, res) => {
    try {
        const groups = await GroupModel.find({}).populate({
            path: 'members admins pendingAdmins pendingMembers channels.members',
            select: '-password',
        });

        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching groups', error: err.message });
    }
});

// get a single group by ID
router.get('/:id', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id).populate({
            path: 'members admins pendingAdmins pendingMembers channels.members',
            select: '-password',
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching group', error: err.message });
    }
});

// delete a group by ID
router.delete('/:id', async (req, res) => {
    try {
        const group = await GroupModel.findByIdAndDelete(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting group', error: err.message });
    }
});

// request access to a group
router.post('/request-accesss/:id', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id).populate({
            path: 'members admins pendingAdmins pendingMembers channels.members',
            select: '-password',
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200);
    } catch (err) {
        res.status(500).json({ message: 'Error requesting to join group.', error: err.message });
    }
});

// create a channel within a group
router.post('/channel', async (req, res) => {
    try {
        const { groupId, name } = req.body;

        // add the channel to the document
        await GroupModel.updateOne({ _id: groupId }, { $push: { channels: { name, members: [req.user._id] }}});

        // get the updated group and return
        const group = await GroupModel.findById(groupId).populate({
            path: 'members admins pendingAdmins pendingMembers channels.members',
            select: '-password',
        });

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error creating channel.', error: err.message });
    }
})

// kick a user from a group channel
router.post('/channel-kick', async (req, res) => {
    try {
        const { groupId, channelId, userId } = req.body;

        console.log(groupId, channelId, userId);

        await GroupModel.updateOne({ _id: groupId, 'channels._id': channelId }, {
            $pull: { 'channels.$.members': userId }
        });

        res.status(200).json({ message: 'User kicked from the channel.' });
    } catch (err) {
        res.status(500).json({ message: 'Error kicking user from channel.', error: err.message });
    }
})

module.exports = router;
