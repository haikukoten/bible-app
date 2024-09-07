'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Modal from 'react-modal';

// Import books and abbreviations from the separate file
import { books, bookNameToAbbrevMap } from "@/lib/bibleBooks"; // Adjust the path as needed

export default function BiblePage() {
  const [bibleVersion, setBibleVersion] = useState<string>('en_kjv'); // default version
  const [book, setBook] = useState<string>('Genesis');
  const [chapter, setChapter] = useState<string>('1');
  const [bibleText, setBibleText] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<string>('large');
  const [bibleData, setBibleData] = useState<any>(null); // Explicitly set type to `any` or appropriate type
  const [isChapterModalOpen, setIsChapterModalOpen] = useState<boolean>(false); // State for controlling chapter modal
  const [bibleVersions, setBibleVersions] = useState<{ name: string; abbreviation: string }[]>([]); // For storing versions

  // Load the selected Bible version's JSON data
  useEffect(() => {
    fetchBibleData();
  }, [bibleVersion]);

  useEffect(() => {
    if (bibleData) {
      fetchBibleText();
    }
  }, [book, chapter, bibleData]);

  useEffect(() => {
    fetchBibleVersions(); // Fetch versions on page load
  }, []);

  // Fetch the Bible versions dynamically from /json/index.json
  const fetchBibleVersions = async () => {
    try {
      const response = await fetch('/json/index.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const versionData = await response.json();
      const allVersions = versionData.reduce((acc: { name: string; abbreviation: string }[], languageEntry: any) => {
        return acc.concat(languageEntry.versions);
      }, []);
      setBibleVersions(allVersions); // Store fetched versions
    } catch (error) {
      console.error('Error fetching Bible versions:', error);
    }
  };

  const fetchBibleData = async () => {
    try {
      const response = await fetch(`/json/${bibleVersion}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBibleData(data);
    } catch (error) {
      console.error('Error loading Bible data:', error);
      setBibleText(['Error loading Bible data. Please try again.']);
    }
  };

  const fetchBibleText = () => {
    if (!bibleData) return; // Early return if bibleData is null

    const bookAbbrev = bookNameToAbbrevMap[book];
    if (!bookAbbrev) {
      setBibleText(['Book abbreviation not found. Please check your selection.']);
      return;
    }

    const bookData = bibleData.find((b: any) => b.abbrev.toLowerCase() === bookAbbrev.toLowerCase());

    if (bookData) {
      const chapterIndex = parseInt(chapter, 10) - 1;
      if (bookData.chapters[chapterIndex]) {
        setBibleText(bookData.chapters[chapterIndex]);
      } else {
        setBibleText(['Chapter not found. Please check your selection.']);
      }
    } else {
      setBibleText(['Book not found. Please check your selection.']);
    }
  };

  const handlePreviousChapter = () => {
    const currentChapter = parseInt(chapter, 10);
    if (currentChapter > 1) {
      setChapter((prevChapter) => String(parseInt(prevChapter, 10) - 1));
    }
  };

  const handleNextChapter = () => {
    setChapter((prevChapter) => String(parseInt(prevChapter, 10) + 1));
  };

  const handleVersionChange = (version: string) => {
    setBibleVersion(version); // Update the Bible version
  };

  const openChapterModal = () => {
    setIsChapterModalOpen(true);  // Open the chapter selection modal
  };

  const handleChapterSelect = (chapter: string) => {
    setChapter(chapter);  // Set the selected chapter as a string
    setIsChapterModalOpen(false); // Close the modal
  };

  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Bible
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Search and read the scriptures.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              {/* Bible Version Selector */}
              <div>
                <Select value={bibleVersion} onValueChange={handleVersionChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Version" />
                  </SelectTrigger>
                  <SelectContent>
                    {bibleVersions.length === 0 ? (
                      <SelectItem value="disabled" disabled>No Versions Available</SelectItem>
                    ) : (
                      bibleVersions.map((version) => (
                        <SelectItem key={version.abbreviation} value={version.abbreviation}>
                          {version.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Book Selector */}
              <div>
                <Select value={book} onValueChange={setBook}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book) => (
                      <SelectItem key={book.abbrev} value={book.name}>
                        {book.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bible Content */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{`${book} ${chapter}`}</CardTitle>

              <div className="flex space-x-4">
                {/* Button to select chapter */}
                <Button onClick={openChapterModal}>
                  Select Chapter
                </Button>

                {/* Font size selection */}
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`font-serif ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-xl' : 'text-base'}`}>
                {bibleText.map((verse, index) => (
                  <p key={index}>
                    <sup>{index + 1}</sup> {verse}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-center mt-4 space-x-4">
            <Button onClick={handlePreviousChapter}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Chapter
            </Button>
            <Button onClick={handleNextChapter}>
              Next Chapter
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Chapter Selection Modal */}
      {isChapterModalOpen && (
        <Modal
          isOpen={isChapterModalOpen}
          onRequestClose={() => setIsChapterModalOpen(false)}
          contentLabel="Select Chapter"
          className="bg-white p-4 rounded shadow-lg max-w-xs mx-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-lg font-semibold mb-4">Select Chapter for {book}</h2>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: books.find(b => b.name === book)?.chapters || 0 }, (_, i) => (
              <Button key={i} onClick={() => handleChapterSelect(String(i + 1))}>
                {i + 1}
              </Button>
            ))}
          </div>
          <Button onClick={() => setIsChapterModalOpen(false)} className="mt-4">
            Close
          </Button>
        </Modal>
      )}
    </>
  );
}
