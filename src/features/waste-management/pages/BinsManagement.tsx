import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Check, X } from 'lucide-react';
import { ApiService } from '@/features/waste-management/api/api';
import type {
  Bin,
  BinType,
  BinStatus,
} from '@/features/waste-management/types';
import {
  BIN_TYPE_COLORS,
  BIN_STATUS_COLORS,
  BIN_TYPE_LABELS,
} from '@/constant';
import AddBinModal from '@/features/waste-management/components/AddBinModal';

export default function BinsManagement() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<BinType | ''>('');
  const [filterStatus, setFilterStatus] = useState<BinStatus | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

  const loadBins = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterType) filters.bin_type = filterType;
      if (filterStatus) filters.status = filterStatus;
      const data = await ApiService.getAllBins(filters);
      setBins(data);
    } catch (error) {
      console.error('Error loading bins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBins();
  }, [filterType, filterStatus]);

  const handleStatusUpdate = async (binId: number, newStatus: BinStatus) => {
    try {
      await ApiService.updateBinStatus(binId, newStatus);
      loadBins();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRecordCollection = async (binId: number, weight?: number) => {
    try {
      await ApiService.recordCollection(binId, weight);
      loadBins();
    } catch (error) {
      console.error('Error recording collection:', error);
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
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add Bin
        </button>
      </div>

      {/* Filters */}
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
          <option value="ORGANIC">Organic</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as BinStatus | '')}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="NORMAL">Normal</option>
          <option value="OVERFLOW">Overflow</option>
          <option value="NEEDS_COLLECTION">Needs Collection</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      {/* Bins Grid */}
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
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: BIN_STATUS_COLORS[bin.status] + '20',
                    color: BIN_STATUS_COLORS[bin.status],
                  }}
                >
                  {bin.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mb-4 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {bin.address ||
                    `${bin.latitude.toFixed(4)}, ${bin.longitude.toFixed(4)}`}
                </p>
                {bin.capacity_kg && <p>Capacity: {bin.capacity_kg} kg</p>}
                <p>Collected: {bin.total_collected_weight.toFixed(1)} kg</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRecordCollection(bin.id, 10)}
                  className="flex-1 rounded bg-green-500 py-2 text-sm text-white transition hover:bg-green-600"
                >
                  Collect
                </button>
                <button
                  onClick={() => setSelectedBin(bin)}
                  className="flex-1 rounded bg-gray-200 py-2 text-sm text-gray-700 transition hover:bg-gray-300"
                >
                  Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {selectedBin && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Update Status: {selectedBin.bin_name}
              </h3>
              <button onClick={() => setSelectedBin(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {(
                [
                  'NORMAL',
                  'OVERFLOW',
                  'NEEDS_COLLECTION',
                  'MAINTENANCE',
                ] as BinStatus[]
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    handleStatusUpdate(selectedBin.id, status);
                    setSelectedBin(null);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition hover:bg-gray-100"
                  style={{
                    backgroundColor:
                      selectedBin.status === status
                        ? BIN_STATUS_COLORS[status] + '20'
                        : 'transparent',
                  }}
                >
                  {status.replace('_', ' ')}
                  {selectedBin.status === status && (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Bin Modal */}
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
