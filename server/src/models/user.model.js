const fs = require('fs');
const path = require('path');

// File path for user data
const userDataPath = path.join(__dirname, '../../data/users.json');

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

// Save data to JSON file
const saveData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing data to file:', error);
    }
};

// User operations
const UserModel = {
    getAllUsers: () => {
        return loadData(userDataPath);
    },

    getUserById: (userId) => {
        const users = loadData(userDataPath);
        return users.find((user) => user._id === userId);
    },

    createUser: (newUser) => {
        const users = loadData(userDataPath);
        users.push(newUser);
        saveData(userDataPath, users);
        return newUser;
    },

    updateUser: (updatedUser) => {
        const users = loadData(userDataPath);
        const userIndex = users.findIndex((user) => user._id === updatedUser._id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            saveData(userDataPath, users);
        }
    },

    deleteUser: (userId) => {
        const users = loadData(userDataPath);
        const updatedUsers = users.filter((user) => user._id !== userId);
        saveData(userDataPath, updatedUsers);
    },
};

module.exports = UserModel;
