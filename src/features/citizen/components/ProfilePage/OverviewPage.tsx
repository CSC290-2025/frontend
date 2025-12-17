import { useEffect } from 'react';
import { useMyProfile } from '../../hooks/ProfileUser';
import { useMyMetroCards } from '../../hooks/useMyMetroCards';
import { useGetAuthMe } from '@/api/generated/authentication';

interface Props {
  onEditProfile: () => void;
}

export default function ProfileCard({ onEditProfile }: Props) {
  const userID = useGetAuthMe().data?.data?.userId;
  const profileQ = useMyProfile(userID);
  const cardsQ = useMyMetroCards();

  useEffect(() => {
    profileQ.refetch();
    cardsQ.refetch();

    const onFocus = () => {
      profileQ.refetch();
      cardsQ.refetch();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        profileQ.refetch();
        cardsQ.refetch();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = profileQ.isLoading || cardsQ.isLoading;
  const error = profileQ.error || cardsQ.error;

  const profile: any = profileQ.data;
  const cards = cardsQ.data ?? [];
  const metroCard =
    cards.find((c) => (c.status ?? '').toLowerCase() === 'active') ?? cards[0];

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-red-500 shadow-lg">
        {(error as Error).message}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
        No profile data
      </div>
    );
  }

  const updating = profileQ.isFetching || cardsQ.isFetching;

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-gray-200 bg-white">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="35" r="20" fill="#6B7280" />
            <path d="M20 85 Q20 60 50 60 Q80 60 80 85" fill="#6B7280" />
          </svg>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[#2B5991]">
            {profile.username}
          </h2>
          {updating && (
            <span className="text-xs text-[#2B5991]">Updating…</span>
          )}
        </div>

        {/* ✅ Metro card จาก API จริง /metro-cards/me */}
        <div className="mb-6 w-full rounded-2xl bg-[#01CCFF] px-6 py-4 text-center">
          {metroCard ? (
            <>
              <p className="text-sm font-medium text-white">
                Card Number: {metroCard.card_number}
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                Metro card balance: {metroCard.balance}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-white">No metro card</p>
              <p className="mt-1 text-sm font-medium text-white">
                (No token or no card found)
              </p>
            </>
          )}
        </div>

        <div className="w-full space-y-3 text-sm">
          <Row label="First name" value={profile.firstName} />
          <Row label="Middle name" value={profile.middleName || 'N/A'} />
          <Row label="Last name" value={profile.lastName} />
          <Row label="Address" value={profile.address} />
          <Row label="Phone" value={profile.phone} last />
        </div>

        <button
          onClick={onEditProfile}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-cyan-400 bg-[#FFF6E5] px-6 py-3 font-medium text-cyan-400 transition hover:bg-cyan-50"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${!last ? 'border-b border-gray-100 pb-2' : 'pb-2'}`}
    >
      <span className="font-medium text-[#2B5991]">{label}</span>
      <span className="text-right text-[#2B5991]">{value}</span>
    </div>
  );
}
