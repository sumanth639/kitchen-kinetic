import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
    console.log('.env.local not found at', envPath);
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY; // Fallback attempts
  
  if (!apiKey) {
    console.error('No API key found in env!');
    process.exit(1);
  }
  
  console.log('Using API Key ending in...', apiKey.slice(-4));

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log('Fetching models from:', url.replace(apiKey, 'API_KEY'));

  try {
      const response = await fetch(url);
      if (!response.ok) {
         console.error('Failed to list models:', response.status, await response.text());
         return;
      }
      
      const data = await response.json();
      console.log('\nAvailable Gemini Models:');
      const models = (data).models || [];
      const geminiModels = models.filter((m: any) => m.name.toLowerCase().includes('gemini'));
      
      if (geminiModels.length === 0) {
          console.log('No Gemini models found. All models:', models.map((m:any) => m.name).join(', '));
      } else {
        geminiModels.forEach((m: any) => {
            console.log(`- ${m.name}`);
            console.log(`  Display: ${m.displayName}`);
            console.log(`  Supported Methods: ${JSON.stringify(m.supportedGenerationMethods)}`);
            console.log('---');
        });
      }
  } catch (err) {
      console.error('Error fetching models:', err);
  }
}

main().catch(console.error);
