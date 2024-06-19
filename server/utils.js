const fs = require('fs');

const loadJSON = (filePath) => {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const saveJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = { loadJSON, saveJSON };
