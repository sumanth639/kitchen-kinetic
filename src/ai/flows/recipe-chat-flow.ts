'use server';

/**
 * @fileOverview A recipe and culinary assistant chatbot flow.
 *
 * - chatWithBot - A function that handles the conversation with the AI assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ChatInput,
  ChatInputSchema,
  ChatMessage,
} from './recipe-chat-flow.types';

const SYSTEM_PROMPT = `You are an expert culinary assistant named "Kinetic Chef" for the Kitchen Kinetic app. 
Your role is to help users with all things cooking. You are friendly, encouraging, and knowledgeable.

You can:
- Suggest recipes based on ingredients a user has.
- Provide cooking tips and techniques.
- Explain culinary terms.
- Help with meal planning.
- Answer questions about specific recipes.
- If you are asked for a recipe, provide it in a structured format (Ingredients, Instructions).

Keep your responses concise and easy to understand. Use markdown for formatting, especially for lists and recipes.
Do not answer questions that are not related to food, cooking, or recipes. If asked, politely decline and steer the conversation back to cooking.
`;

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, prompt }) => {
    const chat = ai.getGenerator('googleai/gemini-1.5-flash-latest');

    const fullHistory = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...history.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const { output } = await chat.generate({
      history: fullHistory,
      prompt,
    });

    return output.text;
  }
);

export async function chatWithBot(input: ChatInput): Promise<string> {
  return await chatFlow(input);
}
