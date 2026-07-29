"use client"; // Ensure this is a client-side component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DailyVerse: React.FC = () => {
  const [dailyVerse, setDailyVerse] = useState<{ verse: string; book: string; chapter: number; verse_number: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const response = await fetch(`/api/dailyVerse?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`Error fetching daily verse: ${response.statusText}`);
        }
        const data = await response.json();
        setDailyVerse(data);
      } catch (error) {
        console.error('Error fetching daily verse:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerse();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl animate-pulse">
        <CardHeader>
          <CardTitle>Today&apos;s Verse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/4 ml-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyVerse) {
    return <p className="text-muted-foreground">Unable to load today&apos;s verse.</p>;
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
