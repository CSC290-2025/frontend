// src/components/main/Layout.tsx
import { type FC, type ReactNode } from 'react';
import Sidebar from '@/components/main/Layout';

type MainLayoutProps = {
  children: ReactNode;
  onSelectTypeId?: (id: number) => void;
};

const MainLayout: FC<MainLayoutProps> = ({ children, onSelectTypeId }) => {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="grid flex-1 items-end gap-4 p-6">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
