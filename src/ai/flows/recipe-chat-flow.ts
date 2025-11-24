'use server';

import { ai } from '@/ai/genkit';
import { ChatInput } from './chat-types';

export async function chatWithBot(
  input: ChatInput
): Promise<ReadableStream<Uint8Array>> {
  // ✅ FIXED: Using the current Stable Flash model for Nov 2025
  const model = 'googleai/gemini-2.5-flash-lite';

  const systemPrompt =
    "You are a friendly and helpful recipe assistant named Kinetic. Use markdown formatting.";

  const history = input.history.map((msg) => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));

  history.push({ role: 'user', content: [{ text: input.prompt }] });

  // Ensure you handle the stream correctly
  const { stream } = await ai.generateStream({
    model,
    system: systemPrompt,
    messages: history,
  });

  // ... rest of your streaming code ...
  const textStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      }
  });
  
  return textStream;
}