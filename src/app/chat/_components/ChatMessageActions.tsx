'use client';

import { useState } from 'react';
import { Check, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageActionsProps {
  message: string;
}

export function ChatMessageActions({ message }: ChatMessageActionsProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = () => {
    if (hasCopied) return;

    navigator.clipboard.writeText(message);
    setHasCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
      <Button
        onClick={onCopy}
        variant="ghost"
        size="icon"
        className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl hover:scale-110 transition-all duration-300"
      >
        {hasCopied ? (
          <Check className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
        ) : (
          <Clipboard className="h-3 w-3 md:h-4 md:w-4" />
        )}
        <span className="sr-only">Copy message</span>
      </Button>
    </div>
  );
}
