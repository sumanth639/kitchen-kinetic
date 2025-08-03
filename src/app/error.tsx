'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4 py-8">
      <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-3xl font-bold mb-2">Oops! Something went wrong.</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We encountered an unexpected issue. You can try to refresh the page or
        click the button below.
      </p>
      <Button
        onClick={() => {
          reset();
          window.location.reload();
          console.log('reset triggered');
        }}
        size="lg"
      >
        Try again
      </Button>
    </div>
  );
}
