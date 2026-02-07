'use client';

import { ChevronsLeft, ChevronsRight, PanelLeft, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChatHistory } from './ChatHistory';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showDesktopSidebar: boolean;
  setShowDesktopSidebar: (show: boolean) => void;
  sessions: any[];
  activeChatId: string | null;
  handleSetActiveChatId: (id: string | null) => void;
  handleRenameChat: (id: string, title: string) => Promise<void>;
  handleDeleteChat: (id: string) => Promise<void>;
  handleNewChat: () => void;
}

export function ChatHeader({
  isSidebarOpen,
  setSidebarOpen,
  showDesktopSidebar,
  setShowDesktopSidebar,
  sessions,
  activeChatId,
  handleSetActiveChatId,
  handleRenameChat,
  handleDeleteChat,
  handleNewChat,
}: ChatHeaderProps) {
  const activeTitle = sessions.find((s) => s.id === activeChatId)?.title || 'New Chat';

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        {/* Mobile Toggle */}
        <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 pt-4">
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

        {/* Desktop Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden text-muted-foreground md:flex"
          onClick={() => setShowDesktopSidebar(!showDesktopSidebar)}
        >
          {showDesktopSidebar ? (
            <ChevronsLeft className="h-5 w-5" />
          ) : (
            <ChevronsRight className="h-5 w-5" />
          )}
        </Button>

        <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
          {activeTitle}
        </span>
      </div>

      <Button variant="ghost" size="icon" onClick={handleNewChat}>
        <PenSquare className="h-5 w-5 text-muted-foreground" />
      </Button>
    </header>
  );
}
