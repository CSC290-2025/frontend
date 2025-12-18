// src/components/main/Layout.tsx
import { type FC, type ReactNode } from 'react';
import Sidebar from './Sidebar';

type MainLayoutProps = {
  children: ReactNode;
  onSelectTypeId?: (id: number) => void;
};

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full p-6">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
