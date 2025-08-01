'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

import LoginCard from './_components/LoginCard';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md px-4">
        <LoginCard />
      </div>
    </div>
  );
}
