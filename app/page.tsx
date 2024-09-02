'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function Home() {
  const [verseOfDay, setVerseOfDay] = useState("Loading verse of the day...")

  useEffect(() => {
    // In a real application, you would call an API to get the verse of the day
    // For this example, we'll use a placeholder
    setVerseOfDay("For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. - John 3:16")
  }, [])

  return (
    <>
      <section className="w-full py-8 md:py-16 lg:py-20 xl:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to Our Bible Website
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Explore the scriptures, read our blog, and find daily inspiration.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <form className="flex space-x-2">
                <Input className="max-w-lg flex-1" placeholder="Search the Bible" type="text" />
                <Button type="submit">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-8 md:py-16 lg:py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Verse of the Day</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Find daily inspiration in God's word.
              </p>
            </div>
            <Card className="w-full max-w-3xl">
              <CardHeader>
                <CardTitle>Today's Verse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif italic">{verseOfDay}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
