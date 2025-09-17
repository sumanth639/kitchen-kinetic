'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GoogleIcon } from '@/components/icons/google-icon';
import { Loader2 } from 'lucide-react';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';

export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const finishLogin = useCallback(async () => {
    const idToken = await auth.currentUser?.getIdToken(true);
    if (!idToken) return;
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const next = searchParams.get('next') || '/';
    router.replace(next);
    router.refresh();
  }, [router, searchParams]);

  // ✅ Email/Password Login
  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        await signInWithEmailAndPassword(auth, email, password);
        await finishLogin();
        toast({
          title: 'Welcome back 🎉',
          description: 'You have been logged in successfully.',
        });
      } catch (error: any) {
        toast({
          title: 'Login Failed',
          description: getAuthErrorMessage(error.code),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [email, password, toast]
  );

  // ✅ Google Sign-in
  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      await finishLogin();
      toast({
        title: 'Signed in successfully 🎉',
        description: `Welcome back, ${
          result.user.displayName || result.user.email
        }!`,
      });
    } catch (error: any) {
      toast({
        title: 'Google Sign-in Failed',
        description: getAuthErrorMessage(error.code),
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  }, [toast]);

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white mb-2">
          Sign in to Kitchen Kinetic
        </h2>
        <p className="text-sm text-gray-300">
          Or{' '}
          <Link
            href="/signup"
            className="font-medium text-orange-400 hover:text-orange-300"
          >
            create a new account
          </Link>
        </p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in with Email'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
