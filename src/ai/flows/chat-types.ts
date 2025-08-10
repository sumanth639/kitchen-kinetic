import { z } from 'zod';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ),
  prompt: z.string(),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;
