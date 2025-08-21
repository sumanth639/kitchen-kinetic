'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
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
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/google-icon';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';

const signupFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { email: '', password: '' },
  });

  // ✅ Handle email/password signup
  const onSubmit = useCallback(
    async (data: SignupFormValues) => {
      setLoading(true);
      try {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: '🎉 Account created successfully',
          description: 'Welcome to Kitchen Kinetic!',
        });
      } catch (error: any) {
        toast({
          title: 'Signup Failed',
          description: getAuthErrorMessage(error.code),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // ✅ Handle Google sign-up
  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      toast({
        title: '🎉 Account created successfully',
        description: `Welcome, ${
          result.user.displayName || result.user.email
        }!`,
      });
    } catch (error: any) {
      toast({
        title: 'Google Sign-Up Failed',
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
          Create your account
        </h2>
        <p className="text-sm text-gray-300">
          Or{' '}
          <Link
            href="/login"
            className="font-medium text-orange-400 hover:text-orange-300"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create an account to save and share recipes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
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

          {/* Google Sign-up */}
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
            {googleLoading ? 'Creating account...' : 'Sign up with Google'}
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
