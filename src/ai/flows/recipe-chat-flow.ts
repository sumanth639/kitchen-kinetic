// src/ai/flows/recipe-chat-flow.ts

'use server';

/**
 * @fileOverview A server-side flow for handling chat with a recipe assistant AI.
 * This file uses Genkit to create a streaming chat response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ChatInput, ChatInputSchema, ChatMessage } from './chat-types';
import { Message, generate } from '@genkit-ai/flow';

/**
 * An exported async function that the client can call.
 * This function invokes the Genkit flow and returns its streaming output.
 * @param input The user's chat input, including history and the new prompt.
 * @returns A ReadableStream of strings, representing the AI's response.
 */
export async function chatWithBot(
  input: ChatInput
): Promise<ReadableStream<string>> {
  const model = 'googleai/gemini-1.5-flash-latest';

  const systemPrompt =
    'You are a friendly and helpful recipe assistant. You can help users find recipes, suggest cooking ideas, and answer questions about cooking. Your name is Kinetic. Always try to be concise and helpful.';

  // Map the chat history to the format expected by the model.
  const history: Message[] = input.history.map((msg) => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));

  // Add the new user prompt to the history.
  history.push({ role: 'user', content: [{ text: input.prompt }] });

  const { stream } = await ai.generateStream({
    model,
    prompt: {
      system: systemPrompt,
      messages: history,
    },
  });

  // Create a new stream that just contains the text chunks
  const textStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.text) {
          controller.enqueue(chunk.text);
        }
      }
      controller.close();
    },
  });

  return textStream;
}
