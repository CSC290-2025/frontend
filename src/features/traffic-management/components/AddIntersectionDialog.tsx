import { useState, useEffect } from 'react';
import { X, Plus, MapPin, MousePointer2, ChevronUp } from 'lucide-react';

interface AddIntersectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (intersectionId: number, lat: number, lng: number) => void;
  existingIntersectionIds: number[];
  onStartPickingPosition?: () => void;
  onStopPickingPosition?: () => void;
  isPickingPosition?: boolean;
  pickedPosition?: { lat: number; lng: number } | null;
}

export default function AddIntersectionDialog({
  open,
  onClose,
  onSave,
  existingIntersectionIds,
  onStartPickingPosition,
  onStopPickingPosition,
  isPickingPosition = false,
  pickedPosition,
}: AddIntersectionDialogProps) {
  const [intersectionId, setIntersectionId] = useState<number>(1);
  const [lat, setLat] = useState<string>('13.647372');
  const [lng, setLng] = useState<string>('100.495536');
  const [error, setError] = useState<string>('');

  // Calculate next available intersection ID
  useEffect(() => {
    if (open) {
      const maxId =
        existingIntersectionIds.length > 0
          ? Math.max(...existingIntersectionIds)
          : 0;
      setIntersectionId(maxId + 1);
      setError('');
    }
  }, [open, existingIntersectionIds]);

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

  // Show picking mode UI even if dialog is "closed" - this takes precedence
  if (isPickingPosition) {
    return (
      <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-4 rounded-xl bg-blue-600 px-6 py-4 text-white shadow-2xl">
          <MousePointer2 className="h-6 w-6 animate-pulse" />
          <div>
            <p className="font-semibold">Click on the map to select position</p>
            <p className="text-sm text-blue-100">
              Creating Inter-{intersectionId}
            </p>
          </div>
          <button
            onClick={() => onStopPickingPosition?.()}
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

  if (!open) return null;

  const handleSave = () => {
    // Validate intersection ID
    if (existingIntersectionIds.includes(intersectionId)) {
      setError(`Inter-${intersectionId} already exists`);
      return;
    }

    if (intersectionId < 1) {
      setError('Intersection ID must be at least 1');
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

    onSave(intersectionId, latNum, lngNum);
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

  // When picking position, show minimized floating bar instead of full dialog
  if (isPickingPosition) {
    return (
      <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-4 rounded-xl bg-blue-600 px-6 py-4 text-white shadow-2xl">
          <MousePointer2 className="h-6 w-6 animate-pulse" />
          <div>
            <p className="font-semibold">Click on the map to select position</p>
            <p className="text-sm text-blue-100">
              Creating Inter-{intersectionId}
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
              Add New Intersection
            </h2>
            <p className="text-sm text-gray-500">
              Create a new traffic light intersection
            </p>
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
          {/* Intersection ID */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Intersection ID
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Inter-</span>
              <input
                type="number"
                min="1"
                max="999"
                value={intersectionId}
                onChange={(e) => {
                  setIntersectionId(parseInt(e.target.value) || 1);
                  setError('');
                }}
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center font-semibold focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
              />
            </div>
            {existingIntersectionIds.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Existing:{' '}
                {existingIntersectionIds.sort((a, b) => a - b).join(', ')}
              </p>
            )}
          </div>

          {/* Coordinates */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin className="h-4 w-4" />
              Location (First Light Position)
            </label>

            {/* Pick from Map Button */}
            {onStartPickingPosition && (
              <button
                onClick={handlePickFromMap}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                <MousePointer2 className="h-4 w-4" />
                Pick Position from Map
              </button>
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
              What will be created
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Initial Light:</span>
                <span className="font-medium">Road-1</span>
              </div>
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
                <span className="font-medium text-green-600">Green</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              You can add more lights after creating the intersection
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
            Create Intersection
          </button>
        </div>
      </div>
    </div>
  );
}
