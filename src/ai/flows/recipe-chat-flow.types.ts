/**
 * @fileOverview Type definitions for the recipe chat flow.
 */

import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  prompt: z.string().describe('The latest message from the user.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;
