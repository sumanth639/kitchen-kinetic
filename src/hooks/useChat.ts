// src/app/chat/_hooks/useChat.ts
'use client';

import { useState, useEffect, useCallback, FormEvent, RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, ChatInput } from '@/ai/flows/chat-types';
import {
  createChatSession,
  subscribeToChatSessions,
  subscribeToMessages,
  addMessageToChat,
  deleteChatSession,
  updateChatSessionTitle,
  updateLastMessageInChat,
} from '@/lib/firestore-utils';
import { chatWithBot } from '@/ai/flows/recipe-chat-flow';
import { ChatSession } from '@/types';

export function useChat(scrollRef: RefObject<HTMLDivElement>) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Subscribe to chat sessions for user
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToChatSessions(
      user.uid,
      setSessions,
      (error) => {
        toast({
          title: 'Unable to load chat list',
          description: 'Please check your internet connection and try again.',
          variant: 'destructive',
        });
      }
    );
    return () => unsubscribe();
  }, [user, toast]);

  // Subscribe to messages for active chat
  useEffect(() => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    const unsubscribe = subscribeToMessages(
      user.uid,
      activeChatId,
      (msgs) => {
        setMessages(msgs);
        setIsLoading(false);
      },
      (error) => {
        toast({
          title: 'Unable to load chat messages',
          description: 'Check your connection or try selecting another chat.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user, activeChatId, toast]);

  // Auto scroll to bottom on change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isAwaitingResponse, scrollRef]);

  // Set active chat handler
  const handleSetActiveChatId = useCallback((id: string | null) => {
    setActiveChatId(id);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const handleRenameChat = async (id: string, title: string) => {
    if (!user) return;
    try {
      await updateChatSessionTitle(user.uid, id, title);
      toast({ title: 'Chat renamed successfully.' });
    } catch {
      toast({
        title: 'Failed to rename chat',
        description: 'Please try again later or refresh the page.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChat = async (id: string) => {
    if (!user) return;
    try {
      await deleteChatSession(user.uid, id);
      if (activeChatId === id) setActiveChatId(null);
      toast({ title: 'Chat deleted successfully.' });
    } catch {
      toast({
        title: 'Failed to delete chat',
        description: 'Please try again later or refresh the page.',
        variant: 'destructive',
      });
    }
  };

  // Submit new user message and get streaming AI response
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !input.trim() || isAwaitingResponse) return;

    const currentInput = input;
    const userMessage: ChatMessage = { role: 'user', content: currentInput };

    setInput('');
    setMessages((prev) => [...prev, userMessage]);
    setIsAwaitingResponse(true);

    let chatId = activeChatId;

    try {
      // Create new chat if no active one
      if (!chatId) {
        chatId = await createChatSession(user.uid, currentInput);
        setActiveChatId(chatId);
      }

      // Save user message
      await addMessageToChat(user.uid, chatId, userMessage);

      // Prepare plain JSON messages without Firestore Timestamps
      const sanitizedHistory = messages.map(({ role, content }) => ({ role, content }));

      const chatInput: ChatInput = {
        history: sanitizedHistory,
        prompt: currentInput,
      };

      // Get streaming response from AI
      const stream = await chatWithBot(chatInput);
      let modelContent = '';
      let modelMsgId: string | null = null;

      // Append placeholder AI message to UI
      const placeholder: ChatMessage = { role: 'model', content: '' };
      setMessages((prev) => [...prev, placeholder]);

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        modelContent += decoder.decode(value, { stream: true });

        if (!modelMsgId) {
          try {
            modelMsgId = await addMessageToChat(user.uid, chatId, { role: 'model', content: '' });
          } catch {
            toast({
              title: 'Failed to initialize AI response',
              description: 'Check your connection; AI response might be delayed.',
              variant: 'default',
            });
          }
        }

        setMessages((prev) =>
          prev.map((m, idx) => (idx === prev.length - 1 ? { ...m, content: modelContent } : m))
        );
      }

      if (modelMsgId) {
        try {
          await updateLastMessageInChat(user.uid, chatId, modelMsgId, modelContent);
        } catch {
          toast({
            title: 'Failed to finalize AI response',
            description: 'AI response saved incompletely. Refresh to sync.',
            variant: 'default',
          });
        }
      }
    } catch {
      toast({
        title: 'Chat error',
        description: 'Unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setMessages((prev) => prev.slice(0, -1)); // rollback optimistic message
    } finally {
      setIsAwaitingResponse(false);
    }
  };

  return {
    sessions,
    activeChatId,
    messages,
    input,
    setInput,
    isLoading,
    isSidebarOpen,
    setSidebarOpen,
    isAwaitingResponse,
    handleSetActiveChatId,
    handleNewChat,
    handleRenameChat,
    handleDeleteChat,
    handleSubmit,
  };
}
