'use client';

import { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, Loader2, Bot, User, Circle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { chatWithBot } from '@/ai/flows/recipe-chat-flow';
import { ChatMessage } from '@/ai/flows/recipe-chat-flow.types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    setIsPending(true);
    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      const stream = await chatWithBot({
        history: messages,
        prompt: input,
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let botMessageContent = '';
      let botMessage: ChatMessage = { role: 'model', content: '' };

      // Add the initial empty bot message
      setMessages((prev) => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        botMessageContent += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === prev.length - 1
              ? { ...msg, content: botMessageContent }
              : msg
          )
        );
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get a response from the assistant.',
        variant: 'destructive',
      });
      // Remove the empty bot message on error
      setMessages((prev) => prev.slice(0, prev.length -1));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot />
            Kinetic Chef Assistant
          </CardTitle>
        </CardHeader>
        <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p>Ask me anything about cooking!</p>
              <p className="text-xs">
                e.g., "What can I make with chicken and broccoli?"
              </p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div
                  className="prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }}
                />
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {isPending && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex items-start gap-4 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 bg-muted p-3 rounded-lg">
                <Circle className="h-2 w-2 animate-pulse" />
                <Circle className="h-2 w-2 animate-pulse [animation-delay:0.2s]" />
                <Circle className="h-2 w-2 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </CardContent>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="relative">
            <Label htmlFor="chat-input" className="sr-only">
              Enter your message
            </Label>
            <Input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a culinary question..."
              className="pr-16 h-12"
              disabled={isPending}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-12"
              disabled={isPending || !input.trim()}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CornerDownLeft className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
