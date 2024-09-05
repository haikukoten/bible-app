import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Modal from 'react-modal';

// Book to abbreviation mapping
const books = [
  { name: "Genesis", abbrev: "gn", chapters: 50 },
  { name: "Exodus", abbrev: "ex", chapters: 40 },
  // Add more books and their corresponding chapter counts
];

// Props type definition
interface BibleSelectorProps {
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: string) => void;
  onVersionChange: (version: string) => void; // Added this prop for Bible version
}

// Use document.body to ensure compatibility across different environments
Modal.setAppElement(document.body); 

const BibleSelector: React.FC<BibleSelectorProps> = ({ onBookChange, onChapterChange, onVersionChange }) => {
  const [selectedBook, setSelectedBook] = useState<string>(books[0].name);
  const [selectedVersion, setSelectedVersion] = useState<string>('en_kjv'); // Default version
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [versions, setVersions] = useState<{ name: string; abbreviation: string }[]>([]);

  useEffect(() => {
    // Fetch the Bible versions dynamically from /json/index.json
    const fetchVersions = async () => {
      try {
        console.log('Fetching Bible versions from /json/index.json...');
        const response = await fetch('/json/index.json'); // Use correct path without "/public"

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const versionData = await response.json();

        console.log('Fetched version data:', versionData); // Log the fetched data

        // Extract versions from each language
        const allVersions = versionData.reduce((acc: { name: string; abbreviation: string }[], languageEntry: any) => {
          return acc.concat(languageEntry.versions);
        }, []);

        console.log('Processed versions:', allVersions); // Log the processed versions
        setVersions(allVersions);
      } catch (error) {
        console.error("Error fetching versions:", error);
      }
    };

    fetchVersions();
  }, []);

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    onBookChange(book);
    setIsModalOpen(true);  // Open modal when a book is selected
  };

  const handleChapterSelect = (chapter: number) => {
    onChapterChange(String(chapter));  // Pass chapter to parent
    setIsModalOpen(false);  // Close modal after chapter is selected
  };

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    onVersionChange(version);
  };

  return (
    <>
      {/* Version Selector */}
      <Select value={selectedVersion} onValueChange={handleVersionChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Version" />
        </SelectTrigger>
        <SelectContent>
          {versions.length === 0 ? (
            <SelectItem value="disabled" disabled>No Versions Available</SelectItem>
          ) : (
            versions.map((version) => (
              <SelectItem key={version.abbreviation} value={version.abbreviation}>
                {version.name} {/* Display version name */}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Book Selector */}
      <Select value={selectedBook} onValueChange={handleBookChange}>
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

      {/* Chapter Selector Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Select Chapter"
        className="bg-white p-4 rounded shadow-lg max-w-xs mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-lg font-semibold mb-4">Select Chapter</h2>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: books.find(book => book.name === selectedBook)?.chapters || 0 }, (_, i) => (
            <Button key={i} onClick={() => handleChapterSelect(i + 1)}>
              {i + 1}
            </Button>
          ))}
        </div>
        <Button onClick={() => setIsModalOpen(false)} className="mt-4">
          Close
        </Button>
      </Modal>
    </>
  );
};

export default BibleSelector;
