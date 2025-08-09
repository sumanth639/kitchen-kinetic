
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'firebase/auth';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-6">
      <Avatar className="h-20 w-20">
        <AvatarImage src={user.photoURL || undefined} />
        <AvatarFallback className="text-2xl">{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <h1 className="text-3xl font-bold">
          {user.displayName || 'User'}'s Dashboard
        </h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}
