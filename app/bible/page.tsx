'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Input for the search functionality
import { ChevronLeft, ChevronRight } from "lucide-react";
import Modal from 'react-modal';
import { bibleVersions } from "@/lib/bibleBooks"; // Import Bible versions and books

export default function BiblePage() {
  const [bibleVersion, setBibleVersion] = useState<string>('en_kjv'); // default version
  const [book, setBook] = useState<string>('Genesis');
  const [chapter, setChapter] = useState<string>('1');
  const [bibleText, setBibleText] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<string>('large');
  const [isChapterModalOpen, setIsChapterModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentBooks, setCurrentBooks] = useState<any[]>([]);

  const [versionSearch, setVersionSearch] = useState<string>(''); // Search state for Bible Versions
  const [bookSearch, setBookSearch] = useState<string>(''); // Search state for Books

  const versionInputRef = useRef<HTMLInputElement | null>(null);
  const bookInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch Bible versions on page load
  useEffect(() => {
    fetchBibleVersions();
  }, []);

  // Focus the version search input when dropdown opens
  useEffect(() => {
    if (versionSearch && versionInputRef.current) {
      versionInputRef.current?.focus();  // Safety check before focusing
    }
  }, [versionSearch]);

  // Focus the book search input when dropdown opens
  useEffect(() => {
    if (bookSearch && bookInputRef.current) {
      bookInputRef.current?.focus();  // Safety check before focusing
    }
  }, [bookSearch]);

  // Fetch Bible versions dynamically
  const fetchBibleVersions = useCallback(() => {
    const selectedVersion = bibleVersions
      .flatMap(language => language.versions)
      .find(version => version.abbreviation === bibleVersion);

    if (selectedVersion) {
      setCurrentBooks(selectedVersion.books); // Set the books for the selected version
    }
  }, [bibleVersion]);

  // Fetch Bible text for the selected version, book, and chapter from the API
  const fetchBibleText = useCallback(async () => {
    setIsLoading(true);

    try {
      const bookAbbrev = currentBooks.find(b => b.name === book)?.abbrev;

      // Check if the book abbreviation exists
      if (!bookAbbrev) {
        throw new Error('Book abbreviation not found.');
      }

      const response = await fetch(`/api/bible?version=${bibleVersion}&book=${bookAbbrev}&chapter=${chapter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Bible data');
      }

      const data = await response.json();
      setBibleText(data);
    } catch (error) {
      setBibleText(['Error loading Bible data.']);
    } finally {
      setIsLoading(false);
    }
  }, [bibleVersion, book, chapter, currentBooks]);

  // Fetch Bible text when book, chapter, or version changes
  useEffect(() => {
    fetchBibleText();
  }, [fetchBibleText, book, chapter, bibleVersion]);

  // Handle book change
  const handleBookChange = (newBook: string) => {
    setBook(newBook);
    setChapter('1');  // Always reset to chapter 1 when changing books
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

  const handleChapterSelect = (selectedChapter: string) => {
    setChapter(selectedChapter);  // Set the selected chapter
    setIsChapterModalOpen(false); // Close the modal
  };

  // Filter versions and books based on the search input
  const filteredBibleVersions = bibleVersions
    .flatMap(language => language.versions)
    .filter(version => version.name.toLowerCase().includes(versionSearch.toLowerCase()));
  
  const filteredBooks = currentBooks.filter(book => book.name.toLowerCase().includes(bookSearch.toLowerCase()));

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
              {/* Bible Version Selector with Search */}
              <div>
                <Select value={bibleVersion} onValueChange={handleVersionChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Version" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Search Input inside the dropdown */}
                    <div className="p-2">
                      <Input 
                        placeholder="Search Bible Versions..." 
                        value={versionSearch}
                        onChange={(e) => setVersionSearch(e.target.value)} 
                        ref={versionInputRef}  // Use useRef for better control
                      />
                    </div>
                    {filteredBibleVersions.map(version => (
                      <SelectItem key={version.abbreviation} value={version.abbreviation}>
                        {version.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Book Selector with Search */}
              <div>
                <Select value={book} onValueChange={handleBookChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Book" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Search Input inside the dropdown */}
                    <div className="p-2">
                      <Input 
                        placeholder="Search Books..." 
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)} 
                        ref={bookInputRef}  // Use useRef for better control
                      />
                    </div>
                    {filteredBooks.map((book) => (
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
            <CardHeader className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-center md:justify-between">
              <CardTitle>{`${book} ${chapter}`}</CardTitle>

              <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
                {/* Button to select chapter */}
                <Button onClick={openChapterModal}>
                  Select Chapter
                </Button>

                {/* Font size selection */}
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-full md:w-[180px]">
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
              {isLoading ? (
                <p>Loading...</p> // Show a loading message while the data is being fetched
              ) : (
                <div className={`font-serif ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-xl' : 'text-base'}`}>
                  {bibleText.map((verse, index) => (
                    <p key={index}>
                      <sup>{index + 1}</sup> {verse}
                    </p>
                  ))}
                </div>
              )}
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
            {Array.from({ length: currentBooks.find(b => b.name === book)?.chapters || 0 }, (_, i) => (
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
