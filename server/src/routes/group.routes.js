const express = require('express');
const GroupModel = require('../models/group.model');
const router = express.Router();
const isAuthenticated = require('../middleware/auth.middleware');
const UserModel = require('../models/user.model');

router.use(isAuthenticated);

// Helper function to manually populate user references
const populateGroup = (group) => {
    const users = UserModel.getAllUsers();
    group.members = group.members.map(userId => users.find(user => user._id === userId));
    group.admins = group.admins.map(userId => users.find(user => user._id === userId));
    group.pendingMembers = group.pendingMembers.map(userId => users.find(user => user._id === userId));
    group.banned = group.banned.map(userId => users.find(user => user._id === userId));
    group.channels.forEach(channel => {
        channel.members = channel.members.map(userId => users.find(user => user._id === userId));
    });
    return group;
};

// Create a group
router.post('/', (req, res) => {
    try {
        const { name, acronym } = req.body;

        console.log(req.user);

        const newGroup = {
            _id: Date.now().toString(),
            name,
            acronym,
            creator: req.user._id,
            admins: [req.user._id],
            members: [],
            pendingMembers: [],
            pendingAdmins: [],
            banned: [],
            channels: [],
        };

        GroupModel.createGroup(newGroup);

        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({ message: 'Error creating group', error: err.message });
    }
});

// Update a group
router.put('/:id', (req, res) => {
    try {
        const groupId = req.params.id;
        const groupUpdates = req.body;

        const group = GroupModel.getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isAdmin = group.admins.includes(req.user._id);

        if (!isAdmin) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        const allowedFields = ['name', 'acronym'];
        allowedFields.forEach(field => {
            if (groupUpdates[field] !== undefined) {
                group[field] = groupUpdates[field];
            }
        });

        GroupModel.updateGroup(group);

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error updating group', error: err.message });
    }
});

// Get all groups
router.get('/', (req, res) => {
    try {
        const groups = GroupModel.getAllGroups().map(g => populateGroup(g));

        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching groups', error: err.message });
    }
});

// Get a single group by ID
router.get('/:id', (req, res) => {
    try {
        const group = populateGroup(GroupModel.getGroupById(req.params.id));

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching group', error: err.message });
    }
});

// Delete a group by ID
router.delete('/:id', (req, res) => {
    try {
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        GroupModel.deleteGroup(group._id);
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting group', error: err.message });
    }
});

// Create a channel within a group
router.post('/:id/channel', (req, res) => {
    try {
        const { name } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.channels.push({ _id: Date.now().toString(), name, members: [req.user._id] });
        GroupModel.updateGroup(group);

        res.status(200).json(populateGroup(group));
    } catch (err) {
        res.status(500).json({ message: 'Error creating channel', error: err.message });
    }
});

// Delete a channel within a group
router.delete('/:id/:channelId', (req, res) => {
    try {
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.channels = group.channels.filter(channel => channel._id !== req.params.channelId);
        GroupModel.updateGroup(group);

        res.status(200).json(populateGroup(group));
    } catch (err) {
        res.status(500).json({ message: 'Error deleting channel', error: err.message });
    }
});

// Add a user to the group or channel
router.post('/:id/add-user', (req, res) => {
    try {
        const { channelId, userId } = req.body;
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

        res.status(200).json(populateGroup(group));
    } catch (err) {
        res.status(500).json({ message: 'Error adding user to group', error: err.message });
    }
});

// Handle join request
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
router.post('/:id/accept', (req, res) => {
    try {
        const { userId, decision } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.pendingMembers = group.pendingMembers.filter(id => id !== userId);
        if (decision) {
            group.members.push(userId);
        }

        GroupModel.updateGroup(populateGroup(group));

        res.status(200).json({ status: decision });
    } catch (err) {
        res.status(500).json({ message: 'Error processing join request', error: err.message });
    }
});

// Kick a user from the group
router.post('/:id/kick', (req, res) => {
    try {
        const { channelId, userId, ban } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.members = group.members.filter(id => id !== userId);
        group.admins = group.admins.filter(id => id !== userId);
        group.pendingMembers = group.pendingMembers.filter(id => id !== userId);

        if (channelId) {
            const channel = group.channels.find(c => c._id === channelId);
            if (channel) {
                channel.members = channel.members.filter(id => id !== userId);
            }
        }

        if (ban) {
            group.banned.push(userId);
            UserModel.updateUser({ _id: userId, flagged: true });
        }

        GroupModel.updateGroup(group);

        res.status(200).json(populateGroup(group));
    } catch (err) {
        res.status(500).json({ message: 'Error kicking user from group', error: err.message });
    }
});

// Promote or demote a group admin
router.post('/:id/admin', (req, res) => {
    try {
        const { userId, status } = req.body;
        const group = GroupModel.getGroupById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (status) {
            group.members = group.members.filter(id => id !== userId);
            group.admins.push(userId);
        } else {
            group.admins = group.admins.filter(id => id !== userId);
            group.members.push(userId);
        }

        GroupModel.updateGroup(populateGroup(group));

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error promoting/demoting admin', error: err.message });
    }
});

module.exports = router;
