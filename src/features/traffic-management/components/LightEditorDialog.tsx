import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Wrench, CheckCircle } from 'lucide-react';

interface LightEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    lightKey: string,
    greenDuration: number,
    yellowDuration: number,
    status: number
  ) => void;
  lightKey: string;
  initialGreenDuration?: number;
  initialYellowDuration?: number;
  initialStatus?: number;
  direction?: string;
  junctionId?: string;
}

const STATUS_OPTIONS = [
  {
    value: 0,
    label: 'Normal',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  {
    value: 1,
    label: 'Broken',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
  {
    value: 2,
    label: 'Fixing',
    icon: Wrench,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
];

export default function LightEditorDialog({
  open,
  onClose,
  onSave,
  lightKey,
  initialGreenDuration = 27,
  initialYellowDuration = 3,
  initialStatus = 0,
  direction = '',
  junctionId = '',
}: LightEditorDialogProps) {
  const [greenDuration, setGreenDuration] = useState(initialGreenDuration);
  const [yellowDuration, setYellowDuration] = useState(initialYellowDuration);
  const [status, setStatus] = useState(initialStatus);

  // Reset form when dialog opens with new light
  useEffect(() => {
    if (open) {
      setGreenDuration(initialGreenDuration);
      setYellowDuration(initialYellowDuration);
      setStatus(initialStatus);
    }
  }, [open, initialGreenDuration, initialYellowDuration, initialStatus]);

  if (!open) return null;

  const handleSave = () => {
    onSave(lightKey, greenDuration, yellowDuration, status);
  };

  const totalCycleDuration = greenDuration + yellowDuration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Edit Light Settings
            </h2>
            <p className="text-sm text-gray-500">
              {junctionId} - {direction}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Status Selection */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Light Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = status === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setStatus(option.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition ${
                      isSelected
                        ? `${option.bgColor} border-current ${option.color}`
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${isSelected ? option.color : ''}`}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {status === 1 && (
              <p className="mt-2 text-xs text-red-600">
                Broken lights will not be included in cycle calculations
              </p>
            )}
            {status === 2 && (
              <p className="mt-2 text-xs text-yellow-600">
                Fixing lights will not be included in cycle calculations
              </p>
            )}
          </div>

          {/* Green Duration */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Green Duration (seconds)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="120"
                value={greenDuration}
                onChange={(e) => setGreenDuration(parseInt(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-green-200 accent-green-500"
              />
              <div className="flex w-20 items-center rounded-lg border border-gray-300 bg-white">
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={greenDuration}
                  onChange={(e) =>
                    setGreenDuration(
                      Math.max(5, Math.min(120, parseInt(e.target.value) || 5))
                    )
                  }
                  className="w-full rounded-lg px-3 py-2 text-center text-sm font-bold text-green-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Yellow Duration */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Yellow Duration (seconds)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={yellowDuration}
                onChange={(e) => setYellowDuration(parseInt(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-yellow-200 accent-yellow-500"
              />
              <div className="flex w-20 items-center rounded-lg border border-gray-300 bg-white">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={yellowDuration}
                  onChange={(e) =>
                    setYellowDuration(
                      Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-full rounded-lg px-3 py-2 text-center text-sm font-bold text-yellow-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Green Phase:</span>
                <span className="font-semibold text-green-600">
                  {greenDuration}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Yellow Phase:</span>
                <span className="font-semibold text-yellow-600">
                  {yellowDuration}s
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                <span className="font-medium">Total Cycle:</span>
                <span className="font-bold text-gray-800">
                  {totalCycleDuration}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
