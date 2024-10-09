const express = require('express');
const GroupModel = require('../models/group.model');
const router = express.Router();
const isAuthenticated = require('../middleware/auth.middleware');
const { hasRole, isGroupOwner, isGroupAdmin} = require('../middleware/role.middleware');
const {updateUser} = require("../models/user.model");
const UserModel = require("../models/user.model");

// Ensure that all routes are protected
router.use(isAuthenticated);

// Create a group
router.post('/', hasRole('groupAdmin'), async (req, res) => {
    try {
        const { name, acronym } = req.body;

        const newGroup = await GroupModel.create({
            name,
            acronym,
            owner: req.user._id,
            admins: [req.user._id],
            members: [],
            pendingMembers: [],
            banned: [],
            channels: [],
        });

        const group = await GroupModel.findById(newGroup._id).populate('members admins pendingMembers pendingAdmins banned channels.members');
        res.status(201).json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating group', error: err.message });
    }
});

// Update a group
router.put('/:id', isGroupOwner, async (req, res) => {
    try {
        const groupId = req.params.id;
        const groupUpdates = req.body;

        // Only allow updating name and acronym
        const allowedFields = ['name', 'acronym'];
        const updates = {};

        allowedFields.forEach(field => {
            if (groupUpdates[field] !== undefined) {
                updates[field] = groupUpdates[field];
            }
        });

        const updatedGroup = await GroupModel.findByIdAndUpdate(
            groupId,
            { $set: updates },
            { new: true } // return the updated group
        ).populate('members admins pendingMembers pendingAdmins banned channels.members');

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(updatedGroup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating group', error: err.message });
    }
});

// Get all groups
router.get('/list', async (req, res) => {
    try {
        const groups = await GroupModel.find({}).populate('members admins pendingMembers pendingAdmins banned channels.members');
        res.status(200).json(groups); // Groups are already populated by GroupModel
    } catch (err) {
        res.status(500).json({ message: 'Error fetching groups', error: err.message });
    }
});

// Get all users in a group
router.get('/:id/users', isGroupAdmin, async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id).populate('members admins pendingMembers pendingAdmins banned channels.members');
        res.status(200).json([...group.members, ...group.admins]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching group users.', error: err.message });
    }
})

// Get a single group by ID
router.get('/:id', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id).populate('members admins pendingMembers pendingAdmins banned channels.members');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching group', error: err.message });
    }
});

// Delete a group
router.delete('/:id', async (req, res) => {
    try {
        await GroupModel.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting group', error: err.message });
    }
});

// Create a channel within a group
router.post('/:id/channel', isGroupAdmin, async (req, res) => {
    try {
        const { name } = req.body;

        const group = await GroupModel.findByIdAndUpdate(
            req.params.id,
        { $push: { channels: { name, members: [req.user._id] }}},
            { new: true } // return updated document
        ).populate('members admins pendingMembers pendingAdmins banned channels.members');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error creating channel', error: err.message });
    }
});

// Delete a channel within a group
router.delete('/:id/:channelId', isGroupOwner, async (req, res) => {
    try {
        const updatedGroup = await GroupModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { channels: { _id: req.params.channelId } } },
            { new: true }
        ).populate('members admins pendingMembers pendingAdmins banned channels.members');

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(updatedGroup);
    } catch (err) {
        res.status(500).json({ message: 'Error deleting channel', error: err.message });
    }
});

// Add a user to a group
router.post('/:id/add-user', isGroupOwner, async (req, res) => {
    try {
        const { userId, channelId } = req.body;
        let filterQuery = { _id: req.params.id };
        let group

        if (channelId) {
            group = await GroupModel.findOneAndUpdate(
                { _id: req.params.id, 'channels._id': channelId }, // filter
                { $push: { 'channels.$[channel].members': userId } }, // update
                { new: true, arrayFilters: [{ 'channel._id': channelId }] }, // options
            );
        } else {
            group = await GroupModel.findOneAndUpdate(
                { _id: req.params.id }, // filter
                { $push: { members: userId }}, // update
                { new: true }, // options
            )
        }

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        await group.populate('members admins pendingMembers pendingAdmins banned channels.members');
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error adding user to group', error: err.message });
    }
});

// Request to join a group
router.post('/:id/join', async (req, res) => {
    try {
        const updatedGroup = await GroupModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { pendingMembers: req.user._id } }, // Only adds if not already present
            { new: true }
        ).populate('members admins pendingMembers pendingAdmins banned channels.members');

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ status: true });
    } catch (err) {
        res.status(500).json({ message: 'Error requesting to join group', error: err.message });
    }
});

// Accept or decline a user's join request
router.post('/:id/accept', isGroupOwner, async (req, res) => {
    try {
        const { userId, decision } = req.body;

        let updateQuery = {
            $pull: { pendingMembers: userId }  // Remove user from pending members
        };

        if (decision) {
            updateQuery.$push = { members: userId };  // Add user to members if accepted
        }

        const updatedGroup = await GroupModel.findByIdAndUpdate(
            req.params.id,
            updateQuery,
            { new: true }
        ).populate('members admins pendingMembers pendingAdmins banned channels.members');

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ status: decision });
    } catch (err) {
        res.status(500).json({ message: 'Error processing request', error: err.message });
    }
});

// Kick a user from a group
router.post('/:id/kick', isGroupOwner, async (req, res) => {
    try {
        const { userId, channelId } = req.body;

        let updateQuery = {};

        if (channelId) {
            // Remove user from specific channel's members
            updateQuery = {
                $pull: { 'channels.$.members': userId }
            };
        } else {
            // Remove user from both members and admins
            updateQuery = {
                $pull: {
                    members: userId,
                    admins: userId
                }
            };
        }

        const group = await GroupModel.findOneAndUpdate(
            { _id: req.params.id, ...(channelId && { 'channels._id': channelId }) },
            updateQuery,
            { new: true }
        ).populate('members admins pendingMembers pendingAdmins banned channels.members');

        if (!group) {
            return res.status(404).json({ message: 'Group or channel not found' });
        }

        res.status(200).json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error kicking user from group', error: err.message });
    }
});

router.post('/:id/ban', isGroupOwner, async (req, res) => {
    try {
        const { userId, decision } = req.body;

        let updateQuery = {};

        if (decision) { // ban
            updateQuery = {
                $addToSet: { banned: userId }, // Add user to banned list if not already present
                $pull: {
                    admins: userId,
                    members: userId,
                    pendingAdmins: userId,
                    pendingMembers: userId,
                    'channels.$[].members': userId  // Remove user from all channel members
                }
            };

            // Flag the user for superAdmins
            await UserModel.findByIdAndUpdate(userId, { flagged: true });
        } else { // unban
            updateQuery = {
                $pull: { banned: userId } // Remove user from banned list
            };
        }

        const updatedGroup = await GroupModel.findByIdAndUpdate(
            req.params.id,
            updateQuery,
            { new: true }
        ).populate('members admins pendingMembers pendingAdmins banned channels.members');

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(updatedGroup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error banning user from group', error: err.message });
    }
});


// Promote or demote a group admin
router.post('/:id/admin', isGroupOwner, async (req, res) => {
    try {
        const { userId, status } = req.body;

        let updateQuery = {};

        if (status) { // Promote to admin
            updateQuery = {
                $addToSet: { admins: userId }, // Add user to admins if not already present
                $pull: { members: userId }     // Remove from members
            };
        } else { // Demote from admin
            updateQuery = {
                $pull: { admins: userId },     // Remove user from admins
                $addToSet: { members: userId } // Add user to members if not already present
            };
        }

        const updatedGroup = await GroupModel.findByIdAndUpdate(
            req.params.id,
            updateQuery,
            { new: true }
        ).populate('members admins pendingMembers pendingAdmins banned channels.members');

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(updatedGroup);
    } catch (err) {
        res.status(500).json({ message: 'Error updating admin status', error: err.message });
    }
});

module.exports = router;
