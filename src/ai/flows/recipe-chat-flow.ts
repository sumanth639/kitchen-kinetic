'use server';

import { ai } from '@/ai/genkit';
import { Message } from '@genkit-ai/flow';
import { ChatInput } from './chat-types';

export async function chatWithBot(
  input: ChatInput
): Promise<ReadableStream<Uint8Array>> {
  const model = 'googleai/gemini-1.5-flash-latest';

  const systemPrompt =
    "You are a friendly and helpful recipe assistant named Kinetic. You can help users find recipes, suggest cooking ideas, and answer questions about cooking. Always try to be concise and helpful. Use markdown for formatting, like using '#' for titles and '**bold**' for emphasis. For lists of ingredients, present them as a comma-separated list inside a paragraph. For step-by-step instructions, use numbered lists. Ensure your responses are well-structured and easy to read.";

  const history: Message[] = input.history.map((msg) => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));

  history.push({ role: 'user', content: [{ text: input.prompt }] });

  const { stream } = ai.generateStream({
    model,
    system: systemPrompt,
    messages: history,
  });

  const textStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return textStream;
}
