const UserModel = require('../models/user.model');
const GroupModel = require('../models/group.model');

// Middleware to check if a user has a required role
function hasRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.sendStatus(404);
        }

        // Check if the user has the required role
        const hasRole = req.user.roles.includes(role);

        if (!hasRole) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next(); // Proceed to the next middleware or route handler
    };
}

// Middleware to check if the user is the group owner or super admin
const isGroupOwner = (req, res, next) => {
    try {
        const groupId = req.params.id;
        const group = GroupModel.getGroupById(groupId);

        // Check if the group exists
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        // Check if the user is either a super admin or the group owner (groupAdmin)
        const superAdmin = req.user.roles.includes('superAdmin');
        const groupOwner = req.user._id === group.owner._id;

        if (superAdmin || groupOwner) {
            req.group = group; // Attach the group to the request object
            return next();     // Proceed to the next middleware or route handler
        }

        return res.status(401).json({ message: 'You do not have permission to modify this group.' });
    } catch (err) {
        return res.status(500).json({ message: 'Error checking group ownership', error: err.message });
    }
};

// Middleware to check if the user is an admin of the provided group (or superAdmin)
const isGroupAdmin = (req, res, next) => {
    try {
        const groupId = req.params.id;
        const group = GroupModel.getGroupById(groupId);

        // Check if the group exists
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        // Check if the user is either a super admin or the group owner (groupAdmin)
        const superAdmin = req.user.roles.includes('superAdmin');
        const groupAdmin = req.user.roles.includes('groupAdmin') && group.admins.findIndex(admin => admin._id === req.user._id);
        const groupOwner = req.user._id === group.owner._id;

        console.log(superAdmin, groupAdmin, groupOwner);

        if (superAdmin || groupAdmin || groupOwner) {
            req.group = group; // Attach the group to the request object
            return next();     // Proceed to the next middleware or route handler
        }

        return res.status(401).json({ message: 'You do not have permission to modify this group.' });
    } catch (err) {
        return res.status(500).json({ message: 'Error checking group ownership', error: err.message });
    }
};

module.exports = { isGroupOwner, hasRole, isGroupAdmin };
