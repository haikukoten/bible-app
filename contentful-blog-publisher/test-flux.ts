import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { generateCoverImageBuffer } from './src/openai.js';

async function main() {
  if (!process.env.BFL_API_KEY) {
    console.error('Error: BFL_API_KEY is not set in .env');
    process.exit(1);
  }

  console.log('Testing BFL FLUX image generation...');
  const excerpt = 'A peaceful serene sunrise over a quiet lake with a lone boat, reflecting the morning light.';
  
  try {
    const { buffer, mimeType } = await generateCoverImageBuffer({ excerpt, title: 'Test Image' });
    
    const ext = mimeType.split('/')[1] || 'jpeg';
    const filePath = path.join(process.cwd(), `test-flux-output.${ext}`);
    
    await fs.writeFile(filePath, buffer);
    console.log(`Success! Image saved to ${filePath}`);
  } catch (error) {
    console.error('Failed to generate image:', error);
  }
}

main();
