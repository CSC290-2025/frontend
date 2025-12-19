import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CloudRain,
  Calendar as CalendarIcon,
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

  // --- HELPERS ---

  const getLocalDateString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split('T')[0];
  };

  const isWithinRainRange = (dateStr: string | null) => {
    if (!dateStr) return false;
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);
    return targetDate >= today && targetDate <= sevenDaysFromNow;
  };

  const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (res.data?.days && Array.isArray(res.data.days)) return res.data.days;
    if (res.data?.data?.data && Array.isArray(res.data.data.data))
      return res.data.data.data;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  };

  const transformEvent = (e: any): EventItem | null => {
    const start =
      e.start_at ||
      (e.start_date ? `${e.start_date}T${e.start_time || '00:00:00'}` : null);
    if (!start) return null;
    return {
      id: e.id?.toString() || Math.random().toString(),
      title: e.title || 'Untitled Event',
      start_at: start,
      end_at: e.end_at || start,
    };
  };

  // --- API CALLS ---
  const fetchRainData = useCallback(async () => {
    const todayStr = getLocalDateString(new Date());
    try {
      const forecastDays = await fetchDailyRainForecast(1, todayStr, 7);
      const rainMap: RainDataMap = {};
      console.log(forecastDays);
      const rawDays = extractArray({ data: forecastDays }); // Using your helper to ensure it's an array
      console.log(rawDays);
      rawDays.forEach((item: any) => {
        // Ensure we extract only the YYYY-MM-DD part from the API date
        if (item.date) {
          const formattedDate = new Date(item.date).toISOString().split('T')[0];
          rainMap[formattedDate] = item.precipitation_probability_max;
        }
      });
      setDailyRainForecast(rainMap);
    } catch (error) {
      console.error('Rain forecast error:', error);
    }
  }, []);

  const fetchMonthlyEvents = useCallback(async () => {
    const fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const toDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;
    try {
      const res = await fetchEvents({ from: fromDate, to: toDate });
      const rawList = extractArray(res);
      const monthlyMap: MonthlyEventsMap = {};
      rawList.forEach((rawEvent: any) => {
        const event = transformEvent(rawEvent);
        if (event) {
          const dateKey = event.start_at.split('T')[0];
          if (!monthlyMap[dateKey]) monthlyMap[dateKey] = [];
          monthlyMap[dateKey].push(event);
        }
      });
      setMonthlyEventsMap(monthlyMap);
    } catch (error) {
      console.error('Monthly overview error:', error);
    }
  }, [year, month, daysInMonth]);

  const handleDayClick = async (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setLoading(true);
    try {
      const res = await fetchEventsByDay(dateStr);
      const rawList = extractArray(res);
      setEvents(
        rawList.map(transformEvent).filter((e): e is EventItem => e !== null)
      );
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
        {/* Navigation Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setActiveTab('events')}
            className="rounded-lg border bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100"
          >
            ← Back
          </button>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheduled events..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-cyan-500 sm:w-80"
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {/* Calendar Controls */}
          <div className="mb-8 flex items-center justify-center gap-8">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 overflow-hidden rounded-lg border-t border-l">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="border-r border-b bg-gray-50 py-3 text-center text-xs font-bold tracking-wider text-gray-400 uppercase"
              >
                {d}
              </div>
            ))}
            {calendarDays.map((day, i) => {
              const dateKey = day
                ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : null;
              const count = dateKey
                ? monthlyEventsMap[dateKey]?.length || 0
                : 0;

              // Logic for Rain Display
              const isInRange = dateKey && isWithinRainRange(dateKey);
              const rainValue = dateKey ? dailyRainForecast[dateKey] : null;

              return (
                <div
                  key={i}
                  onClick={() => day && handleDayClick(day)}
                  className={`relative h-28 border-r border-b p-2 transition-all ${day ? 'cursor-pointer hover:bg-cyan-50/50' : 'bg-gray-50/30'} ${selectedDate === dateKey ? 'bg-cyan-50' : 'bg-white'}`}
                >
                  {day && (
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${selectedDate === dateKey ? 'bg-cyan-500 text-white' : 'text-gray-700'}`}
                        >
                          {day}
                        </span>

                        {/* RAIN DISPLAY LOGIC */}
                        {isInRange && (
                          <div className="flex flex-col items-end">
                            <CloudRain
                              className={`h-3.5 w-3.5 ${rainValue === null ? 'text-gray-300' : 'text-blue-400'}`}
                            />
                            <span
                              className={`text-[9px] font-bold ${rainValue === null ? 'text-gray-400' : 'text-blue-500'}`}
                            >
                              {/* If value is 0, it shows "0%". If null/missing, it shows "No Data" or "--" */}
                              {typeof rainValue === 'number'
                                ? `${Math.round(rainValue)}%`
                                : 'Empty'}
                            </span>
                          </div>
                        )}
                      </div>
                      {count > 0 && (
                        <div className="truncate rounded border border-cyan-200 bg-cyan-100 px-1.5 py-1 text-[10px] font-bold text-cyan-700">
                          {count} {count === 1 ? 'Event' : 'Events'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Date Detailed View */}
          {selectedDate && (
            <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 border-t pt-6 duration-500">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  Schedule for{' '}
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    dateStyle: 'full',
                  })}
                </h3>

                {/* SHOW RAIN PROBABILITY (Handles 0% and Empty) */}
                {isWithinRainRange(selectedDate) && (
                  <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 shadow-sm">
                    <CloudRain className="h-5 w-5" />
                    <span>
                      Rain Probability:{' '}
                      {typeof dailyRainForecast[selectedDate] === 'number'
                        ? `${Math.round(dailyRainForecast[selectedDate] as number)}%`
                        : 'Data Unavailable'}
                    </span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-colors hover:border-cyan-200"
                      >
                        <div className="rounded-lg bg-cyan-50 p-2.5">
                          <Clock className="h-5 w-5 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {event.title}
                          </p>
                          <p className="text-sm font-semibold text-cyan-600">
                            {formatTime(event.start_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      <CalendarIcon className="mx-auto mb-2 h-12 w-12 opacity-20" />
                      <p>No events found for this day.</p>
                    </div>
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
