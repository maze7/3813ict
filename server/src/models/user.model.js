const path = require('path');
const {loadData, saveData} = require("../util/db");

// File path for user data
const userDataPath = path.join(__dirname, '../../data/users.json');

// User operations
const UserModel = {
    getAllUsers: () => {
        return loadData(userDataPath);
    },

    getUserById: (userId) => {
        const users = loadData(userDataPath);
        return users.find(user => user._id === userId);
    },

    createUser: (newUser) => {
        const users = loadData(userDataPath);

        users.push(newUser);
        saveData(userDataPath, users);
        return newUser;
    },

    updateUser: (updatedUser) => {
        const users = loadData(userDataPath);
        const userIndex = users.findIndex(user => user._id === updatedUser._id);

        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            saveData(userDataPath, users);
        }
    },

    deleteUser: (userId) => {
        const users = loadData(userDataPath);
        const updatedUsers = users.filter(user => user._id !== userId);
        saveData(userDataPath, updatedUsers);
    },
};

module.exports = UserModel;
