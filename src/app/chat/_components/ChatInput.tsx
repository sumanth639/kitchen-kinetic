// src/app/chat/_components/ChatInput.tsx

'use client';

import { FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardFooter } from '@/components/ui/card';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isAwaitingResponse: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({
  input,
  setInput,
  isAwaitingResponse,
  onSubmit,
}: ChatInputProps) {
  return (
    <CardFooter className="border-t pt-6">
      <form onSubmit={onSubmit} className="flex w-full gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a recipe..."
          disabled={isAwaitingResponse}
        />
        <Button type="submit" disabled={isAwaitingResponse || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </CardFooter>
  );
}
