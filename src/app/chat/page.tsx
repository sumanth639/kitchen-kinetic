// src/app/chat/page.tsx

'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles } from 'lucide-react';
import { chatWithBot } from '@/ai/flows/recipe-chat-flow';
import { ChatMessage, ChatInput } from '@/ai/flows/chat-types';
import DOMPurify from 'dompurify';

// A simple markdown to HTML converter
const markdownToHtml = (text: string) => {
  let html = text
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^\s*-\s(.*)/gm, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\n<ul>/g, '\n') // Combine lists
    // Ordered lists
    .replace(/^\s*\d+\.\s(.*)/gm, '<ol><li>$1</li></ol>')
    .replace(/<\/ol>\n<ol>/g, '\n'); // Combine lists

  // Paragraphs
  html = html
    .split('\n\n')
    .map((p) =>
      p.trim().startsWith('<') && p.trim().endsWith('>') ? p : `<p>${p}</p>`
    )
    .join('');

  return html;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = input;
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = {
        // Pass the message history, excluding the latest user message which is part of the prompt
        history: messages,
        prompt: currentPrompt,
      };

      const stream = await chatWithBot(chatInput);
      let modelResponse = '';
      let firstChunk = true;

      const reader = stream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        modelResponse += value;

        if (firstChunk) {
          // On the first chunk, replace the loading indicator with the new message
          setMessages((prev) => [
            ...prev,
            { role: 'model', content: modelResponse },
          ]);
          firstChunk = false;
        } else {
          // On subsequent chunks, update the last message
          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, content: modelResponse }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error during chat:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      <Card className="w-full h-full flex flex-col shadow-2xl">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>AI Recipe Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground">
                  <p>Ask me anything about recipes or cooking!</p>
                  <p className="text-sm">
                    For example: "How do I make pancakes?"
                  </p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'model' && (
                    <Avatar>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div
                      className="prose dark:prose-invert prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2"
                      dangerouslySetInnerHTML={{
                        __html:
                          message.role === 'user'
                            ? message.content
                            : DOMPurify.sanitize(
                                markdownToHtml(message.content)
                              ),
                      }}
                    />
                  </div>
                  {message.role === 'user' && (
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'model' && (
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted flex items-center">
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
