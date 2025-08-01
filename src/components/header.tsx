'use client';

import Link from 'next/link';
import { ChefHat, LogOut, User, PlusCircle, Heart } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { useAuth } from '@/components/auth-provider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function Header() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Determine the redirection link based on user login status
  const getLinkHref = (path: string) => (user ? path : '/login');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Kitchen Kinetic Home"
        >
          <div className="p-1.5">
            <img
              src="/logo.png"
              alt="Kitchen Kinetic Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <span className="font-semibold text-xl tracking-tight hidden sm:inline-block">
            Kitchen Kinetic
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {loading ? (
            // Display a loading state for all buttons while authentication is loading
            <>
              <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
              <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
              <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                {/* Wishlist Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={getLinkHref('/wishlist')}>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <Heart className="h-4 w-4" />
                        <span className="sr-only">Wishlist</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Wishlist</p>
                  </TooltipContent>
                </Tooltip>

                {/* Create Recipe Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={getLinkHref('/recipes/new')}>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <PlusCircle className="h-4 w-4" />
                        <span className="sr-only">Create Recipe</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Create Recipe</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {user ? (
                // User is logged in, show the profile dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0 ml-2"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.photoURL || undefined}
                          alt={user.displayName || 'User'}
                        />
                        <AvatarFallback className="text-sm font-medium">
                          {user.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30"
                >
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
