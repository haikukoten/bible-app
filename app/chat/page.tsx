'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define the Message type
type Message = {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWithBible() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m here to chat about the Bible. What would you like to know?' }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load messages from localStorage (only in the browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMessages = localStorage.getItem('bible-chat-messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    }
  }, []);

  // Save messages to localStorage (only in the browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bible-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = { role: 'user', content: input };
      setMessages([...messages, userMessage]);
      setInput('');

      setLoading(true);
      try {
        const response = await fetch('/api/chat-with-gpt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        });

        const data = await response.json();

        if (response.ok) {
          const assistantMessage: Message = { role: 'assistant', content: data.message };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          const errorMessage: Message = { role: 'assistant', content: 'Sorry, I had trouble getting a response. Please try again.' };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        const errorMessage: Message = { role: 'assistant', content: 'An error occurred. Please try again.' };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearMessages = () => {
    setMessages([
      { role: 'assistant', content: 'Hello! I\'m here to chat about the Bible. What would you like to know?' }
    ]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bible-chat-messages');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="w-full">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Chat with Bible</h1>

          <ScrollArea className="h-[400px] mb-4 p-4 border rounded-md">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 border ${message.role === 'user' ? 'bg-background text-foreground' : 'bg-card text-card-foreground'}`}>
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
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </Button>
            <Button variant="destructive" onClick={handleClearMessages}>Clear Chat</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
