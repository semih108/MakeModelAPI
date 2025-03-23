const fs = require('fs');
const path = require('path');

// Field name mappings
const fieldMappings = {
  'Beginn Jahr der Produktion': 'Erstzulassung Anfang',
  'Ende Jahr der Produktion': 'Erstzulassung Ende',
  'Karosserie': 'Karosserieform',
  'Kraftstoffart': 'Kraftstoff'
};

// Function to recursively find all JSON files in a directory
function findJsonFiles(directory) {
  let results = [];
  
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findJsonFiles(itemPath));
    } else if (item.endsWith('.json')) {
      results.push(itemPath);
    }
  }
  
  return results;
}

// Function to update field names in a JSON object
function updateFieldNames(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => updateFieldNames(item));
  }
  
  const newObj = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = fieldMappings[key] || key;
    newObj[newKey] = updateFieldNames(value);
  }
  
  return newObj;
}

// Main function
function main() {
  const dataDir = path.join(__dirname, 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.error('Error: /data directory not found');
    process.exit(1);
  }
  
  const jsonFiles = findJsonFiles(dataDir);
  console.log(`Found ${jsonFiles.length} JSON files to process`);
  
  let modifiedCount = 0;
  
  for (const filePath of jsonFiles) {
    try {
      // Read and parse the JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      // Update field names
      const updatedData = updateFieldNames(jsonData);
      
      // Write the updated JSON back to the file
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
      
      modifiedCount++;
      console.log(`Updated: ${filePath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
  
  console.log(`Successfully modified ${modifiedCount} out of ${jsonFiles.length} JSON files`);
}

main();
