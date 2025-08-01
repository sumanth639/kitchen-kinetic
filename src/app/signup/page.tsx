'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

import SignupCard from './_components/SignupCard';

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md px-4">
        <SignupCard />
      </div>
    </div>
  );
}
