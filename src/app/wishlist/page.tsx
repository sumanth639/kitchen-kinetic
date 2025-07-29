
'use client'

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function WishlistPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                         <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>My Wishlist</CardTitle>
                    <CardDescription>The recipes you've saved for later.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Your saved recipes will appear here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
