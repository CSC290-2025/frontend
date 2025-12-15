import { Outlet } from 'react-router';
import MainLayout from '@/features/emergency/components/modules/layout/main-layout.tsx';
import { GeoLocationProvider } from '@/features/emergency/contexts/geo-location.tsx';
import { ReportFromProvider } from '@/features/emergency/contexts/report-from.tsx';

export default function SosLayout() {
  return (
    <MainLayout overlap={true} classname="transition-colors duration-300">
      <GeoLocationProvider>
        <ReportFromProvider initialPage={'1'} initialLimit={'5'}>
          <Outlet />
        </ReportFromProvider>
      </GeoLocationProvider>
    </MainLayout>
  );
}
