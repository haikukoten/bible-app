// utils/bibleSearch.ts

interface BibleChapter {
    verses: string[]; // Array of verses in the chapter
  }
  
  interface BibleBook {
    abbrev: string;
    book: string;
    chapters: BibleChapter[];
  }
  
  interface BibleVerse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  }
  
  /**
   * Loads the Bible data for the selected version.
   * @param version - The abbreviation of the Bible version (e.g., 'en_kjv', 'es_rvr').
   * @returns A promise that resolves with the Bible data as an array of verses.
   */
  export const loadBibleData = async (version: string): Promise<BibleVerse[]> => {
    try {
      const response = await fetch(`/json/${version}.json`); // Dynamic path to the version file
      if (!response.ok) {
        throw new Error(`Failed to load Bible version: ${version}`);
      }
      const data: BibleBook[] = await response.json();
      
      // Transform data into a flat array of verses
      const verses: BibleVerse[] = [];
      data.forEach(book => {
        book.chapters.forEach((chapter, chapterIndex) => {
          chapter.verses.forEach((verseText, verseIndex) => { // Correctly typed parameters
            verses.push({
              book: book.book,
              chapter: chapterIndex + 1,
              verse: verseIndex + 1,
              text: verseText
            });
          });
        });
      });
      return verses;
    } catch (error) {
      console.error("Error loading Bible data:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
  
  /**
   * Searches for verses containing the search term.
   * @param verses - The array of Bible verses.
   * @param searchTerm - The term to search for in the verse text.
   * @returns An array of verses that match the search term.
   */
  export const searchBible = (verses: BibleVerse[], searchTerm: string): BibleVerse[] => {
    return verses.filter(verse => verse.text.toLowerCase().includes(searchTerm.toLowerCase()));
  };
  