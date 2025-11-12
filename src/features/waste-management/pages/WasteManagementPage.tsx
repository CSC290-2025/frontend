import { useState } from 'react';
import { Recycle } from 'lucide-react';
import {
  WasteLoggingForm,
  StatisticsTable,
  WasteCharts,
  TrendCard,
  ViewSelector,
} from '../components';
import { useMonthlyStats, useDailyStats } from '../hooks';

export default function WasteManagementPage() {
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
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-7xl">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 p-3">
            <Recycle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
              Waste Management
            </h1>
            <p className="text-gray-600">Activities and tracking</p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Form and Quick Stats */}
        <div className="space-y-6 lg:col-span-1">
          <WasteLoggingForm />
          {currentStats && (
            <TrendCard totalWeight={currentStats.total_weight_kg} />
          )}
        </div>

        {/* Right Column - Statistics and Charts */}
        <div className="space-y-6 lg:col-span-2">
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
    </div>
  );
}
