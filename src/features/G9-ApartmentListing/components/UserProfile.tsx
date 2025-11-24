import { useUserById } from '@/features/G9-ApartmentListing/hooks/userApartmentOwner';

interface UserProfileProps {
  userId: number;
  fallback?: string;
  children: (username: string) => React.ReactNode;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  fallback,
  children,
}) => {
  const { data: user } = useUserById(userId);
  const username = user?.username || fallback || `User ${userId}`;

  return <>{children(username)}</>;
};
