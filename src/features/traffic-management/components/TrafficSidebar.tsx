import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Filter,
  AlertTriangle,
  Activity,
  MapPin,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';

interface SignalWithMeta {
  color: 'red' | 'yellow' | 'green';
  direction: string;
  lat: number;
  lng: number;
  online: boolean;
  remainingTime: number;
  timestamp: number;
  junctionId: string;
  status?: number; // 0=normal, 1=broken, 2=fixing
}

interface TrafficSidebarProps {
  signals: SignalWithMeta[];
  selectedSignal: SignalWithMeta | null;
  onSignalSelect: (signal: SignalWithMeta) => void;
  mapInstance?: google.maps.Map | null;
  showBrokenLights?: boolean;
  onToggleBrokenLights?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function TrafficSidebar({
  signals,
  selectedSignal,
  onSignalSelect,
  showBrokenLights = true,
  onToggleBrokenLights,
  searchQuery = '',
  onSearchChange,
}: TrafficSidebarProps) {
  const [colorFilter, setColorFilter] = useState<
    'all' | 'red' | 'yellow' | 'green'
  >('all');
  const [junctionFilter, setJunctionFilter] = useState<string>('all');

  // Ref for auto-scrolling to selected signal
  const signalItemsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  // Auto-scroll to selected signal
  useEffect(() => {
    if (selectedSignal) {
      const key = `${selectedSignal.junctionId}-${selectedSignal.direction}`;
      const element = signalItemsRef.current[key];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedSignal?.junctionId, selectedSignal?.direction]);

  // Get unique junctions
  const junctions = useMemo(() => {
    const uniqueJunctions = new Set(signals.map((s) => s.junctionId));
    return ['all', ...Array.from(uniqueJunctions)];
  }, [signals]);

  // Filter signals
  const filteredSignals = useMemo(() => {
    let filtered = signals;

    if (colorFilter !== 'all') {
      filtered = filtered.filter((s) => s.color === colorFilter);
    }

    if (junctionFilter !== 'all') {
      filtered = filtered.filter((s) => s.junctionId === junctionFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.junctionId.toLowerCase().includes(query) ||
          s.direction.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [signals, colorFilter, junctionFilter, searchQuery]);

  // Group signals by junction
  const groupedSignals = useMemo(() => {
    const groups: Record<string, SignalWithMeta[]> = {};
    filteredSignals.forEach((signal) => {
      if (!groups[signal.junctionId]) {
        groups[signal.junctionId] = [];
      }
      groups[signal.junctionId].push(signal);
    });
    return Object.entries(groups);
  }, [filteredSignals]);

  // Statistics
  const stats = useMemo(() => {
    const total = signals.length;
    const red = signals.filter(
      (s) => s.color === 'red' && s.status !== 1 && s.status !== 2
    ).length;
    const yellow = signals.filter(
      (s) => s.color === 'yellow' && s.status !== 1 && s.status !== 2
    ).length;
    const green = signals.filter(
      (s) => s.color === 'green' && s.status !== 1 && s.status !== 2
    ).length;
    const active = signals.filter(
      (s) => s.online && s.status !== 1 && s.status !== 2
    ).length;
    const broken = signals.filter(
      (s) => s.status === 1 || s.status === 2
    ).length;

    return { total, red, yellow, green, active, broken };
  }, [signals]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-r border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-slate-900 p-4 text-white">
        <Activity className="h-5 w-5" />
        <h2 className="text-lg font-bold">Traffic Monitor</h2>
      </div>

      {/* Statistics */}
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="grid grid-cols-5 gap-2">
          <div className="rounded-lg bg-white p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Red</p>
            <p className="text-lg font-bold text-gray-800">{stats.red}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Yellow</p>
            <p className="text-lg font-bold text-gray-800">{stats.yellow}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Green</p>
            <p className="text-lg font-bold text-gray-800">{stats.green}</p>
          </div>
          <div className="rounded-lg bg-gray-100 p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Broken</p>
            <p className="text-lg font-bold text-gray-800">{stats.broken}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <span className="text-sm font-medium text-gray-700">
          Traffic Signals ({filteredSignals.length})
        </span>
      </div>

      {/* Search Bar */}
      {onSearchChange && (
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search junction..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-700">Filters</span>
          </div>
          {onToggleBrokenLights && (
            <button
              onClick={onToggleBrokenLights}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition ${
                showBrokenLights
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {showBrokenLights ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              Broken Lights
            </button>
          )}
        </div>

        {/* Color Filter */}
        <div className="mb-2">
          <label className="mb-1 block text-xs text-gray-600">Color</label>
          <div className="flex gap-1">
            <button
              onClick={() => setColorFilter('all')}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                colorFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setColorFilter('red')}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                colorFilter === 'red'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Red
            </button>
            <button
              onClick={() => setColorFilter('yellow')}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                colorFilter === 'yellow'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Yellow
            </button>
            <button
              onClick={() => setColorFilter('green')}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                colorFilter === 'green'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Green
            </button>
          </div>
        </div>

        {/* Junction Filter */}
        <div>
          <label className="mb-1 block text-xs text-gray-600">Junction</label>
          <select
            value={junctionFilter}
            onChange={(e) => setJunctionFilter(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-slate-500 focus:outline-none"
          >
            {junctions.map((junction) => (
              <option key={junction} value={junction}>
                {junction === 'all' ? 'All Junctions' : junction}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-3">
          {groupedSignals.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No signals match your filters</p>
            </div>
          ) : (
            groupedSignals.map(([junctionId, junctionSignals]) => (
              <div
                key={junctionId}
                className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-600" />
                  <span className="font-semibold text-gray-800">
                    {junctionId}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {junctionSignals.length} light
                    {junctionSignals.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {junctionSignals.map((signal, idx) => {
                    const isBrokenOrFixing =
                      signal.status === 1 || signal.status === 2;
                    const statusLabel =
                      signal.status === 1
                        ? 'BROKEN'
                        : signal.status === 2
                          ? 'FIXING'
                          : '';

                    const signalKey = `${signal.junctionId}-${signal.direction}`;
                    return (
                      <button
                        key={idx}
                        ref={(el) => {
                          signalItemsRef.current[signalKey] = el;
                        }}
                        onClick={() => onSignalSelect(signal)}
                        className={`flex items-center justify-between rounded-md border p-2 text-left transition ${
                          selectedSignal?.junctionId === signal.junctionId &&
                          selectedSignal?.direction === signal.direction
                            ? 'border-slate-700 bg-slate-100'
                            : isBrokenOrFixing
                              ? 'border-gray-400 bg-gray-200'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              isBrokenOrFixing
                                ? 'bg-gray-500'
                                : signal.color === 'red'
                                  ? 'bg-red-500'
                                  : signal.color === 'yellow'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                            }`}
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-700">
                              {signal.direction}
                            </span>
                            {isBrokenOrFixing && (
                              <span className="text-[10px] text-gray-500">
                                {statusLabel}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold ${isBrokenOrFixing ? 'text-gray-500' : 'text-gray-800'}`}
                        >
                          {isBrokenOrFixing ? '--' : `${signal.remainingTime}s`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
