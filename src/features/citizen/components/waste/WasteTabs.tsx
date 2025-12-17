import React from 'react';

export type TabKey = 'history' | 'monthly';

export function WasteTabs({
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
