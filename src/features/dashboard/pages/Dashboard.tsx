import { useAuth } from '@/features/auth';
import { useNavigate } from '@/router';
import { useLogout } from '@/hooks/useLogout';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/main/Sidebar.tsx';

import {
  Building2,
  BusFront,
  Calendar,
  Cloud,
  Hospital,
  BookMarked,
  Phone,
} from 'lucide-react';

export default function Dashboard() {
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
      <Sidebar />
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
