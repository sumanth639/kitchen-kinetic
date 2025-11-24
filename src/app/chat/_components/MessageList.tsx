'use client';

import { User } from 'firebase/auth';
import { Zap } from 'lucide-react';
import rehypeRaw from "rehype-raw";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/ai/flows/chat-types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isAwaitingResponse: boolean;
  activeChatId: string | null;
  user: User;
}

export function MessageList({
  messages,
  isLoading,
  isAwaitingResponse,
}: MessageListProps) {

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <Zap className="h-10 w-10 animate-pulse text-muted-foreground/20" />
      </div>
    );
  }

  if (messages.length === 0 && !isLoading && !isAwaitingResponse) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted/30 p-4 mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">How can I help you cook today?</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 ">
      {messages.map((message, index) => {
        if (message.role === 'model' && !message.content) return null;
        const isUser = message.role === 'user';

        return (
          <div
            key={index}
            className={`group flex w-full gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar */}
            {!isUser && (
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-background border border-border/40 shadow-sm">
                <Zap className="h-4 w-4 text-primary" />
              </div>
            )}

            <div className={`relative max-w-[85%] md:max-w-[90%] ${isUser ? 'ml-auto' : ''}`}>
              <div
                className={`
                  prose prose-neutral dark:prose-invert
                  text-base leading-7
                  max-w-[80vw] md:max-w-[60ch]
                  break-words
                  prose-pre:whitespace-pre-wrap
                  ${isUser 
                    ? 'bg-secondary/50 px-5 py-3 rounded-3xl text-primary' 
                    : ''
                  }
                `}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // --- CUSTOM HEADERS (Highlights Ingredients/Instructions) ---
                    h1: ({ node, ...props }) => (
                      <h1 {...props} className="text-3xl font-bold text-primary mb-4 mt-2" />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 {...props} className="text-2xl font-semibold text-foreground mb-3 mt-6" />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 
                        {...props} 
                        // Highlighting Ingredients/Instructions
                        className="text-xl md:text-2xl font-bold text-foreground/90 mt-8 mb-4 border-b border-border/60 pb-2" 
                      />
                    ),

                    // --- TABLES (Ingredients) ---
                    table: ({ node, ...props }) => (
                      <div className="my-2 overflow-x-auto rounded-md border">
                        <table {...props} className="w-full text-sm" />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead {...props} className="bg-muted/50 font-medium" />
                    ),
                    th: ({ node, ...props }) => (
                      <th {...props} className="px-4 py-2 text-left" />
                    ),
                    td: ({ node, ...props }) => (
                      <td {...props} className="px-4 py-1 border-t align-middle" />
                    ),
                    a: ({ node, ...props }) => (
                      <a {...props} className="text-blue-500 hover:underline" target="_blank" />
                    ),
                  }}
                >
                  {message.content ?? ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}

      {isAwaitingResponse && (
        <div className="flex gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border">
             <Zap className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-1 py-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce delay-0"></span>
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce delay-150"></span>
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce delay-300"></span>
          </div>
        </div>
      )}
    </div>
  );
}