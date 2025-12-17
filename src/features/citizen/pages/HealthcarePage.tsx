import React from 'react';
import { useNavigate } from '@/router';
import { useParams } from '@/router';
import { useQuery } from '@tanstack/react-query';

import { useMyHealthcare } from '../hooks/useMyHealthcare';
import { fetchProfileForSettingUser } from '../api/ProfileUser';
import HealthcareCard from '../components/Healthcare/HealthcareCard';

export default function HealthcarePage() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const userId = id ? Number(id) : undefined;

  const healthcareQ = useMyHealthcare(userId);

  const profileQ = useQuery({
    queryKey: ['profileForHealthcare', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error('Missing userId');
      return fetchProfileForSettingUser(userId);
    },
    staleTime: 60_000,
  });

  const loading = healthcareQ.isLoading || profileQ.isLoading;
  const error =
    (healthcareQ.error instanceof Error
      ? healthcareQ.error.message
      : healthcareQ.error
        ? String(healthcareQ.error)
        : null) ||
    (profileQ.error instanceof Error
      ? profileQ.error.message
      : profileQ.error
        ? String(profileQ.error)
        : null);

  return (
    <HealthcareCard
      profile={profileQ.data}
      healthcare={healthcareQ.data}
      loading={loading}
      error={error}
      onBack={() => navigate(-1)}
    />
  );
}
