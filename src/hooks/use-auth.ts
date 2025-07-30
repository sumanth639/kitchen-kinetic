'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check if there's already a user in the auth state
    if (auth.currentUser) {
      setUser(auth.currentUser);
      setInitializing(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [initializing]);

  return { user, loading: initializing };
}
