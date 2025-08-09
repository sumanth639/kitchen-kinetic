// src/ai/flows/recipe-chat-flow.ts

'use server';

/**
 * @fileOverview A server-side flow for handling chat with a recipe assistant AI.
 * This file uses Genkit to create a streaming chat response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ChatInput, ChatInputSchema, ChatMessage } from './chat-types';

/**
 * Defines the main chat flow using Genkit.
 * This flow is responsible for generating a response from the AI model based on the chat history.
 * It's a streaming flow, so it returns chunks of text as they are generated.
 */
export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(), // Each chunk of the stream is a string
  },
  async ({ history, prompt }) => {
    const model = 'googleai/gemini-1.5-flash-latest';

    const systemPrompt =
      'You are a friendly and helpful recipe assistant. You can help users find recipes, suggest cooking ideas, and answer questions about cooking. Your name is Kinetic. Always try to be concise and helpful.';

    // The history needs to be mapped to the format the model expects.
    const fullHistory = history.map((msg) => ({
      role: msg.role,
      content: [{ text: msg.content }],
    }));

    // Add the new user prompt to the history
    fullHistory.push({ role: 'user', content: [{ text: prompt }] });

    const { stream } = await ai.generateStream({
      model,
      prompt: {
        system: systemPrompt,
        messages: fullHistory,
      },
    });

    // Return the stream of text chunks
    return stream.text();
  }
);

/**
 * An exported async function that the client can call.
 * This function invokes the Genkit flow and returns its streaming output.
 * @param input The user's chat input, including history and the new prompt.
 * @returns A ReadableStream of strings, representing the AI's response.
 */
export async function chatWithBot(
  input: ChatInput
): Promise<ReadableStream<string>> {
  return await chatFlow(input);
}
