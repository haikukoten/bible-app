"use client"; // Ensure this is a client-side component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DailyVerse: React.FC = () => {
  // Update state to include the correct fields matching your JSON structure
  const [dailyVerse, setDailyVerse] = useState<{ verse: string; book: string; chapter: number; verse_number: number } | null>(null);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        // Fetching from the API to handle 24h auto-updates with cache-busting
        const response = await fetch(`/api/dailyVerse?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`Error fetching daily verse: ${response.statusText}`);
        }
        const data = await response.json();
        setDailyVerse(data);
      } catch (error) {
        console.error('Error fetching daily verse:', error);
      }
    };

    fetchVerse();
  }, []);

  // Check if the dailyVerse is null, which means data hasn't loaded yet or there's an error
  if (!dailyVerse) {
    return <p>Unable to load today&apos;s verse.</p>;
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Today&apos;s Verse</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-serif italic">&quot;{dailyVerse.verse}&quot;</p>
        <p className="text-right font-semibold">
          - {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse_number}
        </p>
      </CardContent>
    </Card>
  );
};

export default DailyVerse;
