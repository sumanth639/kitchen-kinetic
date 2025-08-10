'use client';

import { FormEvent, KeyboardEvent } from 'react';
import { Send, Loader2, Zap } from 'lucide-react';
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
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !isAwaitingResponse &&
      input.trim()
    ) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }
  };

  return (
    <CardFooter className="border-none bg-gradient-to-t from-background via-background/95 to-background/90 backdrop-blur-md p-3 md:p-6">
      <div className="w-full max-w-4xl mx-auto">
        <form onSubmit={onSubmit} className="relative">
          <div className="hidden md:block absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

          <div className="relative flex items-center gap-1 md:gap-2 bg-background/80 backdrop-blur-sm rounded-full border border-border/40 md:border-2 shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl focus-within:border-primary/60 focus-within:shadow-xl md:focus-within:shadow-2xl transition-all duration-300 group">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAwaitingResponse
                    ? 'AI is thinking...'
                    : 'Ask about recipes...'
                }
                disabled={isAwaitingResponse}
                className="border-none bg-transparent rounded-full px-4 md:px-6 py-3 md:py-8 text-sm md:text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 md:pr-20"
              />

              {input.length > 0 && !isAwaitingResponse && (
                <div className="hidden md:block absolute right-20 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50">
                  {input.length}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 md:gap-2 pr-1 md:pr-2">
              {!isAwaitingResponse && input.length === 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex rounded-full h-8 w-8 text-muted-foreground hover:text-primary transition-colors duration-200"
                  onClick={() =>
                    setInput("What's a quick and easy dinner recipe?")
                  }
                >
                  <Zap className="h-4 w-4" />
                </Button>
              )}

              <Button
                type="submit"
                disabled={isAwaitingResponse || !input.trim()}
                size="sm"
                className={`rounded-full h-9 w-9 md:h-10 md:w-10 transition-all duration-300 ${
                  input.trim() && !isAwaitingResponse
                    ? 'bg-primary hover:bg-primary/90 shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl hover:scale-105 text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isAwaitingResponse ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 md:mt-3 px-2 md:px-4">
            <p className="text-xs text-muted-foreground/70 md:hidden">
              Tap send or press Enter
            </p>
            {input.length > 500 && (
              <p className="text-xs text-orange-500">
                <span className="hidden md:inline">
                  Keep it concise for better responses
                </span>
                <span className="md:hidden">Too long</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </CardFooter>
  );
}
