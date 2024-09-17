const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');
const { bookNameToAbbrevMap } = require('./lib/bibleBooks');

// Initialize Redis connection
const redis = new Redis();

// Function to check if an entry is a valid Bible book
const isValidBibleBook = (book) => {
  return book && book.name && Array.isArray(book.chapters);
};

// Function to compare JSON data with Redis
const verifyBibleData = async (filePath, version, resultLog) => {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const bibleData = JSON.parse(rawData);

    for (const book of bibleData) {
      // Skip entries that are not valid Bible books
      if (!isValidBibleBook(book)) {
        continue;
      }

      const abbrev = bookNameToAbbrevMap[book.name];
      if (!abbrev) {
        resultLog.push(`Abbreviation missing for book: ${book.name || 'undefined'} in version ${version}`);
        continue;
      }

      const chapters = book.chapters;
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const redisKey = `bible:${version}:${abbrev}:${i + 1}`;
        const redisData = await redis.get(redisKey);

        if (!redisData) {
          resultLog.push(`Missing chapter in Redis for key: ${redisKey}`);
        } else {
          try {
            const redisParsedData = JSON.parse(redisData);

            // Compare JSON and Redis data
            if (JSON.stringify(chapter) !== JSON.stringify(redisParsedData)) {
              resultLog.push(`Data mismatch for key: ${redisKey}`);
            }
          } catch (parseErr) {
            resultLog.push(`Error parsing Redis data for key: ${redisKey}`);
          }
        }
      }
    }
    console.log(`Finished verifying ${version} Bible data.`);
  } catch (err) {
    resultLog.push(`Error verifying ${version} Bible data: ${err.message}`);
  }
};

// Path to your JSON files
const bibleDir = path.join(__dirname, 'public', 'json');
const files = fs.readdirSync(bibleDir);

// Array to store the verification results
const resultLog = [];

// Verify each file
(async () => {
  for (const file of files) {
    const version = file.split('.')[0];  // Extract version from filename
    const filePath = path.join(bibleDir, file);
    await verifyBibleData(filePath, version, resultLog);
  }

  // Save the results to a text file
  const resultFilePath = path.join(__dirname, 'verification_result.txt');
  fs.writeFileSync(resultFilePath, resultLog.join('\n'), 'utf8');
  console.log(`Verification complete. Results saved to ${resultFilePath}`);

  // Close Redis connection
  redis.disconnect();
})();
