import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  BinType,
  type Bin,
  type BinFilter,
  type Coordinates,
} from '@/features/waste-management/types';

interface LocationsSideBarProps {
  bins: Bin[];
  selectedBinId: number | null;
  activeTypeFilter: BinFilter;
  loading: boolean;
  onFilterChange: (filter: BinFilter) => void;
  onBinSelect: (binId: number) => void;
  onLocateUser: () => void;
  onLocationSearch?: (coords: Coordinates) => void;
}

export default function LocationsSideBar({
  bins,
  selectedBinId,
  activeTypeFilter,
  loading,
  onFilterChange,
  onBinSelect,
  onLocateUser,
  onLocationSearch,
}: LocationsSideBarProps) {
  const [locationSearch, setLocationSearch] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);

  const typeFilters: readonly BinFilter[] = [
    'All',
    BinType.RECYCLABLE,
    BinType.GENERAL,
    BinType.HAZARDOUS,
  ];

  const handleSearchLocation = async () => {
    if (!locationSearch.trim()) {
      alert('Please enter a location to search');
      return;
    }

    setSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=1`,
        {
          headers: {
            'User-Agent': 'WasteManagementApp',
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        if (onLocationSearch) {
          onLocationSearch({ lat, lng });
        } else {
          window.dispatchEvent(
            new CustomEvent('locationSearch', {
              detail: { lat, lng, address: result.display_name },
            })
          );
        }

        setLocationSearch('');
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Failed to search location. Please try again.');
    } finally {
      setSearchingLocation(false);
    }
  };

  const formatFilterLabel = (filter: BinFilter) => {
    if (filter === 'All') {
      return 'All';
    }

    const lower = filter.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1).replace(/_/g, ' ');
  };

  return (
    <aside className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchLocation();
                }
              }}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 focus:outline-none"
              placeholder="Search location (e.g., Bangkok, KMUTT)"
            />
            <button
              onClick={handleSearchLocation}
              disabled={searchingLocation}
              className="flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-green-700 disabled:bg-green-400"
            >
              <Search className="h-4 w-4" />
              {searchingLocation ? 'Searching...' : 'Search'}
            </button>
          </div>
          <button
            onClick={onLocateUser}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Locating...
              </>
            ) : (
              <>
                <span>📍</span>
                Find Nearest Bin for My Location
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                activeTypeFilter === filter
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {formatFilterLabel(filter)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {bins.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            No locations match the current filters.
          </p>
        )}

        {bins.map((bin) => (
          <button
            key={bin.id}
            onClick={() => onBinSelect(bin.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              selectedBinId === bin.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {bin.name}
                </p>
                <p className={`text-xs ${bin.color}`}>{bin.type}</p>
              </div>
              <span className="text-xs font-semibold text-blue-600">
                {bin.distance}
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
