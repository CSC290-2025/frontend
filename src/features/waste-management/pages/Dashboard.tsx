import { useState } from 'react';

import {
  StatisticsTable,
  WasteCharts,
  ViewSelector,
} from '@/features/waste-management/components';
import {
  useMonthlyStats,
  useDailyStats,
} from '@/features/waste-management/hooks';

export default function Dashboard() {
  const [viewType, setViewType] = useState<'monthly' | 'daily'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear())
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: monthlyData, isLoading: isLoadingMonthly } = useMonthlyStats(
    parseInt(selectedMonth),
    parseInt(selectedYear)
  );

  const { data: dailyData, isLoading: isLoadingDaily } =
    useDailyStats(selectedDate);

  const currentStats =
    viewType === 'monthly' ? monthlyData?.stats : dailyData?.stats;
  const isLoading = viewType === 'monthly' ? isLoadingMonthly : isLoadingDaily;

  const getDescription = () => {
    if (viewType === 'monthly') {
      return `${new Date(2025, parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`;
    }
    return selectedDate;
  };

  return (
    <div className="min-h-screen from-purple-50 via-pink-50 to-blue-50 p-6">
      {/* Right Column - Statistics and Charts */}
      <div className="space-y-6 lg:col-span-3">
        <ViewSelector
          viewType={viewType}
          onViewTypeChange={setViewType}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedDate={selectedDate}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onDateChange={setSelectedDate}
        />

        {isLoading ? (
          <div className="py-12 text-center text-gray-600">
            Loading statistics...
          </div>
        ) : currentStats ? (
          <>
            <StatisticsTable
              stats={currentStats}
              viewType={viewType}
              description={getDescription()}
            />
            <WasteCharts stats={currentStats} />
          </>
        ) : (
          <div className="py-12 text-center text-gray-600">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
