import { useAuth } from '@/features/auth';
import { useNavigate } from '@/router';
import { useLogout } from '@/hooks/useLogout';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const { mutate, isPending: isLoggingOut } = useLogout();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  return (
    <div>
      <div>
        Username: {user?.username}, Email: {user?.email}
      </div>
      <h1>Home</h1>
      <Button onClick={handleLogout}>
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  );
}
