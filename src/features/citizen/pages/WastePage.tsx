import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Navigate, useNavigate } from '@/router';

type TabKey = 'history' | 'monthly';

export default function WasteManagementPage() {
  const [tab, setTab] = useState<TabKey>('history');
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-white px-6 py-8">
      {/* arrow out */}
      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/citizen/profile')}
          className="flex items-center gap-3 text-[#2B5991]"
        >
          <ChevronLeft className="h-10 w-10" />
          <span className="text-2xl font-bold">Profile</span>
        </button>
      </div>

      {/* out box */}
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2B5991]">
            Waste Management
          </h1>
          <p className="text-lg text-[#2B5991]">
            View your waste statistics and daily history
          </p>
        </div>

        <WasteTabs value={tab} onChange={setTab} />

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2B5991]">
              {tab === 'history'
                ? 'Waste History (Daily)'
                : 'Waste Statistics (Monthly)'}
            </h2>
          </div>

          <p className="text-sm text-[#2B5991]">Loading</p>
        </div>
      </div>
    </main>
  );
}

function WasteTabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex gap-6">
          <TabButton
            active={value === 'history'}
            onClick={() => onChange('history')}
          >
            History
          </TabButton>

          <TabButton
            active={value === 'monthly'}
            onClick={() => onChange('monthly')}
          >
            Monthly
          </TabButton>
        </div>

        <div className="h-px w-full bg-[#2B5991]" />
      </div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-w-[190px] px-10 py-4',
        'text-xl font-semibold transition',
        'ring-0 outline-none focus:ring-0',
        active
          ? 'bg-[#96E0E1] text-blue-900 shadow-sm'
          : 'bg-transparent text-blue-900 hover:bg-transparent',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
