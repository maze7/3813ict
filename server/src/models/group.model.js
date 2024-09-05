const fs = require('fs');
const path = require('path');

// File path for group data
const groupDataPath = path.join(__dirname, '../../data/groups.json');

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

const depopulate = (group) => {
    const isObject = (item) => typeof item === 'object' && item !== null;

    // Helper function to remove duplicates
    const removeDuplicates = (array) => [...new Set(array)];

    group.members = removeDuplicates(group.members.map(user => isObject(user) ? user._id : user));
    group.admins = removeDuplicates(group.admins.map(user => isObject(user) ? user._id : user));
    group.pendingMembers = removeDuplicates(group.pendingMembers.map(user => isObject(user) ? user._id : user));
    group.banned = removeDuplicates(group.banned.map(user => isObject(user) ? user._id : user));

    group.channels.forEach(channel => {
        channel.members = removeDuplicates(channel.members.map(user => isObject(user) ? user._id : user));
    });

    return group;
};

// Save data to JSON file
const saveData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data.map(g => depopulate(g)), null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing data to file:', error);
    }
};

// Group operations
const GroupModel = {
    getAllGroups: () => {
        return loadData(groupDataPath);
    },

    getGroupById: (groupId) => {
        const groups = loadData(groupDataPath);
        return groups.find(group => group._id === groupId);
    },

    createGroup: (newGroup) => {
        const groups = loadData(groupDataPath);
        groups.push(newGroup);
        saveData(groupDataPath, groups);
        return newGroup;
    },

    updateGroup: (updatedGroup) => {
        const groups = loadData(groupDataPath);
        const groupIndex = groups.findIndex(group => group._id === updatedGroup._id);
        if (groupIndex !== -1) {
            groups[groupIndex] = updatedGroup;
            saveData(groupDataPath, groups);
        }
    },

    deleteGroup: (groupId) => {
        const groups = loadData(groupDataPath);
        const updatedGroups = groups.filter(group => group._id !== groupId);
        saveData(groupDataPath, updatedGroups);
    }
};

module.exports = GroupModel;
