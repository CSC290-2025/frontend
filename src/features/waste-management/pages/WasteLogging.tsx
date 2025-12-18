import {
  DailyWasteLogs,
  WasteLoggingForm,
} from '@/features/waste-management/components';

export default function WasteLogging() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <WasteLoggingForm />
      <DailyWasteLogs />
    </div>
  );
}
