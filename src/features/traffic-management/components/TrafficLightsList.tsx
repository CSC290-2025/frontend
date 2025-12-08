import { useState, useEffect, useMemo } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, Navigation2Icon, CircleIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrafficLights } from '../api/traffic-feature.api';
import type { trafficLight } from '../types/traffic.types';

interface TrafficLight {
  color: 'red' | 'yellow' | 'green';
  direction: string;
  lat: number;
  lng: number;
  online: boolean;
  remainingTime: number;
  timestamp: number;
}

interface SignalWithMeta extends TrafficLight {
  junctionId: string;
  source?: 'firebase' | 'api';
}

function parseCoordinate(value: any): number | null {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function isValidSignal(signal: any): boolean {
  const lat = parseCoordinate(signal?.lat);
  const lng = parseCoordinate(signal?.lng);
  return lat !== null && lng !== null;
}

interface TrafficLightsListProps {
  onSignalSelect: (signal: SignalWithMeta) => void;
  selectedSignal: SignalWithMeta | null;
}

export default function TrafficLightsList({
  onSignalSelect,
  selectedSignal,
}: TrafficLightsListProps) {
  const [signals, setSignals] = useState<SignalWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper function to convert API traffic light to SignalWithMeta format
  const convertApiTrafficLight = (
    light: trafficLight
  ): SignalWithMeta | null => {
    if (
      !light.location?.coordinates ||
      light.location.coordinates.length !== 2
    ) {
      return null;
    }

    const [lng, lat] = light.location.coordinates;

    // Map current_color (0=red, 1=yellow, 2=green) to color string
    const colorMap: { [key: number]: 'red' | 'yellow' | 'green' } = {
      0: 'red',
      1: 'yellow',
      2: 'green',
    };

    return {
      color: colorMap[light.current_color] || 'red',
      direction: `Light ${light.id}`,
      lat,
      lng,
      online: light.status === 1, // Assuming status 1 means online
      remainingTime: light.green_duration || 0,
      timestamp: new Date(light.last_updated).getTime(),
      junctionId: `Intersection-${light.intersection_id}`,
      source: 'api',
    };
  };

  useEffect(() => {
    setLoading(true);
    let firebaseSignals: SignalWithMeta[] = [];
    let apiSignals: SignalWithMeta[] = [];

    // Fetch from REST API
    const fetchApiData = async () => {
      try {
        const response = await getTrafficLights();
        if (response.success && response.data?.trafficLights) {
          apiSignals = response.data.trafficLights
            .map(convertApiTrafficLight)
            .filter((signal): signal is SignalWithMeta => signal !== null);

          // Merge with Firebase signals
          setSignals([...firebaseSignals, ...apiSignals]);
        }
      } catch (err) {
        console.error('Failed to fetch traffic lights from API:', err);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to Firebase
    const team10Ref = ref(database, 'teams/10/junctions');
    const unsubscribe = onValue(
      team10Ref,
      (snapshot) => {
        try {
          const data = snapshot.val();

          if (!data) {
            firebaseSignals = [];
          } else {
            const allSignals: SignalWithMeta[] = [];

            Object.entries(data).forEach(
              ([junctionId, junctionData]: [string, any]) => {
                if (junctionData?.lights) {
                  Object.entries(junctionData.lights).forEach(
                    ([lightKey, light]: [string, any]) => {
                      if (
                        light &&
                        typeof light === 'object' &&
                        isValidSignal(light)
                      ) {
                        const lat = parseCoordinate(light.lat);
                        const lng = parseCoordinate(light.lng);

                        if (lat !== null && lng !== null) {
                          allSignals.push({
                            color: light.color || 'red',
                            direction: light.direction || lightKey,
                            lat,
                            lng,
                            online: light.online ?? true,
                            remainingTime: parseInt(light.remainingTime) || 0,
                            timestamp: light.timestamp || Date.now(),
                            junctionId,
                            source: 'firebase',
                          });
                        }
                      }
                    }
                  );
                }
              }
            );

            firebaseSignals = allSignals;
          }

          // Merge with API signals
          setSignals([...firebaseSignals, ...apiSignals]);
        } catch (err) {
          console.error('Firebase error:', err);
        }
      },
      (err) => {
        console.error('Firebase subscription error:', err);
      }
    );

    // Fetch API data
    fetchApiData();

    return () => {
      off(team10Ref);
    };
  }, []);

  const filteredSignals = useMemo(() => {
    if (!searchQuery.trim()) return signals;

    const query = searchQuery.toLowerCase();
    return signals.filter(
      (signal) =>
        signal.junctionId.toLowerCase().includes(query) ||
        signal.direction.toLowerCase().includes(query) ||
        signal.color.toLowerCase().includes(query)
    );
  }, [signals, searchQuery]);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getColorTextClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'text-red-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'green':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const isSignalSelected = (signal: SignalWithMeta) => {
    return (
      selectedSignal?.junctionId === signal.junctionId &&
      selectedSignal?.direction === signal.direction
    );
  };

  return (
    <Card className="ml-4 h-full w-80 shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Traffic Lights</CardTitle>
        <div className="relative mt-2">
          <SearchIcon className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search junction, direction, color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="flex h-40 items-center justify-center p-4 text-center">
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'No traffic lights found'
                : 'No traffic lights available'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-15rem)]">
            <div className="space-y-2 p-4">
              {filteredSignals.map((signal, index) => {
                const isSelected = isSignalSelected(signal);
                return (
                  <div
                    key={`${signal.junctionId}-${signal.direction}-${index}`}
                    className={`cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => onSignalSelect(signal)}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {signal.junctionId}
                          </h3>
                          {!signal.online && (
                            <Badge variant="destructive" className="text-xs">
                              Offline
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Direction: {signal.direction}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSignalSelect(signal);
                        }}
                        className="h-8 w-8 p-0"
                        title={isSelected ? 'Deselect' : 'Jump to location'}
                      >
                        <Navigation2Icon
                          className={`h-4 w-4 ${isSelected ? 'text-blue-600' : ''}`}
                        />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <CircleIcon
                          className={`h-4 w-4 ${getColorClass(signal.color)} rounded-full`}
                        />
                        <span
                          className={`text-sm font-medium capitalize ${getColorTextClass(signal.color)}`}
                        >
                          {signal.color}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1">
                        <span className="text-xs font-medium text-gray-700">
                          {signal.remainingTime}s
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {signal.lat.toFixed(6)}, {signal.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="border-t p-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Total: {signals.length}</span>
            <span>Online: {signals.filter((s) => s.online).length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
