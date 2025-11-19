import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/features/auth';
import type { Path } from '@/router';

const PRIVATE: Path[] = [
  '/',
  '/dashboard',
  '/district-selection',
  '/healthcare',
  '/power-bi',
  '/example',
];
const PUBLIC: Path[] = ['/login', '/register'];

export const Redirects = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  const authenticatedOnPublicPath =
    user && PUBLIC.includes(location.pathname as Path);

  const unAuthenticatedOnPrivatePath =
    !user && PRIVATE.includes(location.pathname as Path);

  if (authenticatedOnPublicPath) {
    return <Navigate to="/" replace />;
  }
  if (unAuthenticatedOnPrivatePath) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
