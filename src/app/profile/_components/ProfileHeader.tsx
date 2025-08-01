import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'firebase/auth';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.photoURL || undefined} />
        <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <CardTitle className="text-2xl">
          {user.displayName || 'User'}'s Dashboard
        </CardTitle>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
    </CardHeader>
  );
}
