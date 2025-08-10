// src/app/chat/_components/MessageList.tsx

'use client';

import DOMPurify from 'dompurify';
import { User } from 'firebase/auth';
import { MessageSquare } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { ChatMessage } from '@/ai/flows/chat-types';
import { markdownToHtml } from '../_utils/markdown';
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
      <div className="text-center text-muted-foreground pt-10">
        <Skeleton className="h-12 w-12 mx-auto rounded-full" />
        <Skeleton className="h-4 w-48 mx-auto mt-4" />
        <Skeleton className="h-4 w-32 mx-auto mt-2" />
      </div>
    );
  }

  if (messages.length === 0 && !isLoading && !isAwaitingResponse) {
    return (
      <div className="text-center text-muted-foreground pt-10">
        <MessageSquare className="mx-auto h-12 w-12" />
        <p className="text-lg mt-4">
          {activeChatId
            ? 'Send a message to start the conversation.'
            : 'Start a new chat!'}
        </p>
        <p className="text-sm">Ask anything about recipes or cooking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
            className={`group relative rounded-lg px-4 py-2 max-w-[80%] ${
              message.role === 'user' ? 'bg-primary text-white' : 'bg-muted'
            }`}
          >
            <div
              className="prose dark:prose-invert prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2"
              dangerouslySetInnerHTML={{
                __html:
                  message.role === 'user'
                    ? message.content
                    : DOMPurify.sanitize(markdownToHtml(message.content)),
              }}
            />
            {message.role === 'model' && message.content && (
              <ChatMessageActions message={message.content} />
            )}
          </div>
          {message.role === 'user' && (
            <Avatar>
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      {isAwaitingResponse && (
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
            <div className="flex items-center space-x-1 p-2">
              <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
