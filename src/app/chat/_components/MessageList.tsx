'use client';

import DOMPurify from 'dompurify';
import { User } from 'firebase/auth';
import { Zap } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { ChatMessage } from '@/ai/flows/chat-types';
import { markdownToHtml } from '../../../lib/markdown';
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

  // Get the last message for Thinking... control
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="space-y-4 md:space-y-8 p-3 md:p-6 pb-4 md:pb-12">
      {messages.map((message, index) => {
        // Do not render a model (assistant) message if its content is still empty (i.e., placeholder)
        if (message.role === 'model' && !message.content) {
          return null;
        }
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
              className={`group relative max-w-[85%] md:max-w-[75%] ${
                message.role === 'user' ? 'order-first' : ''
              }`}
            >
              <div
                className={`rounded-2xl md:rounded-3xl px-3 py-2 md:px-6 md:py-4 shadow-md md:shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-lg md:hover:shadow-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ml-auto'
                    : 'bg-gradient-to-br from-background/80 to-muted/50 border border-border/50'
                }`}
              >
                <div
                  className={`prose dark:prose-invert prose-sm md:prose prose-p:my-1 md:prose-p:my-2 prose-headings:my-2 md:prose-headings:my-3 prose-ul:my-1 md:prose-ul:my-2 prose-ol:my-1 md:prose-ol:my-2 max-w-none ${
                    message.role === 'user' ? 'prose-invert' : ''
                  }`}
                  dangerouslySetInnerHTML={{
                    __html:
                      message.role === 'user'
                        ? message.content
                        : DOMPurify.sanitize(markdownToHtml(message.content)),
                  }}
                />
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
      {
        // Only show Thinking... if we're awaiting, AND there is not already a model response in progress
        isAwaitingResponse &&
          (!lastMessage ||
            lastMessage.role !== 'model' ||
            !lastMessage.content) && (
            <div className="flex gap-2 md:gap-4 justify-start animate-in slide-in-from-bottom-4 duration-500">
              <Avatar className="border border-border/30 shadow-sm h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                <AvatarFallback className="bg-muted">
                  <Zap className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl md:rounded-3xl px-3 py-2 md:px-6 md:py-4 bg-gradient-to-br from-background/80 to-muted/50 border border-border/50 shadow-md md:shadow-lg backdrop-blur-sm">
                <div className="flex items-center space-x-2 py-1 md:py-2">
                  <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-primary/60 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground animate-pulse">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )
      }
    </div>
  );
}
