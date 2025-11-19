import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { BinType } from '@/features/waste-management/types';
import { ApiService } from '@/features/waste-management/api/api';

interface AddBinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBinModal({ onClose, onSuccess }: AddBinModalProps) {
  const [formData, setFormData] = useState({
    bin_name: '',
    bin_type: 'GENERAL' as BinType,
    latitude: 13.7563,
    longitude: 100.5018,
    address: '',
    capacity_kg: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createBin(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating bin:', error);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add New Bin</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bin Name
            </label>
            <input
              type="text"
              required
              value={formData.bin_name}
              onChange={(e) =>
                setFormData({ ...formData, bin_name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bin Type
            </label>
            <select
              value={formData.bin_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bin_type: e.target.value as BinType,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="RECYCLABLE">Recyclable</option>
              <option value="GENERAL">General</option>
              <option value="HAZARDOUS">Hazardous</option>
              <option value="ORGANIC">Organic</option>
            </select>
          </div>
          {/* Lat/Long Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    latitude: parseFloat(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    longitude: parseFloat(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Capacity (kg)
            </label>
            <input
              type="number"
              value={formData.capacity_kg}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity_kg: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
            >
              Add Bin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
