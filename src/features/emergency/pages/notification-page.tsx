import NotificationModule from '@/features/emergency/components/modules/notification/notification.tsx';
import { ReportFromProvider } from '@/features/emergency/hooks/report-from.tsx';

function NotificationPage() {
  return (
    <ReportFromProvider>
      <NotificationModule />
    </ReportFromProvider>
  );
}
export default NotificationPage;
