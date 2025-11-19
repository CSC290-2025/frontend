import React, { useState, useEffect } from 'react';
import {
  Trash2,
  TrendingUp,
  AlertCircle,
  BarChart3,
  MapPin,
  Navigation,
} from 'lucide-react';
import { ApiService } from '@/features/waste-management/api/api';
import type { BinStats, WasteStats } from '@/features/waste-management/types';
import { BIN_TYPE_COLORS, BIN_TYPE_LABELS } from '@/constant';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [binStats, setBinStats] = useState<BinStats | null>(null);
  const [wasteStats, setWasteStats] = useState<WasteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bins, waste] = await Promise.all([
          ApiService.getBinStats(),
          ApiService.getWasteStats(),
        ]);
        setBinStats(bins);
        setWasteStats(waste);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">
          Overview of your waste management system
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bins</p>
              <p className="text-3xl font-bold text-gray-900">
                {binStats?.totalBins || 0}
              </p>
            </div>
            <Trash2 className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overflow Bins</p>
              <p className="text-3xl font-bold text-red-600">
                {binStats?.overflowBins || 0}
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Waste</p>
              <p className="text-3xl font-bold text-gray-900">
                {wasteStats?.total_weight_kg.toFixed(1) || 0} kg
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Waste Types</p>
              <p className="text-3xl font-bold text-gray-900">
                {wasteStats?.by_type.length || 0}
              </p>
            </div>
            <BarChart3 className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Bins by Type */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Bins by Type</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {binStats?.byType.map((item) => (
            <div key={item.bin_type} className="text-center">
              <div
                className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  backgroundColor: BIN_TYPE_COLORS[item.bin_type] + '20',
                }}
              >
                <Trash2 style={{ color: BIN_TYPE_COLORS[item.bin_type] }} />
              </div>
              <p className="text-2xl font-semibold">{item._count.id}</p>
              <p className="text-sm text-gray-600">
                {BIN_TYPE_LABELS[item.bin_type]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Waste Collection Stats */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Waste Collection This Month
        </h3>
        <div className="space-y-3">
          {wasteStats?.by_type.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-gray-700">
                {item.waste_type || 'Unknown'}
              </span>
              <div className="flex items-center gap-3">
                <div className="h-2 w-32 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${(item.total_weight / (wasteStats?.total_weight_kg || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-20 text-right font-semibold">
                  {item.total_weight.toFixed(1)} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => onNavigate('bins')}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-4 font-semibold text-white transition hover:bg-blue-600"
        >
          <MapPin className="h-5 w-5" />
          Manage Bins
        </button>
        <button
          onClick={() => onNavigate('waste')}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-4 font-semibold text-white transition hover:bg-green-600"
        >
          <Trash2 className="h-5 w-5" />
          Log Waste
        </button>
        <button
          onClick={() => onNavigate('nearest')}
          className="flex items-center justify-center gap-2 rounded-lg bg-purple-500 px-6 py-4 font-semibold text-white transition hover:bg-purple-600"
        >
          <Navigation className="h-5 w-5" />
          Find Nearest
        </button>
      </div>
    </div>
  );
}
