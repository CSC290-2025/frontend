import { Outlet } from 'react-router';
import MainLayout from '@/features/emergency/components/modules/layout/main-layout.tsx';
import { GeoLocationProvider } from '@/features/emergency/contexts/geo-location.tsx';

export default function SosLayout() {
  return (
    <MainLayout classname="transition-colors duration-300">
      <GeoLocationProvider>
        <Outlet />
      </GeoLocationProvider>
    </MainLayout>
  );
}
