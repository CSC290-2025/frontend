import { useUserProfile, useUserProfileDetails } from '../../hooks/ProfileUser';

interface Props {
  userId: number;
  onEditProfile: () => void;
}

export default function ProfileCard({ userId, onEditProfile }: Props) {
  const {
    data: user,
    isLoading: userLoad,
    error: userError,
  } = useUserProfile(userId);

  const {
    data: details,
    isLoading: infoLoad,
    error: detailsError,
  } = useUserProfileDetails(userId);

  if (userLoad || infoLoad) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (userError || detailsError) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <div className="flex items-center justify-center py-12 text-red-500">
          <div className="text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">Error loading profile data</p>
            <p className="mt-1 text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !details) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No profile data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-gray-200 bg-white">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="35" r="20" fill="#6B7280" />
            <path d="M20 85 Q20 60 50 60 Q80 60 80 85" fill="#6B7280" />
          </svg>
        </div>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {user.username}
        </h2>

        <div className="mb-6 w-full rounded-2xl bg-cyan-400 px-6 py-4 text-center">
          <p className="text-sm font-medium text-white">Card ID: N/A</p>
          <p className="mt-1 text-sm font-medium text-white">
            Bus card balance: N/A
          </p>
        </div>

        <div className="w-full space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-600">First name</span>
            <span className="text-gray-900">{details.firstName}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-600">Middle name</span>
            <span className="text-gray-900">{details.middleName || 'N/A'}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-600">Last name</span>
            <span className="text-gray-900">{details.lastName}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-600">Address</span>
            <span className="text-gray-900">{details.address}</span>
          </div>

          <div className="flex justify-between pb-2">
            <span className="font-medium text-gray-600">Phone</span>
            <span className="text-gray-900">{user.phone}</span>
          </div>
        </div>

        <button
          onClick={onEditProfile}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-cyan-400 bg-white px-6 py-3 font-medium text-cyan-400 transition hover:bg-cyan-50"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Profile
        </button>
      </div>
    </div>
  );
}
