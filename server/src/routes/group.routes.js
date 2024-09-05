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
router.post('/', hasRole('groupAdmin'), (req, res) => {
    try {
        const { name, acronym } = req.body;
        const newGroup = {
            _id: Date.now().toString(),
            name,
            acronym,
            owner: req.user._id,
            admins: [req.user._id],
            members: [req.user._id],
            pendingMembers: [],
            banned: [],
            channels: [],
        };

        GroupModel.createGroup(newGroup);
        res.status(201).json(GroupModel.getGroupById(newGroup._id));
    } catch (err) {
        res.status(500).json({ message: 'Error creating group', error: err.message });
    }
});

// Update a group
router.put('/:id', isGroupOwner, (req, res) => {
    try {
        const groupId = req.params.id;
        const groupUpdates = req.body;

        let group = GroupModel.getGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Only allow updating name and acronym
        const allowedFields = ['name', 'acronym'];
        allowedFields.forEach(field => {
            if (groupUpdates[field] !== undefined) {
                group[field] = groupUpdates[field];
            }
        });

        GroupModel.updateGroup(group);
        res.status(200).json(GroupModel.getGroupById(groupId));
    } catch (err) {
        res.status(500).json({ message: 'Error updating group', error: err.message });
    }
});

// Get all groups
router.get('/list', (req, res) => {
    try {
        const groups = GroupModel.getAllGroups();
        res.status(200).json(groups); // Groups are already populated by GroupModel
    } catch (err) {
        res.status(500).json({ message: 'Error fetching groups', error: err.message });
    }
});

// Get all users in a group
router.get('/:id/users', isGroupAdmin, (req, res) => {
    try {
        const group = GroupModel.getGroupById(req.params.id);
        res.status(200).json([...group.members, ...group.admins]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching group users.', error: err.message });
    }
})

// Get a single group by ID
router.get('/:id', (req, res) => {
    try {
        const group = GroupModel.getGroupById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching group', error: err.message });
    }
});

// Delete a group
router.delete('/:id', isGroupOwner, (req, res) => {
    try {
        GroupModel.deleteGroup(req.params.id);
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting group', error: err.message });
    }
});

// Create a channel within a group
router.post('/:id/channel', isGroupOwner, (req, res) => {
    try {
        const { name } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.channels.push({ _id: Date.now().toString(), name, members: [req.user._id] });
        GroupModel.updateGroup(group);

        res.status(200).json(GroupModel.getGroupById(req.params.id));
    } catch (err) {
        res.status(500).json({ message: 'Error creating channel', error: err.message });
    }
});

// Delete a channel within a group
router.delete('/:id/:channelId', isGroupOwner, (req, res) => {
    try {
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.channels = group.channels.filter(channel => channel._id !== req.params.channelId);
        GroupModel.updateGroup(group);

        res.status(200).json(GroupModel.getGroupById(req.params.id));
    } catch (err) {
        res.status(500).json({ message: 'Error deleting channel', error: err.message });
    }
});

// Add a user to a group
router.post('/:id/add-user', isGroupOwner, (req, res) => {
    try {
        const { userId, channelId } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (channelId) {
            const channel = group.channels.find(c => c._id === channelId);
            if (channel) {
                channel.members.push(userId);
            }
        } else {
            group.members.push(userId);
        }

        GroupModel.updateGroup(group);
        res.status(200).json(GroupModel.getGroupById(req.params.id));
    } catch (err) {
        res.status(500).json({ message: 'Error adding user to group', error: err.message });
    }
});

// Request to join a group
router.post('/:id/join', (req, res) => {
    try {
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.pendingMembers.includes(req.user._id)) {
            group.pendingMembers.push(req.user._id);
            GroupModel.updateGroup(group);
            return res.status(200).json({ status: true });
        } else {
            return res.status(200).json({ status: false });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error requesting to join group', error: err.message });
    }
});

// Accept or decline a user's join request
router.post('/:id/accept', isGroupOwner, (req, res) => {
    try {
        const { userId, decision } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.pendingMembers = group.pendingMembers.filter(u => u._id !== userId);
        if (decision) {
            group.members.push(userId);
        }

        GroupModel.updateGroup(group);
        res.status(200).json({ status: decision });
    } catch (err) {
        res.status(500).json({ message: 'Error processing request', error: err.message });
    }
});

// Kick a user from a group
router.post('/:id/kick', isGroupOwner, (req, res) => {
    try {
        const { userId, channelId } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (channelId) {
            const channel = group.channels.find(c => c._id === channelId);
            if (channel) {
                channel.members = channel.members.filter(u => u._id !== userId);
            }
        } else {
            group.members = group.members.filter(u => u._id !== userId);
            group.admins = group.admins.filter(u => u._id !== userId);
        }

        GroupModel.updateGroup(group);
        res.status(200).json(GroupModel.getGroupById(req.params.id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error kicking user from group', error: err.message });
    }
});

router.post('/:id/ban', isGroupOwner, (req, res) => {
    try {
        const { userId, decision } = req.body;

        const group = GroupModel.getGroupById(req.params.id)
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (decision) { // ban
            // add the user to the ban list
            if (!group.banned.includes(userId)) {
                group.banned.push(userId);
            }

            // remove the user from membership arrays
            group.admins = group.admins.filter(u => u._id !== userId);
            group.members = group.members.filter(u => u._id !== userId);

            // remove the user from all channels
            for (const channel of group.channels) {
                channel.members = channel.members.filter(m => m._id !== userId);
            }

            // flag the user for superAdmins
            const user = UserModel.getUserById(userId);
            user.flagged = true;
            UserModel.updateUser(user);
        } else { // unban
            group.banned = group.banned.filter(u => u._id !== userId);
        }

        GroupModel.updateGroup(group);
        res.status(200).json(GroupModel.getGroupById(req.params.id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error banning user from group', error: err.message });
    }
})

// Promote or demote a group admin
router.post('/:id/admin', isGroupOwner, (req, res) => {
    try {
        const { userId, status } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (status) {
            group.admins.push(userId);
            group.members = group.members.filter(u => u._id !== userId);
        } else {
            group.admins = group.admins.filter(u => u._id !== userId);
            group.members.push(userId);
        }

        GroupModel.updateGroup(group);
        res.status(200).json(GroupModel.getGroupById(req.params.id));
    } catch (err) {
        res.status(500).json({ message: 'Error updating admin status', error: err.message });
    }
});

module.exports = router;
