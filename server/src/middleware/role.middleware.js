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
const isGroupOwner = async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const group = await GroupModel.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        const superAdmin = req.user.roles.includes('superAdmin');
        const ownerId = group.owner?._id ? group.owner._id : group.owner;
        const groupOwner = req.user._id === ownerId;

        if (superAdmin || groupOwner) {
            req.group = group;
            return next();
        }

        return res.status(401).json({ message: 'You do not have permission to modify this group.' });
    } catch (err) {
        console.err(err);
        return res.status(500).json({ message: 'Error checking group ownership', error: err.message });
    }
};

// Middleware to check if the user is an admin of the provided group (or superAdmin)
const isGroupAdmin = async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const group = await GroupModel.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        const superAdmin = req.user.roles.includes('superAdmin');

        // Extract ownerId
        const ownerId = group.owner?._id ? group.owner._id.toString() : group.owner.toString();
        const groupOwner = req.user._id.toString() === ownerId;

        // Check if the user is a group admin
        const isAdmin = group.admins.some(admin => {
            const adminId = admin?._id ? admin._id.toString() : admin.toString();
            return adminId === req.user._id.toString();
        });

        if (superAdmin || isAdmin || groupOwner) {
            req.group = group;
            return next();
        }

        return res.status(401).json({ message: 'You do not have permission to modify this group.' });
    } catch (err) {
        console.error(`Error in isGroupAdmin middleware: ${err}`);
        return res.status(500).json({ message: 'Error checking group admin status', error: err.message });
    }
};
module.exports = { isGroupOwner, hasRole, isGroupAdmin };
