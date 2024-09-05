const {writeFileSync, readFileSync} = require("node:fs");

// Load data from JSON file
const loadData = (filePath) => {
    try {
        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return [];
    }
};

// Save data to JSON file
const saveData = (filePath, data) => {
    try {
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing data to file:', error);
    }
};

module.exports = { loadData, saveData };