const path = require('path');
const { loadData, saveData } = require("../util/db");
const UserModel = require('../models/user.model'); // Use UserModel directly
const groupDataPath = path.join(__dirname, '../../data/groups.json');

// Group operations
const GroupModel = {
    getAllGroups: () => {
        return loadData(groupDataPath).map(g => GroupModel.populate(g));
    },

    getGroupById: (groupId) => {
        const groups = loadData(groupDataPath);
        return GroupModel.populate(groups.find(group => group._id === groupId));
    },

    createGroup: (newGroup) => {
        const groups = loadData(groupDataPath);
        groups.push(GroupModel.depopulate(newGroup));
        saveData(groupDataPath, groups);
        return newGroup;
    },

    updateGroup: (updatedGroup) => {
        const groups = loadData(groupDataPath);
        const groupIndex = groups.findIndex(group => group._id === updatedGroup._id);
        if (groupIndex !== -1) {
            groups[groupIndex] = GroupModel.depopulate(updatedGroup);
            saveData(groupDataPath, groups);
        }
    },

    deleteGroup: (groupId) => {
        const groups = loadData(groupDataPath);
        const updatedGroups = groups.filter(group => group._id !== groupId);
        saveData(groupDataPath, updatedGroups);
    },

    populate: (group) => {
        group.creator = UserModel.getUserById(group.creator);
        group.members = group.members.map(userId => UserModel.getUserById(userId));
        group.admins = group.admins.map(userId => UserModel.getUserById(userId));
        group.pendingMembers = group.pendingMembers.map(userId => UserModel.getUserById(userId));
        group.banned = group.banned.map(userId => UserModel.getUserById(userId));
        group.channels.forEach(channel => {
            channel.members = channel.members.map(userId => UserModel.getUserById(userId));
        });
        group.owner = UserModel.getUserById(group.owner);
        return group;
    },

    depopulate: (group) => {
        const isObject = (item) => typeof item === 'object' && item !== null;

        // Helper function to depopulate and remove duplicates using a Set
        const depopulateArray = (arr) => {
            return Array.from(new Set(arr.map(user => isObject(user) ? user._id : user)));
        };

        group.creator = isObject(group.creator) ? group.creator._id : group.creator;
        group.members = depopulateArray(group.members);
        group.admins = depopulateArray(group.admins);
        group.pendingMembers = depopulateArray(group.pendingMembers);
        group.banned = depopulateArray(group.banned);
        group.owner = isObject(group.owner) ? group.owner._id : group.owner;

        group.channels.forEach(channel => {
            channel.members = depopulateArray(channel.members);
        });

        return group;
    }
};

module.exports = GroupModel;
