"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const dataDir = path.join(__dirname, '..', 'data');
function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDirectory(filePath);
        }
        else if (file.endsWith('.json')) {
            removeUrlFromJsonFile(filePath);
        }
    }
}
function removeUrlFromJsonFile(filePath) {
    try {
        console.log(`Processing file: ${filePath}`);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const cleanedData = removeUrlAttributesRecursively(data);
        fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), 'utf8');
        console.log(`Processed file: ${filePath}`);
    }
    catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
}
function removeUrlAttributesRecursively(obj) {
    if (Array.isArray(obj)) {
        return obj.map((item) => removeUrlAttributesRecursively(item));
    }
    else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (key !== 'url' && key !== 'model_url') {
                newObj[key] = removeUrlAttributesRecursively(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}
console.log('Starting to remove URL attributes from JSON files in /data folder...');
processDirectory(dataDir);
console.log('Finished removing URL attributes.');
//# sourceMappingURL=remove-url-attributes.js.map