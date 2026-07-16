

const key = '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';

async function testMiniMax() {
  console.log('Testing MiniMax...');
  const res = await fetch('https://api.minimax.io/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'MiniMax-M3',
      messages: [{role: 'user', content: 'Hello'}],
    })
  });
  const data = await res.json();
  console.log('MiniMax response:', data);
}

async function testOpenAI() {
  console.log('Testing OpenAI...');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{role: 'user', content: 'Hello'}],
    })
  });
  const data = await res.json();
  console.log('OpenAI response:', data);
}

async function run() {
  await testMiniMax();
  await testOpenAI();
}

run();
