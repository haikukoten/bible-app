import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyVerse } from '@/lib/dailyVerse';

export default async function DailyVerse() {
  const dailyVerse = await getDailyVerse();

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
}
