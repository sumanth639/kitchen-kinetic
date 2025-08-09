// src/ai/flows/recipe-chat-flow.ts

'use server';

/**
 * @fileOverview A server-side flow for handling chat with a recipe assistant AI.
 * This file uses Genkit to create a streaming chat response.
 */

import { ai } from '@/ai/genkit';
import { Message } from '@genkit-ai/flow';
import { ChatInput } from './chat-types';
import { addMessageToChat } from '@/lib/firestore-utils';

/**
 * An exported async function that the client can call.
 * This function invokes the Genkit flow and returns its streaming output.
 * @param input The user's chat input, including history and the new prompt.
 * @returns A ReadableStream of strings, representing the AI's response.
 */
export async function chatWithBot(
  input: ChatInput,
  userId: string,
  chatId: string
): Promise<ReadableStream<string>> {
  const model = 'googleai/gemini-1.5-flash-latest';

  const systemPrompt =
    "You are a friendly and helpful recipe assistant named Kinetic. You can help users find recipes, suggest cooking ideas, and answer questions about cooking. Always try to be concise and helpful. Use markdown for formatting, like using '#' for titles and '**bold**' for emphasis. For lists of ingredients, present them as a comma-separated list inside a paragraph. For step-by-step instructions, use numbered lists. Ensure your responses are well-structured and easy to read.";

  // Map the chat history to the format expected by the model.
  const history: Message[] = input.history.map((msg) => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));

  // Add the new user prompt to the history.
  history.push({ role: 'user', content: [{ text: input.prompt }] });

  // Save the user's message to Firestore
  await addMessageToChat(userId, chatId, {
    role: 'user',
    content: input.prompt,
  });

  const { stream } = await ai.generateStream({
    model,
    system: systemPrompt,
    messages: history,
  });

  // Create a new stream that saves the model's response and also passes it through
  const passthroughStream = new TransformStream({
    async transform(chunk, controller) {
      controller.enqueue(chunk);
    },
    async flush(controller) {
      controller.terminate();
    },
  });

  const reader = stream.getReader();
  const writer = passthroughStream.writable.getWriter();
  let modelResponse = '';

  (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Save the full model response to Firestore
        await addMessageToChat(userId, chatId, {
          role: 'model',
          content: modelResponse,
        });
        writer.close();
        break;
      }
      modelResponse += value.text;
      writer.write(value);
    }
  })();

  // Create a new stream that just contains the text chunks
  const textStream = new ReadableStream({
    async start(controller) {
      const reader = passthroughStream.readable.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.text) {
            controller.enqueue(value.text);
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
