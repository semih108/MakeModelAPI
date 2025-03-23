const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);

async function findJsonFiles(dir) {
  const files = await readdir(dir);
  const jsonFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      const nestedJsonFiles = await findJsonFiles(filePath);
      jsonFiles.push(...nestedJsonFiles);
    } else if (file.endsWith('.json')) {
      jsonFiles.push(filePath);
    }
  }

  return jsonFiles;
}

async function replaceInJsonFiles() {
  try {
    const jsonFiles = await findJsonFiles('./data');
    let replacementCount = 0;
    let fileCount = 0;

    for (const filePath of jsonFiles) {
      const content = await readFile(filePath, 'utf8');
      
      if (content.includes('Motorenbenzin')) {
        const updatedContent = content.replace(/Motorenbenzin/g, 'Benzin');
        await writeFile(filePath, updatedContent, 'utf8');
        replacementCount += (content.match(/Motorenbenzin/g) || []).length;
        fileCount++;
        console.log(`Updated: ${filePath}`);
      }
    }

    console.log(`Replacement complete. Modified ${fileCount} files with ${replacementCount} replacements.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

replaceInJsonFiles();
