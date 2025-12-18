import { Info, Eye, EyeOff } from 'lucide-react';

interface TrafficLegendProps {
  totalLights: number;
  activeLights: number;
  brokenLights: number;
  emergencyVehicles: number;
  junctionsOverridden: number;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export default function TrafficLegend({
  totalLights,
  activeLights,
  brokenLights,
  emergencyVehicles,
  junctionsOverridden,
  isVisible = true,
  onToggleVisibility,
}: TrafficLegendProps) {
  // If not visible, show a compact button
  if (!isVisible && onToggleVisibility) {
    return (
      <button
        onClick={onToggleVisibility}
        className="absolute top-4 right-4 z-10 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm hover:bg-gray-50"
        title="Show System Status"
      >
        <Eye className="h-5 w-5 text-slate-600" />
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10 max-w-sm rounded-lg border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-gray-800">System Status</h3>
        </div>
        {onToggleVisibility && (
          <button
            onClick={onToggleVisibility}
            className="rounded p-1 hover:bg-gray-100"
            title="Hide System Status"
          >
            <EyeOff className="h-4 w-4 text-slate-600" />
          </button>
        )}
      </div>

      {/* Content - Always visible */}
      <div className="p-3">
        {/* Status */}
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-700">Total Signals</span>
            </div>
            <span className="text-sm font-bold text-gray-800">
              {totalLights}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Active</span>
            </div>
            <span className="text-sm font-bold text-gray-800">
              {activeLights}
            </span>
          </div>
          {brokenLights > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-gray-700">
                  Broken/Maintenance
                </span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {brokenLights}
              </span>
            </div>
          )}
        </div>

        {/* Light Colors */}
        <div className="mb-3 border-t border-gray-200 pt-3">
          <p className="mb-2 text-xs font-semibold text-gray-600">
            Signal Colors
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-700">Red - Stop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <span className="text-xs text-gray-700">
                Yellow - Prepare to stop
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-700">Green - Go</span>
            </div>
          </div>
        </div>

        {/* Emergency Alerts */}
        {emergencyVehicles > 0 && (
          <div className="mb-3 rounded-lg border-2 border-red-200 bg-red-50 p-2">
            <div className="flex items-center gap-2">
              <div className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-800">
                  {emergencyVehicles} Emergency Vehicle
                  {emergencyVehicles !== 1 ? 's' : ''}
                </p>
                {junctionsOverridden > 0 && (
                  <p className="text-xs text-red-600">
                    {junctionsOverridden} junction
                    {junctionsOverridden !== 1 ? 's' : ''} overridden
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="border-t border-gray-200 pt-2">
          <p className="text-xs text-gray-500">
            Click signals for details. Emergency vehicles auto-trigger green
            lights.
          </p>
        </div>
      </div>
    </div>
  );
}
