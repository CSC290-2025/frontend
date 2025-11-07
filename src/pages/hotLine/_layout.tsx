import { Outlet } from 'react-router';
import MainLayout from '@/features/emergency/components/modules/layout/main-layout.tsx';

export default function HotLineLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
