import * as genkit from '@genkit-ai/core';
import {
  StreamPart,
  generate,
  GenerationOptions,
  Part,
} from '@genkit-ai/flow';
import { googleAI } from '@genkit-ai/googleai';

genkit.configure({
  plugins: [
    googleAI({
      apiNamespace: 'googleai', // or customize namespace
      streaming: true, // Enable streaming
    }),
  ],
  flowStateStore: 'firestore', // Or any other Genkit FlowStateStore
});

export const chatFlow = genkit.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
        required: ['text'],
      },
    },
    outputSchema: {
      type: 'string',
    },
  },
  async (input) => {
    const lastMessage = input[input.length - 1];

    const response = await generate({
      model: googleAI['gemini-1.5-flash-latest'],
      prompt: {
        text: lastMessage.text,
      },
      options: {
        streaming: true,
      } as GenerationOptions, // Explicitly cast to GenerationOptions
    });

    let fullText = '';
    for await (const chunk of response.stream()) {
      const part = chunk as StreamPart; // Cast to StreamPart

      if (part.text) {
        fullText += part.text;
      }
    }

    return fullText;
  }
);