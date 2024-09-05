'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWithBible() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m here to chat about the Bible. What would you like to know?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }])
      setInput('')
      
      // Simulate a response (in a real app, this would be an API call)
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `That's an interesting question about "${input}". In the Bible, we can find various passages that might relate to this topic. However, as an AI, I don't have personal beliefs or interpretations. I'd recommend consulting with a religious leader or scholar for a more in-depth discussion on this matter.`
        }])
      }, 1000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="w-full">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Chat with Bible</h1>
          <ScrollArea className="h-[400px] mb-4 p-4 border rounded-md">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}