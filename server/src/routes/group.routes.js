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
            acronym
        });

        await group.save();
        res.status(201).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error creating group', error: err.message });
    }
});

// get all groups
router.get('/', async (req, res) => {
    try {
        const groups = await GroupModel.find().populate('members admins pendingAdmins pendingMembers');
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching groups', error: err.message });
    }
});

// READ a single group by ID
router.get('/:id', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id).populate('members admins pendingAdmins pendingMembers');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching group', error: err.message });
    }
});

// DELETE a group by ID
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
        const group = await GroupModel.findById(req.params.id).populate('members', 'pendingMembers');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200);
    } catch (err) {
        res.status(500).json({ message: 'Error requesting to join group.', error: err.message });
    }
});

module.exports = router;
