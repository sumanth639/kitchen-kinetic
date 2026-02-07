'use client'

import { useRef, useState } from 'react'
import { ChevronsLeft, ChevronsRight, PanelLeft, PenSquare } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatHistory } from './_components/ChatHistory'
import { MessageList } from './_components/MessageList'
import { ChatInput } from './_components/ChatInput'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/utils'
import { ChatHeader } from './_components/ChatHeader'

export default function ChatClient({ id }: { id?: string }) {
  const { user, loading: authLoading } = useAuth()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // State for Desktop Sidebar Toggle
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true)

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
  } = useChat(scrollAreaRef, id)

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Skeleton className="h-full w-full opacity-20" />
      </div>
    )
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <div 
        className={cn(
          "hidden border-r bg-muted/10 transition-all duration-300 md:flex md:flex-col",
          showDesktopSidebar ? "w-[260px] translate-x-0" : "w-0 -translate-x-full border-none overflow-hidden opacity-0"
        )}
      >
        <div className="flex-1 overflow-hidden py-2">
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
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        
        {/* HEADER: Toggle Buttons & Model Name */}
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showDesktopSidebar={showDesktopSidebar}
          setShowDesktopSidebar={setShowDesktopSidebar}
          sessions={sessions}
          activeChatId={activeChatId}
          handleSetActiveChatId={handleSetActiveChatId}
          handleRenameChat={handleRenameChat}
          handleDeleteChat={handleDeleteChat}
          handleNewChat={handleNewChat}
        />

        {/* MESSAGES SCROLL AREA */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full w-full" viewportRef={scrollAreaRef}>
            <div className="mx-auto max-w-3xl pb-32 pt-4"> {/* Added Padding Bottom for Input */}
              <MessageList
                messages={messages}
                isLoading={isLoading}
                isAwaitingResponse={isAwaitingResponse}
                activeChatId={activeChatId}
                user={user}
              />
            </div>
          </ScrollArea>
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pb-4 pt-10">
          <div className="mx-auto max-w-3xl px-4">
            <ChatInput
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isAwaitingResponse={isAwaitingResponse}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Recipes generated can vary. Always verify ingredients and portions.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}