import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { ApiService } from '@/features/waste-management/api/api';
import type { WasteType } from '@/features/waste-management/types';

export default function WasteLogging() {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadWasteTypes = async () => {
      try {
        const types = await ApiService.getWasteTypes();
        setWasteTypes(types);
      } catch (error) {
        console.error('Error loading waste types:', error);
      }
    };
    loadWasteTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !weight) return;
    try {
      setLoading(true);
      await ApiService.logWaste(selectedType, parseFloat(weight));
      setSuccess(true);
      setSelectedType('');
      setWeight('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error logging waste:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Log Waste Collection
        </h2>
        <p className="text-gray-600">Record waste collection events</p>
      </div>
      <div className="max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Waste Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select waste type</option>
                {wasteTypes.map((type) => (
                  <option key={type.id} value={type.type_name}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                placeholder="Enter weight in kilograms"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-white transition hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Logging...' : 'Log Waste'}
              {success && <Check className="h-5 w-5" />}
            </button>
          </form>
          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              <Check className="h-5 w-5" />
              Waste logged successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
