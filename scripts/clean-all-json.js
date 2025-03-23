const fs = require('fs');
const path = require('path');

// Path to the data folder
const dataFolderPath = path.resolve(__dirname, 'data');

// Function to process a single JSON file
function processJsonFile(filePath) {
  try {
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Process the data - this assumes the structure might be nested
    const processObject = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      
      // Check if this object has the target fields
      if (obj["Erstzulassung Anfang"] && typeof obj["Erstzulassung Anfang"] === 'string') {
        obj["Erstzulassung Anfang"] = obj["Erstzulassung Anfang"].replace(' Jahr', '');
      }
      
      if (obj["Erstzulassung Ende"] && typeof obj["Erstzulassung Ende"] === 'string') {
        obj["Erstzulassung Ende"] = obj["Erstzulassung Ende"].replace(' Jahr', '');
      }
      
      // Process nested objects and arrays
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach(item => processObject(item));
        } else if (obj[key] && typeof obj[key] === 'object') {
          processObject(obj[key]);
        }
      }
    };
    
    // Process the entire JSON data
    processObject(jsonData);
    
    // Write the processed data back to the file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    
    console.log(`Processed: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Function to recursively find all JSON files in a directory
function findJsonFiles(dir) {
  let results = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findJsonFiles(itemPath));
    } else if (item.isFile() && item.name.endsWith('.json')) {
      // Add JSON files to the results
      results.push(itemPath);
    }
  }
  
  return results;
}

// Main execution
try {
  // Check if data folder exists
  if (!fs.existsSync(dataFolderPath)) {
    console.error('Data folder not found!');
    process.exit(1);
  }
  
  // Find all JSON files
  const jsonFiles = findJsonFiles(dataFolderPath);
  
  if (jsonFiles.length === 0) {
    console.log('No JSON files found in the data folder.');
    process.exit(0);
  }
  
  console.log(`Found ${jsonFiles.length} JSON files to process.`);
  
  // Process each JSON file
  let successCount = 0;
  for (const file of jsonFiles) {
    if (processJsonFile(file)) {
      successCount++;
    }
  }
  
  console.log(`\nSummary: Successfully processed ${successCount} out of ${jsonFiles.length} JSON files.`);
} catch (error) {
  console.error('Error:', error.message);
}
