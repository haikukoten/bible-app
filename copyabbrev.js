const fs = require('fs');
const path = require('path');

// File paths for pt_aa, pt_acf, and pt_nvi
const ptAaPath = path.join(__dirname, 'public', 'json', 'pt_aa.json');
const ptAcfPath = path.join(__dirname, 'public', 'json', 'pt_acf.json');
const ptNviPath = path.join(__dirname, 'public', 'json', 'pt_nvi.json');

// Function to copy abbrev from pt_aa.json to target files
const copyAbbrev = (sourceFilePath, targetFilePath) => {
  try {
    // Read and parse pt_aa.json (source)
    const ptAaData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));

    // Read and parse target file (e.g., pt_acf.json or pt_nvi.json)
    const targetData = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));

    // Iterate over the books in the source file (pt_aa.json)
    for (let i = 0; i < ptAaData.length; i++) {
      const sourceBook = ptAaData[i];
      const targetBook = targetData[i];

      // Ensure both books match by name before copying abbrev
      if (sourceBook.name === targetBook.name) {
        targetBook.abbrev = sourceBook.abbrev; // Copy the abbrev
      } else {
        console.error(`Book mismatch at index ${i}: ${sourceBook.name} != ${targetBook.name}`);
      }
    }

    // Write the updated target data back to the file
    fs.writeFileSync(targetFilePath, JSON.stringify(targetData, null, 2), 'utf8');
    console.log(`Successfully copied abbrev values to ${path.basename(targetFilePath)}`);
  } catch (err) {
    console.error(`Error processing file ${targetFilePath}:`, err.message);
  }
};

// Copy abbrev from pt_aa.json to pt_acf.json and pt_nvi.json
copyAbbrev(ptAaPath, ptAcfPath);
copyAbbrev(ptAaPath, ptNviPath);

console.log('Abbreviation copying completed.');
