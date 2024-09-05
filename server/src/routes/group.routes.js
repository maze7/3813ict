const express = require('express');
const GroupModel = require('../models/group.model');
const router = express.Router();
const isAuthenticated = require('../middleware/auth.middleware');
const UserModel = require("../models/user.model");

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
        const populated = await GroupModel.findById(group._id).populate(
            'members admins banned pendingAdmins pendingMembers channels.members',
        );

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Error creating group', error: err.message });
    }
});

// TODO: Add isGroupAdmin or isSuperAdmin middleware
router.put('/:id', async (req, res) => {
    try {
        const groupId = req.params.id;
        const groupUpdates = req.body; // The entire group model from the request body

        // Check if the group exists
        const group = await GroupModel.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the user is an admin or super admin (assuming req.user is populated by middleware)
        const isAdmin = group.admins.includes(req.user._id.toString());

        if (!isAdmin) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        // Only allow certain fields to be updated
        const allowedFields = ['name', 'acronym'];
        allowedFields.forEach(field => {
            if (groupUpdates[field] !== undefined) {
                group[field] = groupUpdates[field];
            }
        });

        // Save the updated group
        await group.save();

        const updatedGroup = await GroupModel.findById(group._id).populate(
            'members admins banned pendingAdmins pendingMembers channels.members'
        );

        res.status(200).json(updatedGroup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating group', error: err.message });
    }
});


// get all groups (list)
router.get('/', async (req, res) => {
    try {
        const groups = await GroupModel.find({}).populate(
            'members admins banned pendingAdmins pendingMembers channels.members',
        );

        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching groups', error: err.message });
    }
});

// get a single group by ID
router.get('/:id', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id).populate(
            'members admins banned pendingAdmins pendingMembers channels.members',
        );

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
router.post('/:id/channel', async (req, res) => {
    try {
        const { name } = req.body;
        const groupId = req.params.id;

        // add the channel to the document
        await GroupModel.updateOne({ _id: groupId }, { $push: { channels: { name, members: [req.user._id] }}});

        // get the updated group and return
        const group = await GroupModel.findById(groupId).populate(
            'members admins banned pendingAdmins pendingMembers channels.members',
        );

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error creating channel.', error: err.message });
    }
});

// TODO: add isGroupOwner Guard
router.post('/:id/add-user', async (req, res) => {
    try {
        const { channelId, userId } = req.body;

        // If channelId is provided, update the specific channel's members
        if (channelId) {
            await GroupModel.updateOne(
                { _id: req.params.id, 'channels._id': channelId },
                { $addToSet: {
                    'channels.$.members': userId,
                    members: userId,
                }}
            );
        } else {
            // If no channelId, add the user to the group members array only
            await GroupModel.findByIdAndUpdate(req.params.id, { $addToSet: { members: userId } });
        }

        // get the updated group
        const group = await GroupModel.findById(req.params.id).populate(
            'members admins banned pendingAdmins pendingMembers channels.members',
        );

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error adding user to group.' });
    }
})

// request to join a group
router.post('/:id/join', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id).populate(
            'members admins banned pendingAdmins pendingMembers channels.members',
        );

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

// accept or decline a user's join request
router.post('/:id/accept', async (req, res) => {
    try {
        const { userId, decision } = req.body;
        const query = { _id: req.params.id };
        const update = { $pull: { pendingMembers: userId }};

        if (decision) {
            update.$addToSet = { members: userId };
        }

        await GroupModel.updateOne(query, update);
        return res.status(200).json({ status: decision });
    } catch (err) {
        res.status(500).json({ message: 'Error requesting to join group.', error: err.message });
    }
});

// kick a user from a group
router.post('/:id/kick', async (req, res) => {
    try {
        const { channelId, userId, ban } = req.body;
        const groupId = req.params.id;

        const query = { _id: groupId };
        const update = {
            $pull: {
                'channels.$[].members': userId,
                'admins': userId,
                'members': userId,
                'pendingAdmins': userId,
                'pendingMembers': userId,
                'banned': userId,
            }
        };

        if (ban) {
            update.$push = { banned: userId };
            update.$pull['banned'] = undefined;

            // flag the user for the superAdmin
            await UserModel.findByIdAndUpdate(userId, { flagged: true });
        } else if (channelId) {
            query['channels._id'] = channelId;
            update.$pull = { 'channels.$.members': userId }
        }

        // perform the DB update
        await GroupModel.updateOne(query, update);

        // get updated group to return to client
        const group = await GroupModel.findById(groupId).populate(
            'members admins banned pendingAdmins pendingMembers channels.members',
        );

        res.status(200).json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error kicking user from group.', error: err.message });
    }
})

// promote / demote a group admin
router.post('/:id/admin', async (req, res) => {
    try {
        const { userId, status } = req.body;
        const groupId = req.params.id;

        if (status) { // set user to admin
            await GroupModel.findByIdAndUpdate(groupId, {
                $pull: { 'members': userId },
                $addToSet: { 'admins': userId },
            });
        } else {
            await GroupModel.findByIdAndUpdate(groupId, {
                $pull: { 'admins': userId },
                $addToSet: { 'members': userId },
            });
        }

        // get updated group to return to client
        const group = await GroupModel.findById(groupId).populate(
            'members admins banned pendingAdmins pendingMembers channels.members',
        );

        res.status(200).json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error kicking user from group.', error: err.message });
    }
})

module.exports = router;
