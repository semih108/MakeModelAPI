/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, '..', 'data');

// Function to recursively process all JSON files in a directory
function processDirectory(directory: string) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(filePath);
    } else if (file.endsWith('.json')) {
      // Process JSON files
      removeUrlFromJsonFile(filePath);
    }
  }
}

// Function to remove 'url' attributes from a JSON file
function removeUrlFromJsonFile(filePath: string) {
  try {
    console.log(`Processing file: ${filePath}`);

    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse JSON
    const data = JSON.parse(content);

    // Remove url attributes recursively
    const cleanedData = removeUrlAttributesRecursively(data);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), 'utf8');

    console.log(`Processed file: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Function to recursively remove 'url' attributes from an object
function removeUrlAttributesRecursively(obj: any): any {
  if (Array.isArray(obj)) {
    // If it's an array, process each element
    return obj.map((item) => removeUrlAttributesRecursively(item));
  } else if (obj !== null && typeof obj === 'object') {
    // If it's an object, process each property
    const newObj: any = {};

    for (const key in obj) {
      // Skip 'url' attributes
      if (key !== 'url' && key !== 'model_url') {
        newObj[key] = removeUrlAttributesRecursively(obj[key]);
      }
    }

    return newObj;
  }

  // Return primitive values as is
  return obj;
}

// Start processing
console.log(
  'Starting to remove URL attributes from JSON files in /data folder...',
);
processDirectory(dataDir);
console.log('Finished removing URL attributes.');
