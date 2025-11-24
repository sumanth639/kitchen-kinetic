//chatbot.ts
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.array(
      z.object({
        text: z.string(),
      })
    ),
    outputSchema: z.string(),
  },
  async (input) => {
    const lastMessage = input[input.length - 1];

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-lite',
      prompt: lastMessage.text,
    });

    return text;
  }
);