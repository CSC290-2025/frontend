import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { BinApiService } from '@/features/waste-management/api/bin.service.api';
import type { BackendBin, BinType } from '@/features/waste-management/types';
import { BIN_TYPE_COLORS, BIN_TYPE_LABELS } from '@/constant';
import AddBinModal from '@/features/waste-management/components/AddBinModal';

export default function BinsManagement() {
  const [bins, setBins] = useState<BackendBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<BinType | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadBins = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterType) filters.bin_type = filterType;
      const data = await BinApiService.getAllBins(filters);
      console.log('Fetched bins for management:', data);
      setBins(data);
    } catch (error) {
      console.error('Error loading bins:', error);
      alert('Failed to load bins. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBins();
  }, [filterType]);

  const handleDeleteBin = async (binId: number) => {
    if (!confirm('Are you sure you want to delete this bin?')) {
      return;
    }
    try {
      await BinApiService.deleteBin(binId);
      loadBins();
    } catch (error) {
      console.error('Error deleting bin:', error);
      alert('Failed to delete bin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bin Management</h2>
          <p className="text-gray-600">Manage and monitor all waste bins</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          Add Bin
        </button>
      </div>

      <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as BinType | '')}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="RECYCLABLE">Recyclable</option>
          <option value="GENERAL">General</option>
          <option value="HAZARDOUS">Hazardous</option>
        </select>
        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2">
          <span className="text-sm font-medium text-gray-700">
            Total Capacity:
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {bins
              .reduce((sum, bin) => sum + (Number(bin.capacity_kg) || 0), 0)
              .toLocaleString()}{' '}
            kg
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading bins...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bins.map((bin) => (
            <div
              key={bin.id}
              className="rounded-lg border border-gray-200 bg-white p-5 transition hover:shadow-lg"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: BIN_TYPE_COLORS[bin.bin_type] + '20',
                    }}
                  >
                    <Trash2
                      style={{ color: BIN_TYPE_COLORS[bin.bin_type] }}
                      className="h-5 w-5"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {bin.bin_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {BIN_TYPE_LABELS[bin.bin_type]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">
                    {bin.capacity_kg ? `${bin.capacity_kg} kg` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">Capacity</p>
                </div>
              </div>
              <div className="mb-4 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin className="h-10 w-10" />
                  {bin.address ||
                    `${bin.latitude.toFixed(4)}, ${bin.longitude.toFixed(4)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteBin(bin.id)}
                  className="rounded bg-red-500 px-3 py-2 text-sm text-white transition hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddBinModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadBins();
          }}
        />
      )}
    </div>
  );
}
