// src/ai/flows/chat-types.ts

import { z } from 'zod';

/**
 * Represents a single message in the chat, which can be from a 'user' or a 'model'.
 */
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Defines the schema for the input to the chat flow.
 * It expects a history of previous messages and the new user prompt.
 */
export const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ),
  prompt: z.string(),
});

/**
 * The type for the chat input, inferred from the Zod schema.
 */
export type ChatInput = z.infer<typeof ChatInputSchema>;
