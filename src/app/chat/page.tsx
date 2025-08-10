// src/app/chat/page.tsx

'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Sparkles, MessageSquare, PanelLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { chatWithBot } from '@/ai/flows/recipe-chat-flow';
import { ChatMessage, ChatInput } from '@/ai/flows/chat-types';
import { ChatSession } from '@/types';
import {
  createChatSession,
  subscribeToChatSessions,
  subscribeToMessages,
  addMessageToChat,
  deleteChatSession,
  updateChatSessionTitle,
  updateLastMessageInChat,
} from '@/lib/firestore-utils';
import { ChatHistory } from './_components/ChatHistory';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatMessageActions } from './_components/ChatMessageActions';

// A simple markdown to HTML converter
const markdownToHtml = (text: string) => {
  let html = text
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\s*[\*-]\s(.*)/gm, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\n<ul>/g, '\n')
    .replace(/^\s*\d+\.\s(.*)/gm, '<ol><li>$1</li></ol>')
    .replace(/<\/ol>\n<ol>/g, '\n');

  html = html
    .split('\n\n')
    .map((p) =>
      p.trim().startsWith('<') && p.trim().endsWith('>') ? p : `<p>${p}</p>`
    )
    .join('');

  return html;
};

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChatSessions(
      user.uid,
      setSessions,
      (error) => {
        toast({
          title: 'Error loading chats',
          description: error.message,
          variant: 'destructive',
        });
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  useEffect(() => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToMessages(
      user.uid,
      activeChatId,
      (newMessages) => {
        setMessages(newMessages);
        setIsLoading(false);
      },
      (error) => {
        toast({
          title: 'Error loading messages',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, activeChatId, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleRenameChat = async (id: string, newTitle: string) => {
    if (!user) return;
    try {
      await updateChatSessionTitle(user.uid, id, newTitle);
      toast({ title: 'Chat renamed successfully.' });
    } catch (error) {
      console.error('Error renaming chat:', error);
      toast({
        title: 'Error renaming chat',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChat = async (id: string) => {
    if (!user) return;
    try {
      await deleteChatSession(user.uid, id);
      if (activeChatId === id) {
        setActiveChatId(null);
      }
      toast({ title: 'Chat deleted successfully.' });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: 'Error deleting chat',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const currentInput = input;
    setInput('');

    let currentChatId = activeChatId;

    // Add user message to local state immediately for better UX
    const userMessage: ChatMessage = {
      role: 'user',
      content: currentInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // If there's no active chat, create a new one.
      if (!currentChatId) {
        currentChatId = await createChatSession(user.uid, currentInput);
        setActiveChatId(currentChatId);
      }

      // Add user message to Firestore
      await addMessageToChat(user.uid, currentChatId, userMessage);

      const chatHistoryForAI: ChatMessage[] = messages.map(
        ({ role, content }) => ({
          role,
          content,
        })
      );

      const chatInput: ChatInput = {
        history: chatHistoryForAI,
        prompt: currentInput,
      };

      const stream = await chatWithBot(chatInput);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let modelResponse = '';
      let isFirstChunk = true;
      let modelMessageId: string | null = null;

      const read = async () => {
        const { done, value } = await reader.read();

        if (done) {
          if (modelMessageId) {
            await updateLastMessageInChat(
              user.uid,
              currentChatId!,
              modelMessageId,
              modelResponse
            );
          }
          return;
        }

        if (isFirstChunk) {
          setIsLoading(false);
          const modelPlaceholder: ChatMessage = { role: 'model', content: '' };
          const docRefId = await addMessageToChat(
            user.uid,
            currentChatId!,
            modelPlaceholder
          );
          modelMessageId = docRefId;
          setMessages((prev) => [...prev, modelPlaceholder]);
          isFirstChunk = false;
        }

        const chunk = decoder.decode(value, { stream: true });
        modelResponse += chunk;

        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content: modelResponse }
              : msg
          )
        );

        read();
      };
      await read();
    } catch (error) {
      console.error('Error during chat:', error);
      toast({
        title: 'Error',
        description: 'Sorry, something went wrong. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

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
          setActiveChatId={setActiveChatId}
          onRename={handleRenameChat}
          onDelete={handleDeleteChat}
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
                      setActiveChatId(id);
                      setSidebarOpen(false);
                    }}
                    onRename={handleRenameChat}
                    onDelete={handleDeleteChat}
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
              <div className="space-y-6 p-6">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground pt-10">
                    <MessageSquare className="mx-auto h-12 w-12" />
                    <p className="text-lg mt-4">
                      {activeChatId
                        ? 'Send a message to start the conversation.'
                        : 'Start a new chat!'}
                    </p>
                    <p className="text-sm">
                      Ask anything about recipes or cooking.
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
                      className={`group relative rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
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
                {isLoading && (
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
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a recipe..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
