import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import type {
  BinType,
  CreateBinData,
  Coordinates,
} from '@/features/waste-management/types';
import { BinApiService } from '@/features/waste-management/api/bin.service.api';

const BANGKOK_COORDS: [number, number] = [13.7563, 100.5018];

const icon = new URL(
  'leaflet/dist/images/marker-icon.png',
  import.meta.url
).toString();
const iconShadow = new URL(
  'leaflet/dist/images/marker-shadow.png',
  import.meta.url
).toString();

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (coords: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onMapClick({ lat, lng });
    },
  });
  return null;
}

function RecenterMap({ lat, lng }: Coordinates) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface AddBinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBinModal({ onClose, onSuccess }: AddBinModalProps) {
  const [formData, setFormData] = useState<CreateBinData>({
    bin_name: '',
    bin_type: 'GENERAL',
    latitude: BANGKOK_COORDS[0],
    longitude: BANGKOK_COORDS[1],
    address: '',
    capacity_kg: 100,
  });
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(BANGKOK_COORDS);
  const [locationSearch, setLocationSearch] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);

  const handleMapClick = (coords: Coordinates) => {
    setFormData({
      ...formData,
      latitude: coords.lat,
      longitude: coords.lng,
    });
    setMapCenter([coords.lat, coords.lng]);
  };

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

        setFormData({
          ...formData,
          latitude: lat,
          longitude: lng,
          address: result.display_name || locationSearch,
        });
        setMapCenter([lat, lng]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.bin_name.trim()) {
        alert('Bin name is required');
        setLoading(false);
        return;
      }

      if (!formData.latitude || !formData.longitude) {
        alert('Please select a location on the map');
        setLoading(false);
        return;
      }

      if (isNaN(formData.latitude) || isNaN(formData.longitude)) {
        alert('Invalid coordinates. Please select a location on the map.');
        setLoading(false);
        return;
      }

      await BinApiService.createBin(formData);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating bin:', error);
      const errorMessage =
        error?.message || 'Failed to create bin. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add New Bin</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
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
                </select>
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
                  min="1"
                  value={formData.capacity_kg || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity_kg: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
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
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        latitude: lat,
                      });
                      setMapCenter([lat, formData.longitude]);
                    }}
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
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        longitude: lng,
                      });
                      setMapCenter([formData.latitude, lng]);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search Location
              </label>
              <div className="mb-2 flex gap-2">
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
                  placeholder="Search for a location (e.g., Bangkok, KMUTT)"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  disabled={searchingLocation}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600 disabled:bg-blue-300"
                >
                  <Search className="h-4 w-4" />
                  {searchingLocation ? 'Searching...' : 'Search'}
                </button>
              </div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Click on map to set location
              </label>
              <div className="h-64 w-full overflow-hidden rounded-lg border border-gray-300">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  className="h-full w-full"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap
                    lat={formData.latitude}
                    lng={formData.longitude}
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  <Marker position={[formData.latitude, formData.longitude]} />
                </MapContainer>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Click anywhere on the map to set the bin location
              </p>
            </div>
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
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Add Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
