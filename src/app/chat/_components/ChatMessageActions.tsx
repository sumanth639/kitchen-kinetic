// src/app/chat/_components/ChatMessageActions.tsx

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
    <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button onClick={onCopy} variant="ghost" size="icon" className="h-7 w-7">
        {hasCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Clipboard className="h-4 w-4" />
        )}
        <span className="sr-only">Copy message</span>
      </Button>
    </div>
  );
}
