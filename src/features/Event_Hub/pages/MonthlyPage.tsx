import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CloudRain,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';

// API Imports
import {
  fetchEventsByDay,
  fetchEvents,
} from '@/features/Event_Hub/api/Event.api';
import { fetchDailyRainForecast } from '@/features/Event_Hub/api/weather.api';

interface MonthlyPageProps {
  setActiveTab: (tab: string) => void;
}

interface EventItem {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
}

type RainDataMap = { [date: string]: number | null };
type MonthlyEventsMap = { [date: string]: EventItem[] };

const MonthlyPage: React.FC<MonthlyPageProps> = ({ setActiveTab }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthlyEventsMap, setMonthlyEventsMap] = useState<MonthlyEventsMap>(
    {}
  );
  const [dailyRainForecast, setDailyRainForecast] = useState<RainDataMap>({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // --- HELPER: Safe Data Extraction ---
  const extractArray = (res: any): any[] => {
    // Check console to see exactly what API returns
    console.log('Raw API Response:', res);

    if (Array.isArray(res)) return res;
    if (res?.data?.items && Array.isArray(res.data.items))
      return res.data.items;
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.items && Array.isArray(res.items)) return res.items;

    // Fallback for object with numbered keys (edge case)
    if (res && typeof res === 'object') return Object.values(res);

    return [];
  };

  // --- HELPER: Transform Event Data ---
  // Handles cases where API returns 'start_date'/'start_time' instead of 'start_at'
  const transformEvent = (e: any): EventItem | null => {
    // Construct ISO strings if fields are separate
    let start = e.start_at;
    let end = e.end_at;

    if (!start && e.start_date) {
      start = `${e.start_date}T${e.start_time || '00:00:00'}`;
    }
    if (!end && e.end_date) {
      end = `${e.end_date}T${e.end_time || '23:59:59'}`;
    }

    if (!start) return null; // Skip invalid events

    return {
      id: e.id?.toString() || Math.random().toString(),
      title: e.title || 'Untitled Event',
      start_at: start,
      end_at: end || start, // Fallback end to start if missing
    };
  };

  // --- API: Fetch Rain (Max 7 Days) ---
  const fetchRainData = useCallback(async () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;
    const startDate = isCurrentMonth
      ? todayStr
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    try {
      const rawData = await fetchDailyRainForecast(1, startDate, 7);
      const forecast = extractArray(rawData);

      const rainMap: RainDataMap = {};
      forecast.forEach((item: any) => {
        if (item.date) {
          rainMap[item.date] = item.precipitation_probability_max;
        }
      });
      setDailyRainForecast(rainMap);
    } catch (error) {
      console.error('Rain forecast error:', error);
    }
  }, [year, month]);

  // --- API: Fetch Monthly Overview ---
  const fetchMonthlyEvents = useCallback(async () => {
    const fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const toDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;

    try {
      const res = await fetchEvents({ from: fromDate, to: toDate });
      const rawList = extractArray(res);

      const monthlyMap: MonthlyEventsMap = {};
      rawList.forEach((rawEvent: any) => {
        const event = transformEvent(rawEvent);
        if (!event) return;

        // Extract just the date part (YYYY-MM-DD)
        const dateKey = event.start_at.split('T')[0];

        if (!monthlyMap[dateKey]) monthlyMap[dateKey] = [];
        monthlyMap[dateKey].push(event);
      });
      setMonthlyEventsMap(monthlyMap);
    } catch (error) {
      console.error('Monthly overview error:', error);
    }
  }, [year, month, daysInMonth]);

  // --- API: Fetch Day Details ---
  const handleDayClick = async (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setLoading(true);
    setEvents([]);

    try {
      console.log(`Fetching events for day: ${dateStr}`);
      const res = await fetchEventsByDay(dateStr);
      const rawList = extractArray(res);

      console.log('Raw Events List:', rawList);

      const formattedEvents = rawList
        .map(transformEvent)
        .filter((e): e is EventItem => e !== null);

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Fetch daily events error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRainData();
    fetchMonthlyEvents();
    setSelectedDate(null);
  }, [fetchRainData, fetchMonthlyEvents]);

  const filteredEvents = useMemo(() => {
    return searchQuery
      ? events.filter((e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : events;
  }, [events, searchQuery]);

  // --- Date/Time Formatters ---
  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return '--:--';
    }
  };

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length < 42) calendarDays.push(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setActiveTab('events')}
            className="rounded-lg border bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
          >
            ← Back
          </button>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events on selected day..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-cyan-500 sm:w-80"
            />
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border bg-white p-6 shadow-xl">
          <div className="mb-8 flex items-center justify-center gap-8">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>
            <h2 className="text-2xl font-bold">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 border-t border-l">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="border-r border-b bg-gray-50 py-3 text-center text-xs font-bold text-gray-500"
              >
                {d}
              </div>
            ))}
            {calendarDays.map((day, i) => {
              const dateKey = day
                ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : null;
              const rainProb = dateKey ? dailyRainForecast[dateKey] : null;
              const dayEventsCount = dateKey
                ? monthlyEventsMap[dateKey]?.length || 0
                : 0;

              return (
                <div
                  key={i}
                  onClick={() => day && handleDayClick(day)}
                  className={`h-28 border-r border-b p-2 transition-all ${day ? 'cursor-pointer hover:bg-cyan-50' : 'bg-gray-50/30'} ${selectedDate === dateKey ? 'bg-cyan-50' : 'bg-white'}`}
                >
                  {day && (
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${selectedDate === dateKey ? 'bg-cyan-500 text-white' : 'text-gray-700'}`}
                        >
                          {day}
                        </span>
                        {rainProb !== null && rainProb > 30 && (
                          <div className="flex items-center rounded bg-blue-50 px-1 text-[10px] font-bold text-blue-500">
                            <CloudRain className="mr-0.5 h-3 w-3" /> {rainProb}%
                          </div>
                        )}
                      </div>
                      <div className="mt-1">
                        {dayEventsCount > 0 && (
                          <div className="truncate rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-bold text-cyan-700">
                            {dayEventsCount} Event(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Event List */}
          {selectedDate && (
            <div className="mt-8 border-t pt-6">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                Events on{' '}
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  dateStyle: 'long',
                })}
              </h3>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between rounded-xl border p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-cyan-100 p-2">
                            <Calendar className="h-5 w-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Starts: {formatTime(event.start_at)}
                            </p>
                          </div>
                        </div>
                        <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600">
                          Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-gray-400">
                      No events found for this day.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyPage;
