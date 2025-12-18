import { useEffect } from 'react';
import { useNavigate } from '@/router';
import AdminHealthcareShell from '@/features/_healthcare/pages/AdminHealthcareShell';

export default function HealthcarePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('healthcare_token');
    const rawUser = localStorage.getItem('healthcare_user');

    if (!token || !rawUser) {
      navigate('/healthcare/healthcare-user');
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      const role = String(user?.role || '').toLowerCase();
      const allowedRoles = ['admin', 'health manager'];
      if (!allowedRoles.includes(role)) {
        navigate('/healthcare/healthcare-user');
      }
    } catch {
      navigate('/healthcare/healthcare-user');
    }
  }, [navigate]);

  return <AdminHealthcareShell />;
}
