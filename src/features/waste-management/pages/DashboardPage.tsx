import { Search, User, Recycle, Package, Trophy } from 'lucide-react';
import { Header } from '../components/Header';
import { PageWrapper } from '../components/PageWrapper';
import { useWasteData } from '../hooks/useWasteData';
import { useWasteTrends } from '../hooks/useWasteTrends';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: wasteData, loading: wasteLoading } = useWasteData();
  const { trends, loading: trendsLoading } = useWasteTrends();
  const maxValue = Math.max(...wasteData.map((d) => d.value), 0); // Added 0 for safety

  return (
    <PageWrapper>
      <Header onNavigate={onNavigate} />

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search for location, schedule, or events"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-10"
        />
        <Search className="absolute top-3.5 left-3 text-gray-400" size={20} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm text-gray-500">Trend wastes</h3>
            <h2 className="mb-6 text-4xl font-bold">220K</h2>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Growth</h3>
              <select className="rounded border border-gray-200 px-3 py-1 text-sm">
                <option>Yearly</option>
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>

            {wasteLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <div className="relative h-64">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#86efac" stopOpacity="0.6" />
                      <stop
                        offset="100%"
                        stopColor="#86efac"
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0,100 ${wasteData
                      .map((d, i) => {
                        const x = (i / (wasteData.length - 1)) * 100;
                        const y = 100 - (d.value / maxValue) * 70;
                        return `L ${x},${y}`;
                      })
                      .join(' ')} L 100,100 Z`}
                    fill="url(#gradient)"
                  />
                  <path
                    d={`M ${wasteData
                      .map((d, i) => {
                        const x = (i / (wasteData.length - 1)) * 100;
                        const y = 100 - (d.value / maxValue) * 70;
                        return `${x},${y}`;
                      })
                      .join(' L ')}`}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                </svg>
                <div className="absolute right-0 bottom-0 left-0 flex justify-between px-2 text-xs text-gray-500">
                  {wasteData.map((d) => (
                    <span key={d.year}>{d.year}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 font-semibold">
              Waste Distribution by Category
            </h3>
            {trendsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {trends.map((trend, idx) => (
                  <div key={idx}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium">{trend.category}</span>
                      <span className="text-gray-600">
                        {trend.amount.toLocaleString()} kg ({trend.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${trend.percentage}%`,
                          backgroundColor: trend.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <h3 className="mb-4 text-sm">Total volunteer / day</h3>
            <div className="flex items-center justify-center gap-2 text-5xl font-bold">
              455 <User size={32} />
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-green-400 to-green-600 p-6 text-center text-white shadow-sm">
            <Recycle size={48} className="mx-auto mb-3" />
            <h3 className="mb-2 text-lg font-bold">Recycling Rate</h3>
            <p className="text-3xl font-bold">68%</p>
            <p className="mt-2 text-sm opacity-90">+5% from last month</p>
          </div>

          <div
            className="cursor-pointer rounded-xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            onClick={() => onNavigate('freecycle')}
          >
            <Package size={48} className="mx-auto mb-4" />
            <h3 className="font-semibold">Join free cycle</h3>
          </div>

          <div
            className="cursor-pointer rounded-xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            onClick={() => onNavigate('events')}
          >
            <Trophy size={48} className="mx-auto mb-4" />
            <h3 className="font-semibold">Find the events</h3>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
