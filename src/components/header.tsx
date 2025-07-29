import Link from 'next/link';
import { ChefHat } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Kitchen Kinetic Home">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">Kitchen Kinetic</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
