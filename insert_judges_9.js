const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

// Initialize Redis connection
const redis = new Redis();

// Path to the JSON file
const jsonPath = path.join(__dirname, 'public/json/en_kjv.json');

// Function to load JSON data
function loadJsonData(filePath) {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

// Function to insert a specific chapter into Redis
async function insertChapter(bookAbbrev, chapterNumber) {
    const bibleData = loadJsonData(jsonPath);
    const bookData = bibleData.find(book => book.abbrev === bookAbbrev);
    
    if (!bookData) {
        console.error("Book not found in JSON data.");
        return;
    }

    const chapterData = bookData.chapters[chapterNumber - 1]; // Adjust for zero-index array
    if (!chapterData) {
        console.error(`Chapter ${chapterNumber} not found in book ${bookData.name}.`);
        return;
    }

    const redisKey = `bible:en_kjv:${bookAbbrev}:${chapterNumber}`;
    await redis.set(redisKey, JSON.stringify(chapterData));
    console.log(`Inserted Chapter ${chapterNumber} of ${bookData.name} into Redis.`);
    
    // Close Redis connection
    redis.disconnect();
}

// Example usage: Insert Judges Chapter 9
insertChapter('jud', 9);
