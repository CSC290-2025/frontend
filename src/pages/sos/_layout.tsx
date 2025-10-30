import { Outlet } from 'react-router';
import MainLayout from '@/features/emergency/components/modules/layout/main-layout.tsx';

export default function SosLayout() {
  return (
    <MainLayout classname="transition-colors duration-300">
      <Outlet />
    </MainLayout>
  );
}
