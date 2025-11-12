import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import type { WasteStats, DailyStats } from '../types';

interface StatisticsTableProps {
  stats: WasteStats | DailyStats;
  viewType: 'monthly' | 'daily';
  title?: string;
  description?: string;
}

const COLORS = [
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
];

export default function StatisticsTable({
  stats,
  viewType,
  title,
  description,
}: StatisticsTableProps) {
  return (
    <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          {title ||
            `${viewType === 'monthly' ? 'Monthly' : 'Daily'} Statistics`}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Waste Type
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Total Weight (kg)
                </th>
                {viewType === 'monthly' && (
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Entries
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {stats.by_type.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 transition-colors hover:bg-purple-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      {item.waste_type || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {item.total_weight.toFixed(1)}
                  </td>
                  {viewType === 'monthly' && 'entry_count' in item && (
                    <td className="px-4 py-3 text-right text-gray-600">
                      {item.entry_count}
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-purple-50 font-bold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">
                  {stats.total_weight_kg.toFixed(1)}
                </td>
                {viewType === 'monthly' && 'by_type' in stats && (
                  <td className="px-4 py-3 text-right">
                    {stats.by_type.reduce(
                      (sum, item) =>
                        sum + ('entry_count' in item ? item.entry_count : 0),
                      0
                    )}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
