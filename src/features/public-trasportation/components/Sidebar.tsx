import React from 'react';

interface SidebarProps {
  active?: string;
}

export default function Sidebar({ active = 'City insights' }: SidebarProps) {
  const menuItems = [
    'City insights',
    'Transport',
    'Events',
    'Weather reports',
    'Healthcare',
    'Know Ai',
    'Contact us',
  ];

  return (
    <aside className="flex w-64 flex-col justify-between border-r border-gray-200 bg-gray-50">
      <div>
        <h1 className="p-6 text-xl font-semibold">Smart city Hub</h1>

        <nav className="space-y-4 px-6">
          {menuItems.map((item) => (
            <SidebarItem key={item} label={item} active={active === item} />
          ))}
        </nav>
      </div>

      <div className="space-y-3 p-6 text-sm">
        <div>Profile</div>
        <div>Setting</div>
        <div>E-wallet</div>
        <button className="w-full rounded-md bg-sky-500 py-2 font-medium text-white hover:bg-sky-600">
          Log out
        </button>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  label: string;
  active?: boolean;
}

function SidebarItem({ label, active }: SidebarItemProps) {
  return (
    <div
      className={`cursor-pointer text-sm font-medium ${
        active ? 'text-sky-600' : 'text-gray-600 hover:text-sky-500'
      }`}
    >
      {label}
    </div>
  );
}
