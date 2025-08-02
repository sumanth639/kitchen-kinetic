// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { Footer } from '@/components/footer';
import { QueryProvider } from '@/lib/query-provider';

export const metadata: Metadata = {
  title: 'Kitchen Kinetic',
  description: 'Search for your favorite recipes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 mt-14">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
