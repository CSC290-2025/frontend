import { Outlet } from 'react-router';
import MainLayout from '@/features/emergency/components/modules/layout/main-layout.tsx';
import { ReportFromProvider } from '@/features/emergency/hooks/report-from.tsx';

export default function SosLayout() {
  return (
    <MainLayout overlap={true} classname="transition-colors duration-300">
      <ReportFromProvider>
        <Outlet />
      </ReportFromProvider>
    </MainLayout>
  );
}
