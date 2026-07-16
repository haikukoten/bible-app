const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const key = process.env.OPENAI_API_KEY;

async function testDate(date) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: `You output only valid JSON (no markdown). Current date: ${date}. Suggest one short inspirational Bible verse: include exact verse text, book name, chapter and verse numbers as integers. Base the choice loosely on the calendar date; do not mention any historical event in the output.` }, { role: 'user', content: `Return a JSON object with keys: verse (string), book (string), chapter (number), verse_number (number).` }],
      max_tokens: 400,
      temperature: 0.6,
    }),
  });
  const data = await res.json();
  console.log(date, data.choices[0].message.content.trim());
}

async function run() {
  await testDate('2026-05-10');
  await testDate('2026-05-11');
  await testDate('2026-05-12');
}
run();
