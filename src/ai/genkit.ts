import { genkit, getPlugin, setPlugin } from 'genkit';
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
  // Log level is set to 'warn' to reduce verbosity in production.
  // In a development environment, this could be set to 'debug' for more detailed logs.
  logLevel: 'warn',
  // The flow state is stored in memory. For production applications,
  // it's recommended to use a persistent storage solution like Firestore
  // to maintain flow state across sessions and application restarts.
  flowStateStore: 'memory',
  // Similarly, trace data is stored in memory. For production,
  // exporting traces to a system like Google Cloud Trace is advisable
  // for better monitoring and debugging capabilities.
  traceStore: 'memory',
});
