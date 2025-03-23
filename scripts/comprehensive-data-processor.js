const fs = require('fs');
const path = require('path');

// Attributes to keep - with Getriebeart at the end
const attributesToKeep = [
  'Marke',
  'Model',
  'ModelDetail',
  'Generation',
  'Beginn Jahr der Produktion',
  'Ende Jahr der Produktion',
  'Karosserie',
  'Kraftstoffart',
  'Leistung',
  'Getriebeart'  // At the end of the list
];

// Function to extract Leistung from a string like "2.0 S (124 PS)"
function extractLeistung(str) {
  if (typeof str !== 'string') {
    return null;
  }
  
  // Look for a pattern like "(124 PS)" and extract the number
  const match = str.match(/\((\d+)\s*PS\)/);
  if (match && match[1]) {
    return match[1] + " PS"; // Return the power with "PS" unit
  }
  
  return null;
}

// Function to extract ModelDetail from a string like "2.0 S (124 PS)"
function extractModelDetail(str) {
  if (typeof str !== 'string') {
    return null;
  }
  
  // Extract the part before the PS value in parentheses
  const match = str.match(/^(.*?)\s*\(\d+\s*PS\)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return null;
}

// Function to identify and extract Getriebeart
function identifyGetriebeart(obj) {
  // If the object doesn't have details, return
  if (!obj || !obj.details || typeof obj.details !== 'object') {
    return;
  }
  
  // First check if there's already a field named Getriebeart
  if (obj.details.Getriebeart !== undefined) {
    return;
  }
  
  // Look for a field that contains "Anzahl der Gänge und Art des Getriebes"
  for (const key in obj.details) {
    // Check if the key or value contains the target string
    if ((key === "Anzahl der Gänge und Art des Getriebes") || 
        (typeof obj.details[key] === 'string' && 
         obj.details[key].includes("Anzahl der Gänge und Art des Getriebes"))) {
      
      // This field contains transmission information
      // The value might be something like "6-Gang Automatik"
      const value = obj.details[key];
      
      // Common transmission types in German
      const transmissionTypes = [
        'Automatik', 'Automatic', 'Schaltgetriebe', 'Manuell', 'CVT', 'DSG', 
        'Doppelkupplungsgetriebe', 'Halbautomatik', 'Tiptronic', 'tiptronic'
      ];
      
      // Try to extract the transmission type
      let extractedType = null;
      
      // Check if the value directly contains any of the common types
      for (const type of transmissionTypes) {
        if (typeof value === 'string' && value.includes(type)) {
          extractedType = type;
          break;
        }
      }
      
      // If we found a type, use it; otherwise use the whole value
      if (extractedType) {
        obj.details.Getriebeart = extractedType;
      } else if (typeof value === 'string') {
        // If the value contains a colon, take what's after the colon
        if (value.includes(':')) {
          obj.details.Getriebeart = value.split(':')[1].trim();
        } else {
          obj.details.Getriebeart = value;
        }
      }
      
      // We've processed this field, so we can return
      return;
    }
  }
}

// Function to process a single JSON file
function processJsonFile(filePath) {
  try {
    console.log(`Processing file: $scripts/comprehensive-data-processor.js`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Step 1: Process special fields (ModelDetail, Leistung and Getriebeart)
    function processSpecialFields(obj) {
      if (!obj || typeof obj !== 'object') return;
      
      // If this is an array, process each item
      if (Array.isArray(obj)) {
        obj.forEach(item => processSpecialFields(item));
        return;
      }
      
      // Check if this object has a 'details' property
      if (obj.details && typeof obj.details === 'object') {
        // Process Modifikation (Motor) to extract Leistung and ModelDetail
        if (obj.details["Modifikation (Motor)"]) {
          const leistung = extractLeistung(obj.details["Modifikation (Motor)"]);
          if (leistung) {
            obj.details.Leistung = leistung;
          }
          
          const modelDetail = extractModelDetail(obj.details["Modifikation (Motor)"]);
          if (modelDetail) {
            obj.details.ModelDetail = modelDetail;
          }
        }
        
        // Process Getriebeart
        identifyGetriebeart(obj);
      }
      
      // Recursively process all properties of this object
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
          processSpecialFields(obj[key]);
        }
      }
    }
    
    // Step 2: Clean up and keep only specified attributes
    function cleanupAttributes(obj) {
      if (!obj || typeof obj !== 'object') return;
      
      // If this is an array, process each item
      if (Array.isArray(obj)) {
        obj.forEach(item => cleanupAttributes(item));
        return;
      }
      
      // Check if this object has a 'details' property
      if (obj.details && typeof obj.details === 'object') {
        // Create a new details object with only the attributes to keep
        const newDetails = {};
        for (const attr of attributesToKeep) {
          if (obj.details[attr] !== undefined) {
            newDetails[attr] = obj.details[attr];
          }
        }
        // Replace the original details with the filtered one
        obj.details = newDetails;
      }
      
      // Recursively process all properties of this object
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
          cleanupAttributes(obj[key]);
        }
      }
    }
    
    // Execute both steps
    processSpecialFields(data);
    cleanupAttributes(data);
    
    // Write the modified data back to the file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully processed: $scripts/comprehensive-data-processor.js`);
  } catch (error) {
    console.error(`Error processing $scripts/comprehensive-data-processor.js:`, error.message);
  }
}

// Function to recursively process all JSON files in a directory
function processDirectory(directory) {
  try {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        processDirectory(filePath);
      } else if (path.extname(file).toLowerCase() === '.json') {
        processJsonFile(filePath);
      }
    });
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error.message);
  }
}

// Start processing from the /data directory
const dataDirectory = path.join(__dirname, '..', 'data');
console.log(`Starting to process JSON files in ${dataDirectory}`);

if (fs.existsSync(dataDirectory)) {
  processDirectory(dataDirectory);
  console.log('Processing complete!');
} else {
  console.error(`Directory not found: ${dataDirectory}`);
}

// Export functions for potential reuse
module.exports = {
  processJsonFile,
  processDirectory,
  extractLeistung,
  extractModelDetail,
  identifyGetriebeart
};