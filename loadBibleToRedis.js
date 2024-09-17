const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');
const { bookNameToAbbrevMap } = require('./lib/bibleBooks');  // Import book names to abbreviations map

// Initialize Redis connection (default: localhost:6379)
const redis = new Redis();

const loadBibleData = async (filePath, version) => {
  try {
    // Read the JSON file
    const rawData = fs.readFileSync(filePath, 'utf8');

    // Parse the JSON data
    const bibleData = JSON.parse(rawData);

    // Loop through each book in the JSON data
    for (const book of bibleData) {
      const abbrev = book.abbrev;  // Get the abbreviation from the JSON file (e.g., 'gn')
      
      if (!abbrev) {
        console.error(`Abbreviation missing for book in version ${version}`);
        continue;  // Skip if the abbreviation is missing
      }

      const chapters = book.chapters;  // Array of chapters for the book

      // Loop through each chapter
      for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
        const chapter = chapters[chapterIndex];  // Array of verses in the chapter
        
        // Create Redis key using version, book abbreviation, and chapter number
        const key = `bible:${version}:${abbrev}:${chapterIndex + 1}`;
        
        // Store the chapter (array of verses) as a JSON string in Redis
        await redis.set(key, JSON.stringify(chapter));
        console.log(`Loaded ${version} ${abbrev} Chapter ${chapterIndex + 1}`);
      }
    }

    console.log(`Finished loading ${version} Bible data into Redis`);
  } catch (err) {
    console.error(`Error loading ${version} Bible data from file ${filePath}:`, err.message);
  }
};

// Path to your JSON files
const bibleDir = path.join(__dirname, 'public', 'json');
const files = fs.readdirSync(bibleDir);  // Read all files in the JSON directory

// Load each file into Redis
(async () => {
  for (const file of files) {
    const version = file.split('.')[0];  // Extract version name from filename (e.g., 'en_kjv')
    const filePath = path.join(bibleDir, file);

    // Skip 'index.json' file specifically
    if (file === 'index.json') {
      console.log(`Skipping index file: ${file}`);
      continue;  // Skip this iteration and move to the next file
    }

    // Validate file extension is .json before processing
    if (file.endsWith('.json')) {
      await loadBibleData(filePath, version);  // Load the file's data into Redis
    } else {
      console.log(`Skipping non-JSON file: ${file}`);
    }
  }

  // Close Redis connection when done
  redis.disconnect();
})();
