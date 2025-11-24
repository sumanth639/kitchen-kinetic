'use client';

import { User } from 'firebase/auth';
import { Zap } from 'lucide-react';
import rehypeRaw from "rehype-raw";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage } from '@/ai/flows/chat-types';
import { ChatMessageActions } from './ChatMessageActions';

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
  activeChatId,
  user,
}: MessageListProps) {

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-48 mx-auto rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-32 mx-auto rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading && !isAwaitingResponse) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-6">
        <div className="mt-8 space-y-3">
          <h3 className="text-xl font-semibold text-foreground">
            {activeChatId ? 'Ready to chat!' : 'Start your culinary journey'}
          </h3>
          <p className="text-base max-w-md">
            {activeChatId
              ? 'Send a message to continue the conversation.'
              : 'Ask me anything about recipes, cooking techniques, or meal planning.'}
          </p>
        </div>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="space-y-4 md:space-y-8 p-3 md:p-6 pb-4 md:pb-12">
      {messages.map((message, index) => {
        if (message.role === 'model' && !message.content) return null;

        return (
          <div
            key={index}
            className={`flex gap-2 md:gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-in slide-in-from-bottom-4 duration-500`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {message.role === 'model' && (
              <Avatar className="border border-border/30 shadow-sm h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                <AvatarFallback className="bg-muted">
                  <Zap className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={`group relative max-w-[90%] md:max-w-[80%] ${
                message.role === 'user' ? 'order-first' : ''
              }`}
            >
              <div
                className={`
                  rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-5
                  shadow-sm transition-all duration-150
                  max-w-none break-words space-y-3
                  [&_p]:leading-relaxed
                  [&_hr]:my-6 [&_hr]:border-border

                  overflow-hidden will-change-transform
                  ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto shadow-md'
                      : 'bg-background/95 border border-border/60 shadow-sm backdrop-blur-sm'
                  }
                `}
              >
                <div className="animate-message will-change-auto">
                  <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw]}   // THIS ENABLES HTML LISTS
  components={{
    h1: ({ node, ...props }) => (
      <h1 className="text-2xl font-bold mb-3" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
    ),

    ul: ({ node, ...props }) => {
      const className = props.className || "";

      if (className.includes("ingredients")) {
        return <ul {...props} className="ingredients" />;
      }

      return <ul {...props} className="instructions space-y-3 list-none" />;
    },

    img: ({ alt }) => (
      <img
        src="/recipe-placeholder.jpg"
        alt={alt || "Recipe Image"}
        className="rounded-lg mb-4 w-full max-h-64 object-cover"
      />
    ),
  }}
>
  {message.content ?? ""}
</ReactMarkdown>
                </div>
              </div>

              {message.role === 'model' && message.content && (
                <ChatMessageActions message={message.content} />
              )}
            </div>

            {message.role === 'user' && (
              <Avatar className="border border-border/30 shadow-sm h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                <AvatarFallback className="bg-muted text-foreground font-semibold text-xs md:text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}

      {isAwaitingResponse && (!lastMessage || lastMessage.role !== 'model') && (
        <div className="flex gap-2 md:gap-4 justify-start animate-in slide-in-from-bottom-4 duration-500">
          <Avatar className="border border-border/30 shadow-sm h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
            <AvatarFallback className="bg-muted">
              <Zap className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </AvatarFallback>
          </Avatar>

          <div className="rounded-2xl px-4 py-3 bg-muted/40 border border-border/40">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs font-medium text-muted-foreground animate-pulse">
                Thinking...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
