'use client'

import { useRef, useState } from 'react'
import { PanelLeft, PenSquare } from 'lucide-react'
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

export default function ChatClient() {
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
  } = useChat(scrollAreaRef)

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
                    handleSetActiveChatId(id)
                    setSidebarOpen(false)
                  }}
                  onRename={handleRenameChat}
                  onDelete={handleDeleteChat}
                  onNewChat={() => {
                    handleNewChat()
                    setSidebarOpen(false)
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
              <PanelLeft className="h-5 w-5" />
            </Button>

            <span className="text-sm font-medium text-muted-foreground">Kitchen Kinetic 2.5</span>
          </div>

          <Button variant="ghost" size="icon" onClick={handleNewChat}>
            <PenSquare className="h-5 w-5 text-muted-foreground" />
          </Button>
        </header>

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

        {/* FLOATING INPUT CONTAINER */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pb-6 pt-10">
          <div className="mx-auto max-w-3xl px-4">
            <ChatInput 
              input={input} 
              setInput={setInput} 
              isAwaitingResponse={isAwaitingResponse} 
              onSubmit={handleSubmit} 
            />
             <div className="mt-2 text-center text-xs text-muted-foreground/50">
               AI can make mistakes. Check important info.
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}