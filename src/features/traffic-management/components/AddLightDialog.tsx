import { useState, useEffect, useRef } from 'react';
import { X, Plus, MapPin, MousePointer2, Check, ChevronUp } from 'lucide-react';

interface AddLightDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    junctionId: string,
    roadId: number,
    lat: number,
    lng: number
  ) => void;
  junctionId: string;
  existingRoadIds: number[];
  onStartPickingPosition?: () => void;
  onStopPickingPosition?: () => void;
  isPickingPosition?: boolean;
  pickedPosition?: { lat: number; lng: number } | null;
  existingLightPositions?: Array<{
    lat: number;
    lng: number;
    direction: string;
  }>;
}

export default function AddLightDialog({
  open,
  onClose,
  onSave,
  junctionId,
  existingRoadIds,
  onStartPickingPosition,
  onStopPickingPosition,
  isPickingPosition = false,
  pickedPosition,
  existingLightPositions = [],
}: AddLightDialogProps) {
  const [roadId, setRoadId] = useState<number>(1);
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Track if we've initialized coordinates for this dialog session
  const initializedRef = useRef(false);
  const prevOpenRef = useRef(false);

  // Reset initialization flag when dialog closes
  useEffect(() => {
    if (!open && prevOpenRef.current) {
      // Dialog just closed - reset for next open
      initializedRef.current = false;
    }
    prevOpenRef.current = open;
  }, [open]);

  // Calculate next available road ID (updates when existingRoadIds changes)
  useEffect(() => {
    if (open) {
      const maxRoadId =
        existingRoadIds.length > 0 ? Math.max(...existingRoadIds) : 0;
      setRoadId(maxRoadId + 1);
      setError('');
    }
  }, [open, existingRoadIds]);

  // Set initial coordinates ONLY once when dialog first opens
  useEffect(() => {
    if (open && !initializedRef.current) {
      initializedRef.current = true;
      // Set initial coordinates from first existing light or default
      if (existingLightPositions.length > 0) {
        setLat(existingLightPositions[0].lat.toFixed(6));
        setLng(existingLightPositions[0].lng.toFixed(6));
      } else {
        setLat('13.647372');
        setLng('100.495536');
      }
    }
  }, [open, existingLightPositions]);

  // Update coordinates when position is picked from map
  useEffect(() => {
    if (pickedPosition) {
      setLat(pickedPosition.lat.toFixed(6));
      setLng(pickedPosition.lng.toFixed(6));
      setError('');
      // Auto-stop picking after a position is selected
      onStopPickingPosition?.();
    }
  }, [pickedPosition, onStopPickingPosition]);

  // Stop picking when dialog closes
  useEffect(() => {
    if (!open && isPickingPosition && onStopPickingPosition) {
      onStopPickingPosition();
    }
  }, [open, isPickingPosition, onStopPickingPosition]);

  if (!open) return null;

  const handleSave = () => {
    // Validate road ID
    if (existingRoadIds.includes(roadId)) {
      setError(`Road-${roadId} already exists in this junction`);
      return;
    }

    // Validate coordinates
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Invalid latitude (must be between -90 and 90)');
      return;
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Invalid longitude (must be between -180 and 180)');
      return;
    }

    // Stop picking mode if active
    if (isPickingPosition && onStopPickingPosition) {
      onStopPickingPosition();
    }

    onSave(junctionId, roadId, latNum, lngNum);
  };

  const handleClose = () => {
    if (isPickingPosition && onStopPickingPosition) {
      onStopPickingPosition();
    }
    onClose();
  };

  const handlePickFromMap = () => {
    if (isPickingPosition) {
      onStopPickingPosition?.();
    } else {
      onStartPickingPosition?.();
    }
  };

  const handleUseExistingPosition = (position: {
    lat: number;
    lng: number;
  }) => {
    setLat(position.lat.toFixed(6));
    setLng(position.lng.toFixed(6));
    setError('');
  };

  // When picking position, show minimized floating bar instead of full dialog
  if (isPickingPosition) {
    return (
      <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-4 rounded-xl bg-green-600 px-6 py-4 text-white shadow-2xl">
          <MousePointer2 className="h-6 w-6 animate-pulse" />
          <div>
            <p className="font-semibold">Click on the map to select position</p>
            <p className="text-sm text-green-100">
              Adding light to {junctionId}
            </p>
          </div>
          <button
            onClick={handlePickFromMap}
            className="ml-4 flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30"
          >
            <ChevronUp className="h-4 w-4" />
            Cancel
          </button>
        </div>
        {pickedPosition && (
          <div className="mt-2 rounded-lg bg-white px-4 py-2 text-center text-sm text-gray-700 shadow-lg">
            Selected: {pickedPosition.lat.toFixed(6)},{' '}
            {pickedPosition.lng.toFixed(6)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Add New Traffic Light
            </h2>
            <p className="text-sm text-gray-500">{junctionId}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-6">
          {/* Road ID */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Road ID
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Road-</span>
              <input
                type="number"
                min="1"
                max="99"
                value={roadId}
                onChange={(e) => {
                  setRoadId(parseInt(e.target.value) || 1);
                  setError('');
                }}
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center font-semibold focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
              />
            </div>
            {existingRoadIds.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Existing roads:{' '}
                {existingRoadIds.sort((a, b) => a - b).join(', ')}
              </p>
            )}
          </div>

          {/* Coordinates */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin className="h-4 w-4" />
              Location Coordinates
            </label>

            {/* Pick from Map Button */}
            {onStartPickingPosition && (
              <button
                onClick={handlePickFromMap}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-green-400 hover:bg-green-50 hover:text-green-700"
              >
                <MousePointer2 className="h-4 w-4" />
                Pick Position from Map
              </button>
            )}

            {/* Quick select from existing lights */}
            {existingLightPositions.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs text-gray-500">
                  Or use position near existing light:
                </p>
                <div className="flex flex-wrap gap-1">
                  {existingLightPositions.map((pos, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUseExistingPosition(pos)}
                      className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-200"
                    >
                      {pos.direction}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Latitude
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => {
                    setLat(e.target.value);
                    setError('');
                  }}
                  placeholder="13.647372"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Longitude
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => {
                    setLng(e.target.value);
                    setError('');
                  }}
                  placeholder="100.495536"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">
              Default Settings
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Green Duration:</span>
                <span className="font-medium text-green-600">27s</span>
              </div>
              <div className="flex justify-between">
                <span>Yellow Duration:</span>
                <span className="font-medium text-yellow-600">3s</span>
              </div>
              <div className="flex justify-between">
                <span>Initial State:</span>
                <span className="font-medium text-red-600">Red</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              You can edit these settings after adding the light
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Add Light
          </button>
        </div>
      </div>
    </div>
  );
}
