import { User, Heart, Recycle, HandHeart, AlertCircle } from 'lucide-react';

// Mock data
const mockUser = {
  username: 'beli buli',
  phone: '090-000-0000',
  firstName: 'Mock_Mock_na_baby',
  middleName: '',
  lastName: 'User',
  address: 'Bangkok, Thailand',
};

export default function ProfilePage() {
  return (
    <main className="flex min-h-screen justify-center bg-gradient-to-br px-4 py-10">
      <div className="w-full max-w-7xl rounded-3xl bg-white p-8 shadow-2xl md:p-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProfileCard user={mockUser} />
          </div>

          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-blac mb-3 text-4xl font-bold">
                Your Services
              </h2>
              <p className="text-lg text-black">
                Access and manage your community services
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ServiceBox
                icon={<AlertCircle className="h-8 w-8" />}
                title="Emergency"
                desc="Quick access to emergency services and contacts"
                color="bg-red-400"
                hoverColor="hover:bg-red-500"
              />

              <ServiceBox
                icon={<Heart className="h-8 w-8" />}
                title="Healthcare"
                desc="Medical records and health management tools"
                color="bg-emerald-400"
                hoverColor="hover:bg-emerald-500"
              />

              <ServiceBox
                icon={<Recycle className="h-8 w-8" />}
                title="Waste Management"
                desc="Quick access to emergency services and contacts"
                color="bg-cyan-400"
                hoverColor="hover:bg-cyan-500"
              />

              <ServiceBox
                icon={<HandHeart className="h-8 w-8" />}
                title="Volunteer"
                desc="Find and join community volunteer programs"
                color="bg-purple-400"
                hoverColor="hover:bg-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfileCard({ user }: { user: typeof mockUser }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg">
            <User className="h-16 w-16 text-blue-600" />
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold text-blue-900">
          {user.username}
        </h2>

        <div className="mb-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 px-6 py-5 text-center shadow-md">
          <p className="text-sm font-semibold text-white">
            Card ID: 0000000000
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            Bus card balance: 000 baht
          </p>
        </div>

        <div className="w-full space-y-4 text-sm">
          <InfoRow label="First name" value={user.firstName} />
          <InfoRow label="Middle name" value={user.middleName || 'N/A'} />
          <InfoRow label="Last name" value={user.lastName} />
          <InfoRow label="Address" value={user.address} />
          <InfoRow label="Phone" value={user.phone} last />
        </div>

        <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 px-6 py-3.5 font-semibold text-blue-900 shadow-md transition hover:scale-105 hover:shadow-lg">
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

function InfoRow({
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
      className={`flex items-center justify-between ${!last ? 'border-b border-gray-200 pb-3' : 'pb-1'}`}
    >
      <span className="font-medium text-gray-600">{label}</span>
      <span className="text-right font-medium text-blue-900">{value}</span>
    </div>
  );
}

interface ServiceBoxProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  hoverColor: string;
}

function ServiceBox({ icon, title, desc, color, hoverColor }: ServiceBoxProps) {
  return (
    <div className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div
        className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${color} ${hoverColor} text-white shadow-md transition-all duration-300 group-hover:scale-110`}
      >
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-blue-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
    </div>
  );
}
