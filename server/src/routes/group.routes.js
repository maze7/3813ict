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
});

// request to join a group
router.post('/join/:id', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id).populate({
            path: 'members admins pendingAdmins pendingMembers channels.members',
            select: '-password',
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // if the user isn't already in the pending members, add them
        if (group.pendingMembers.findIndex(u => u._id === req.user._id) === -1) {
            group.pendingMembers.push(req.user._id);
            await group.save();
            res.status(200).json({ status: true });
        } else {
            // if the user was already pending, we succeed the request but mark status to false
            res.status(200).json({ status: false });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error requesting to join group.', error: err.message });
    }
});


// kick a user from a group
router.post('/kick', async (req, res) => {
    try {
        const { groupId, channelId, userId, ban } = req.body;

        const query = { _id: groupId };
        const update = {
            $pull: {
                'channels.members': userId,
                'admins': userId,
                'members': userId,
                'pendingAdmins': userId,
                'pendingMembers': userId,
            }
        };

        if (ban) {
            update.$push = { banned: userId };
        } else if (channelId) {
            query['channels._id'] = channelId;
            update.$pull = { 'channels.$.members': userId }
        }

        // perform the DB update
        await GroupModel.updateOne(query, update);

        // get updated group to return to client
        const group = await GroupModel.findById(groupId).populate({
            path: 'members admins pendingAdmins pendingMembers channels.members',
            select: '-password',
        });

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error kicking user from group.', error: err.message });
    }
})

module.exports = router;
