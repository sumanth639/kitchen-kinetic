'use client';

import { FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { Loader2, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '56px'; // Reset to base height
      const scrollHeight = textarea.scrollHeight;
      
      // Grow until 200px, then allow scroll
      if (scrollHeight > 200) {
         textarea.style.height = '200px';
         textarea.style.overflowY = 'auto';
      } else {
         textarea.style.height = `${scrollHeight}px`;
         textarea.style.overflowY = 'hidden';
      }
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isAwaitingResponse && input.trim()) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="w-full relative">
      <form onSubmit={onSubmit} className="relative flex w-full items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Kitchen Kinetic..."
          disabled={isAwaitingResponse}
          // Added 'overflow-hidden' and 'no-scrollbar'
          className="min-h-[56px] w-full rounded-3xl border-border/40 bg-muted/40 px-6 py-4 pr-12 text-base shadow-sm backdrop-blur-sm focus-visible:ring-0 focus-visible:ring-offset-0 resize-none overflow-hidden no-scrollbar dark:bg-muted/20"
          autoComplete="off"
          rows={1}
        />

        <Button
          type="submit"
          disabled={isAwaitingResponse || !input.trim()}
          size="icon"
          className="absolute right-2 bottom-2 h-10 w-10 rounded-full transition-all"
        >
          {isAwaitingResponse ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}