'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

export default function BiblePage() {
  const [book, setBook] = useState('Genesis')
  const [chapter, setChapter] = useState('1')
  const [verse, setVerse] = useState('1')
  const [bibleText, setBibleText] = useState('')
  const [fontSize, setFontSize] = useState('medium')

  useEffect(() => {
    fetchBibleText()
  }, [book, chapter, verse])

  const fetchBibleText = async () => {
    try {
      const response = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}`)
      const data = await response.json()
      setBibleText(data.text)
    } catch (error) {
      console.error('Error fetching Bible text:', error)
      setBibleText('Error loading Bible text. Please try again.')
    }
  }

  const handlePreviousChapter = () => {
    const currentChapter = parseInt(chapter, 10)
    if (currentChapter > 1) {
      setChapter((prevChapter) => String(parseInt(prevChapter, 10) - 1))
    }
  }

  const handleNextChapter = () => {
    setChapter((prevChapter) => String(parseInt(prevChapter, 10) + 1))
  }

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
              <form className="flex space-x-2">
                <Input
                  className="max-w-lg flex-1"
                  placeholder="Enter book"
                  type="text"
                  value={book}
                  onChange={(e) => setBook(e.target.value)}
                />
                <Input
                  className="max-w-lg flex-1"
                  placeholder="Enter chapter"
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                />
                <Input
                  className="max-w-lg flex-1"
                  placeholder="Enter verse"
                  type="text"
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                />
                <Button type="submit" onClick={(e) => { e.preventDefault(); fetchBibleText(); }}>
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{`${book} ${chapter}:${verse}`}</CardTitle>
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
            </CardHeader>
            <CardContent>
              <p className={`font-serif ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-xl' : 'text-base'}`}>
                {bibleText}
              </p>
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
    </>
  )
}
