// src/app/chat/_hooks/useChat.ts
'use client';

import { useState, useEffect, useCallback, FormEvent, RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { ChatSession } from '@/types';
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

export function useChat(scrollAreaRef: RefObject<HTMLDivElement>) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  // Effect for auth redirection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Effect for subscribing to chat sessions
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

  // Effect for subscribing to messages of the active chat
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

  // Effect for auto-scrolling
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isAwaitingResponse, scrollAreaRef]);

  const handleSetActiveChatId = useCallback((id: string | null) => {
    setActiveChatId(id);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

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
    if (!input.trim() || isAwaitingResponse || !user) return;

    const currentInput = input;
    const userMessage: ChatMessage = { role: 'user', content: currentInput };

    // Optimistic UI updates
    setInput('');
    setMessages((prev) => [...prev, userMessage]);
    setIsAwaitingResponse(true);

    let currentChatId = activeChatId;

    try {
      // Create a new chat session if one doesn't exist
      if (!currentChatId) {
        const newChatId = await createChatSession(user.uid, currentInput);
        setActiveChatId(newChatId);
        currentChatId = newChatId;
      }

      // Save user message to Firestore
      await addMessageToChat(user.uid, currentChatId, userMessage);

      // Prepare input for the AI model
      const chatInput: ChatInput = {
        history: messages.map(({ role, content }) => ({ role, content })),
        prompt: currentInput,
      };

      // Get the streaming response from the AI
      const stream = await chatWithBot(chatInput);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let modelResponse = '';
      let isFirstChunk = true;
      let modelMessageId: string | null = null;
      
      const modelPlaceholder: ChatMessage = { role: 'model', content: '' };
      setMessages((prev) => [...prev, modelPlaceholder]);

      const read = async () => {
        const { done, value } = await reader.read();

        if (done) {
          setIsAwaitingResponse(false);
          // Finalize the model's message in Firestore
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
           // Create the model message placeholder in Firestore on the first chunk
          const docRefId = await addMessageToChat(
            user.uid,
            currentChatId!,
            { role: 'model', content: '' }
          );
          modelMessageId = docRefId;
          isFirstChunk = false;
        }

        const chunk = decoder.decode(value, { stream: true });
        modelResponse += chunk;

        // Update the UI with the streaming content
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content: modelResponse }
              : msg
          )
        );

        await read();
      };
      await read();
    } catch (error) {
      console.error('Error during chat:', error);
      toast({
        title: 'Error',
        description: 'Sorry, something went wrong. Please try again.',
        variant: 'destructive',
      });
      // Revert optimistic UI updates on error
      setMessages((prev) => prev.slice(0, -1));
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
    handleRenameChat,
    handleDeleteChat,
    handleNewChat,
    handleSubmit,
  };
}
