// src/app/chat/page.tsx

'use client';

import { useRef } from 'react';
import { Sparkles, PanelLeft } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

import { ChatHistory } from './_components/ChatHistory';
import { MessageList } from './_components/MessageList';
import { ChatInput } from './_components/ChatInput';
import { useChat } from './_hooks/useChat';

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    activeChatId,
    messages,
    input,
    setInput,
    isSidebarOpen,
    setSidebarOpen,
    isAwaitingResponse,
    isLoading,
    handleSetActiveChatId,
    handleRenameChat,
    handleDeleteChat,
    handleNewChat,
    handleSubmit,
  } = useChat(scrollAreaRef);

  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-64 lg:w-72 border-r">
        <ChatHistory
          sessions={sessions}
          activeChatId={activeChatId}
          setActiveChatId={handleSetActiveChatId}
          onRename={handleRenameChat}
          onDelete={handleDeleteChat}
          onNewChat={handleNewChat}
          isSidebarOpen={true}
        />
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        <Card className="w-full h-full flex flex-col shadow-none border-0 rounded-none">
          <CardHeader className="border-b flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mobile Sidebar Trigger */}
              <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <PanelLeft className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <ChatHistory
                    sessions={sessions}
                    activeChatId={activeChatId}
                    setActiveChatId={(id) => {
                      handleSetActiveChatId(id);
                      setSidebarOpen(false);
                    }}
                    onRename={handleRenameChat}
                    onDelete={handleDeleteChat}
                    onNewChat={() => {
                      handleNewChat();
                      setSidebarOpen(false);
                    }}
                    isSidebarOpen={isSidebarOpen}
                  />
                </SheetContent>
              </Sheet>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span>Kinetic</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
              <MessageList
                messages={messages}
                isLoading={isLoading}
                isAwaitingResponse={isAwaitingResponse}
                activeChatId={activeChatId}
                user={user}
              />
            </ScrollArea>
          </CardContent>
          <ChatInput
            input={input}
            setInput={setInput}
            isAwaitingResponse={isAwaitingResponse}
            onSubmit={handleSubmit}
          />
        </Card>
      </main>
    </div>
  );
}
