import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  DocumentReference,
  CollectionReference,
  FirestoreError,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatMessage } from '@/ai/flows/chat-types';

// Utility function to handle Firestore errors
export const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Firestore ${operation} error:`, error);

  if (error.code === 'permission-denied') {
    throw new Error(
      'You do not have permission to perform this action. Please make sure you are logged in.'
    );
  } else if (error.code === 'unavailable') {
    throw new Error(
      'Firestore is currently unavailable. Please check your internet connection and try again.'
    );
  } else if (error.code === 'deadline-exceeded') {
    throw new Error('Request timed out. Please try again.');
  } else {
    throw new Error(`Failed to ${operation}. Please try again later.`);
  }
};

// Safe wrapper for Firestore operations
export const safeFirestoreOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    handleFirestoreError(error, operationName);
    throw error;
  }
};

// Wishlist operations
export const addToWishlist = async (
  userId: string,
  recipeId: string,
  recipeData: any
) => {
  return safeFirestoreOperation(async () => {
    const wishlistRef = doc(db, 'users', userId, 'wishlist', recipeId);
    await setDoc(wishlistRef, {
      ...recipeData,
      addedAt: new Date(),
    });
  }, 'add to wishlist');
};

export const removeFromWishlist = async (userId: string, recipeId: string) => {
  return safeFirestoreOperation(async () => {
    const wishlistRef = doc(db, 'users', userId, 'wishlist', recipeId);
    await deleteDoc(wishlistRef);
  }, 'remove from wishlist');
};

export const subscribeToWishlist = (
  userId: string,
  callback: (items: any[]) => void,
  onError?: (error: Error) => void
) => {
  const wishlistRef = collection(db, 'users', userId, 'wishlist');
  const q = query(wishlistRef, orderBy('addedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(items);
    },
    (error) => {
      console.error('Wishlist subscription error:', error);
      if (onError) {
        onError(new Error('Failed to load wishlist. Please refresh the page.'));
      }
    }
  );
};

// Recipe operations
export const createRecipe = async (recipeData: any) => {
  return safeFirestoreOperation(async () => {
    const recipesRef = collection(db, 'recipes');
    return await setDoc(doc(recipesRef), recipeData);
  }, 'create recipe');
};

export const subscribeToUserRecipes = (
  userId: string,
  callback: (recipes: any[]) => void,
  onError?: (error: Error) => void
) => {
  const recipesRef = collection(db, 'recipes');
  const q = query(recipesRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const recipes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(recipes);
    },
    (error) => {
      console.error('User recipes subscription error:', error);
      if (onError) {
        onError(
          new Error('Failed to load your recipes. Please refresh the page.')
        );
      }
    }
  );
};

export const deleteUserRecipe = async (userId: string, recipeId: string) => {
  return safeFirestoreOperation(async () => {
    const recipeRef = doc(db, 'recipes', recipeId);

    await deleteDoc(recipeRef);
  }, 'delete user recipe');
};

// Chat History Operations
export const createChatSession = async (
  userId: string,
  firstMessage: string
) => {
  return safeFirestoreOperation(async () => {
    const chatsRef = collection(db, 'users', userId, 'chats');
    const newChatSession = await addDoc(chatsRef, {
      title: firstMessage.substring(0, 40), // Use first part of message as title
      createdAt: serverTimestamp(),
      userId: userId,
    });
    return newChatSession.id;
  }, 'create chat session');
};

export const subscribeToChatSessions = (
  userId: string,
  callback: (sessions: any[]) => void,
  onError: (error: Error) => void
) => {
  const sessionsRef = collection(db, 'users', userId, 'chats');
  const q = query(sessionsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(sessions);
    },
    (error) => {
      console.error('Chat sessions subscription error:', error);
      onError(
        new Error('Failed to load chat sessions. Please refresh the page.')
      );
    }
  );
};

export const subscribeToMessages = (
  userId: string,
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void
) => {
  const messagesRef = collection(db, 'users', userId, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data() as ChatMessage);
      callback(messages);
    },
    (error) => {
      console.error('Messages subscription error:', error);
      onError(new Error('Failed to load messages. Please refresh the page.'));
    }
  );
};

export const addMessageToChat = async (
  userId: string,
  chatId: string,
  message: ChatMessage
) => {
  return safeFirestoreOperation(async () => {
    const messagesRef = collection(db, 'users', userId, 'chats', chatId, 'messages');
    await addDoc(messagesRef, { ...message, timestamp: serverTimestamp() });
  }, 'add message to chat');
};
