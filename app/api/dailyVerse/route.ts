import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const GPT4_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const GPT4_API_KEY = process.env.OPENAI_API_KEY;

async function generateVerse(date: string): Promise<{ verse: string, book: string, chapter: number, verse_number: number }> {
  try {
    const response = await axios.post(
      GPT4_API_ENDPOINT,
      {
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant. The current date is ${date}. You help users by generating an inspirational Bible verse, including the book name, chapter, and verse number. Generate the verse based on a significant historical or cultural event that aligns with this date, but do not mention the event in your output.`
          },
          {
            role: 'user',
            content: `Generate an inspirational Bible verse that aligns with today's date, and provide it in a structured JSON format. The output should look like:
            {
              "verse": "The inspirational verse content.",
              "book": "The name of the Bible book.",
              "chapter": "The chapter number as an integer.",
              "verse_number": "The verse number as an integer."
            }`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'query',
              description: 'Execute a query.',
              strict: true,
              parameters: {
                type: 'object',
                properties: {
                  table_name: {
                    type: 'string',
                    enum: ['orders'] // Not relevant for your use-case, but included for syntax matching
                  },
                  columns: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: [
                        'id',
                        'status',
                        'expected_delivery_date',
                        'delivered_at',
                        'shipped_at',
                        'ordered_at',
                        'canceled_at'
                      ]
                    }
                  },
                  conditions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        column: {
                          type: 'string'
                        },
                        operator: {
                          type: 'string',
                          enum: ['=', '>', '<', '>=', '<=', '!=']
                        },
                        value: {
                          anyOf: [
                            {
                              type: 'string'
                            },
                            {
                              type: 'number'
                            },
                            {
                              type: 'object',
                              properties: {
                                column_name: {
                                  type: 'string'
                                }
                              },
                              required: ['column_name'],
                              additionalProperties: false
                            }
                          ]
                        }
                      },
                      required: ['column', 'operator', 'value'],
                      additionalProperties: false
                    }
                  },
                  order_by: {
                    type: 'string',
                    enum: ['asc', 'desc']
                  }
                },
                required: ['table_name', 'columns', 'conditions', 'order_by'],
                additionalProperties: false
              }
            }
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${GPT4_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseContent = response.data.choices[0].message.content.trim();

    // Parse the JSON output from GPT-4
    const jsonResponse = JSON.parse(responseContent);

    return {
      verse: jsonResponse.verse,
      book: jsonResponse.book,
      chapter: jsonResponse.chapter,
      verse_number: jsonResponse.verse_number,
    };

  } catch (error: unknown) {
    const err = error as any;
    console.error('Error generating verse:', err.response?.data || err.message);
    return {
      verse: 'Failed to generate verse',
      book: 'N/A',
      chapter: 0,
      verse_number: 0,
    };
  }
}


// Named export for the POST request
export async function POST() {
  const date = new Date().toISOString().split('T')[0];

  try {
    const verse = await generateVerse(date);

    // Directly write the verse object to the file
    const filePath = path.join(process.cwd(), 'public', 'dailyVerse.json');
    fs.writeFileSync(filePath, JSON.stringify(verse, null, 2)); 

    return NextResponse.json({ message: 'Daily verse generated and saved successfully' });
  } catch (error) {
    console.error('Error generating daily verse:', error);
    return NextResponse.json({ message: 'Failed to generate daily verse' }, { status: 500 });
  }
}

// Optional: Handle unsupported methods
export async function GET() {
  return NextResponse.json({ message: 'Method GET Not Allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method PUT Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method DELETE Not Allowed' }, { status: 405 });
}
