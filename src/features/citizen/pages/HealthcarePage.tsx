import React, { useMemo } from 'react';
import { useNavigate, useParams } from '@/router';
import { useQuery } from '@tanstack/react-query';

import Layout from '@/components/main/Layout';
import { useGetAuthMe } from '@/api/generated/authentication';

import { useMyHealthcare } from '../hooks/useMyHealthcare';
import { fetchProfileForSettingUser } from '../api/ProfileUser';
import HealthcareCard from '../components/Healthcare/HealthcareCard';

export default function HealthcarePage() {
  const navigate = useNavigate();

  const id = useParams('id' as any) as string | undefined;
  const authMe = useGetAuthMe();
  const authUserId = authMe.data?.data?.userId;

  const resolvedUserId = useMemo(() => {
    const paramId = id ? Number(id) : undefined;
    if (typeof paramId === 'number' && !Number.isNaN(paramId)) return paramId;
    if (typeof authUserId === 'number' && !Number.isNaN(authUserId))
      return authUserId;
    return undefined;
  }, [id, authUserId]);

  const healthcareQ = useMyHealthcare(resolvedUserId);

  const profileQ = useQuery({
    queryKey: ['profileForHealthcare', resolvedUserId],
    enabled:
      typeof resolvedUserId === 'number' && !Number.isNaN(resolvedUserId),
    queryFn: async () => {
      if (typeof resolvedUserId !== 'number' || Number.isNaN(resolvedUserId)) {
        throw new Error('Missing userId');
      }
      return fetchProfileForSettingUser(resolvedUserId);
    },
    staleTime: 60_000,
  });

  const loading =
    authMe.isLoading || profileQ.isLoading || healthcareQ.isLoading;

  const error =
    (authMe.error instanceof Error
      ? authMe.error.message
      : authMe.error
        ? String(authMe.error)
        : null) ||
    (profileQ.error instanceof Error
      ? profileQ.error.message
      : profileQ.error
        ? String(profileQ.error)
        : null) ||
    (healthcareQ.error instanceof Error
      ? healthcareQ.error.message
      : healthcareQ.error
        ? String(healthcareQ.error)
        : null);

  return (
    <Layout>
      <HealthcareCard
        profile={profileQ.data}
        healthcare={healthcareQ.data}
        loading={loading}
        error={error}
        onBack={() => navigate(-1)}
      />
    </Layout>
  );
}
