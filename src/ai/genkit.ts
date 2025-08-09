import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize the Genkit AI platform with the Google AI plugin.
// This setup allows the application to use Google's generative AI models.
export const ai = genkit({
  plugins: [
    googleAI({
      // The API key for Google AI services is retrieved from environment variables.
      // It's crucial to keep this key secure and not expose it in the frontend code.
      // The '?? '' ' syntax provides a default empty string if the variable is not set.
      apiKey: process.env.GOOGLE_API_KEY ?? '',
    }),
  ],
});
