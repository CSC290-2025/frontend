import { useEffect } from 'react';
import { useNavigate } from '@/router';
import { useAuth } from '@/features/auth';
import { ROLES } from '@/constant';
import UserHealthcareShell from '@/features/_healthcare/pages/UserHealthcareShell';

export default function HealthcareUserPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const isAdmin =
      String(user?.roles?.role_name ?? '').toLowerCase() ===
      ROLES.ADMIN.toLowerCase();
    if (isAdmin) {
      navigate('/healthcare/healthcare-admin');
    }
  }, [navigate, user]);

  return <UserHealthcareShell />;
}
