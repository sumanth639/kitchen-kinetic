'use client';

import Link from 'next/link';
import {
  ChefHat,
  LogOut,
  User,
  PlusCircle,
  Heart,
  Zap,
  Moon,
  Sun,
} from 'lucide-react';

import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { useAuth } from '@/components/auth-provider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/sessionLogout', { method: 'POST' });
    await signOut(auth);
    router.refresh();
  };

  
  const getLinkHref = (path: string) => (user ? path : `/login?next=${encodeURIComponent(path)}`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center  group"
          aria-label="Kitchen Kinetic Home"
        >
          <div className="p-1.5">
            <img
              src="/logo.png"
              alt="Kitchen Kinetic Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            // Display a loading state for all buttons while authentication is loading
            <>
              <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
              <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
              <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/chat">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Ask Kinetic
                </Button>
              </Link>
              <TooltipProvider>
                {/* Create Recipe Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={getLinkHref('/recipes/new')}
                      className="hidden sm:inline-flex"
                    >
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
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link href="/recipes/new" className="cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Create Recipe</span>
                      </Link>
                    </DropdownMenuItem>
                    <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                      <Sun className="mr-2 h-4 w-4 dark:hidden" />
                      <Moon className="mr-2 h-4 w-4 hidden dark:inline-block" />
                      <span>Theme</span>
                      <div className="ml-auto">
                        <ThemeToggle />
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <ThemeToggle />
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
