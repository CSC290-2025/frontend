import { Outlet } from 'react-router';
import { useSearchParams } from 'react-router';
import { ReportFromProvider } from '@/features/emergency/hooks/report-from.tsx';
import MainLayout from '@/features/emergency/components/modules/layout/main-layout.tsx';

export default function ActivityLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('_page') || '1', 10);
  const perPage = parseInt(searchParams.get('_limit') || '5', 10);
  return (
    <MainLayout classname="transition-colors duration-300">
      <ReportFromProvider
        initialPage={currentPage.toString()}
        initialLimit={perPage.toString()}
      >
        <Outlet />
      </ReportFromProvider>
    </MainLayout>
  );
}
