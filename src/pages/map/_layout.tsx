import { Outlet } from 'react-router';
import MainLayout from '@/features/G16-CommunitySupportMap/components/layout';

export default function MapLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
