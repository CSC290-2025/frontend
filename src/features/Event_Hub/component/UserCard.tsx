// component of a page
import { useUser } from '../../_example/contexts/useUser';
import type { User } from '@/types/user';

interface UserCardProps {
  id: number;
}

export default function UserCard({ id }: UserCardProps) {
  const { data, isLoading, error } = useUser(id);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!data) return <div>No user found.</div>;

  const user = data as User;

  return <div>{user.username}</div>;
}
