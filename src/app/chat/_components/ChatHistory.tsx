// src/app/chat/_components/ChatHistory.tsx

'use client';

import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSession } from '@/types/index';

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  isSidebarOpen: boolean;
}

export function ChatHistory({
  sessions,
  activeChatId,
  setActiveChatId,
}: ChatHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setActiveChatId(null)}
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.map((session) => (
          <Button
            key={session.id}
            variant={activeChatId === session.id ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            onClick={() => setActiveChatId(session.id)}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="truncate">{session.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
