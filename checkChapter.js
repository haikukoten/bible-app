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

// Function to check chapters in Redis
async function checkChaptersInRedis() {
    const bibleData = loadJsonData(jsonPath);
    let missingChapters = [];

    for (const book of bibleData) {
        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
            const chapterNumber = chapterIndex + 1;
            const redisKey = `bible:en_kjv:${book.abbrev}:${chapterNumber}`;

            const chapterExists = await redis.exists(redisKey);
            if (!chapterExists) {
                console.log(`Missing chapter: ${book.name} Chapter ${chapterNumber}`);
                missingChapters.push({ book: book.name, chapter: chapterNumber });
            }
        }
    }

    if (missingChapters.length === 0) {
        console.log("All chapters are present in Redis.");
    } else {
        console.log("Missing chapters:", missingChapters);
    }

    // Close Redis connection
    redis.disconnect();
}

// Run the check
checkChaptersInRedis();
