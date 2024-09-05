const fs = require('fs');
const path = require('path');
const groupDataPath = path.join(__dirname, '../data/groups.json');

// Load data from JSON file
const loadData = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return [];
    }
};

// Helper function to fetch group by ID
const getGroupById = (groupId) => {
    const groups = loadData(groupDataPath);
    return groups.find(group => group._id === groupId);
};

// Middleware to check if a user has a required role
function hasRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.sendStatus(404);
        }

        // check if the user has the required role
        const hasRole = req.user.roles.includes(role);

        if (!hasRole) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next(); // proceed to the next middleware or route handler
    };
}

// Middleware to check if the user is the group owner or super admin
const isGroupOwner = (req, res, next) => {
    try {
        const groupId = req.params.id;
        const group = getGroupById(groupId);

        // Check if the group exists
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        // Check if the user is either a super admin or the group owner (groupAdmin)
        const isSuperAdmin = req.user.roles.includes('superAdmin');
        const isGroupOwner = req.user.roles.includes('groupAdmin') && req.user._id === group.owner;

        if (isSuperAdmin || isGroupOwner) {
            req.group = group; // Attach the group to the request object
            return next();     // Proceed to the next middleware or route handler
        }

        return res.status(401).json({ message: 'You do not have permission to modify this group.' });
    } catch (err) {
        return res.status(500).json({ message: 'Error checking group ownership', error: err.message });
    }
};

module.exports = { isGroupOwner, hasRole };
