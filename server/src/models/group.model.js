const path = require('path');
const { loadData, saveData } = require("../util/db");
const UserModel = require('../models/user.model'); // Use UserModel directly
const groupDataPath = path.join(__dirname, '../../data/groups.json');

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
        return group;
    },

    depopulate: (group) => {
        const isObject = (item) => typeof item === 'object' && item !== null;

        group.creator = isObject(group.creator) ? group.creator._id : group.creator;
        group.members = group.members.map(user => isObject(user) ? user._id : user);
        group.admins = group.admins.map(user => isObject(user) ? user._id : user);
        group.pendingMembers = group.pendingMembers.map(user => isObject(user) ? user._id : user);
        group.banned = group.banned.map(user => isObject(user) ? user._id : user);
        group.channels.forEach(channel => {
            channel.members = channel.members.map(user => isObject(user) ? user._id : user);
        });
        return group;
    }
};

module.exports = GroupModel;
