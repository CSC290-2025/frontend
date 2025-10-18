import { Outlet } from 'react-router';
import { ReportFromProvider } from '@/features/emergency/hooks/report-from.tsx';

export default function Layout() {
  return (
    <ReportFromProvider>
      <Outlet />
    </ReportFromProvider>
  );
}
