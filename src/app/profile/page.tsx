
'use client'

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
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
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-6 w-48" />
                             <Skeleton className="h-4 w-64" />
                        </div>
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{user.displayName || 'User'}</CardTitle>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>More profile information to come.</p>
                </CardContent>
            </Card>
        </div>
    )
}
