'use server';

/**
 * @fileOverview A recipe and culinary assistant chatbot flow.
 *
 * - chatWithBot - A function that handles the conversation with the AI assistant.
 * - ChatInput - The input type for the chatWithBot function.
 * - ChatMessage - The type for a single chat message.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  prompt: z.string().describe('The latest message from the user.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

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
      ...history.map((msg) => ({
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
