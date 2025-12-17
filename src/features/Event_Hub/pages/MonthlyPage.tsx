import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Tag,
  CloudRain,
  Calendar,
  Clock,
} from 'lucide-react';
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
  const [rainLoading, setRainLoading] = useState(false);
  const [dailyRainForecast, setDailyRainForecast] = useState<RainDataMap>({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const MAX_CALENDAR_SLOTS = 42;
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length < MAX_CALENDAR_SLOTS) calendarDays.push(null);

  const previousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = async (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    setSelectedDate(date);
    setLoading(true);
    setEvents([]);
    setSearchQuery('');

    const preFetchedEvents = monthlyEventsMap[date];
    if (preFetchedEvents) {
      setEvents(preFetchedEvents);
      setLoading(false);
      return;
    }

    try {
      // fetchEventsByDay already returns the array directly
      const rawList = await fetchEventsByDay(date);

      const minimalList: EventItem[] = rawList.map((event: any) => ({
        id: event.id.toString(),
        title: event.title || 'Untitled Event',
        start_at: event.start_at,
        end_at: event.end_at,
      }));

      setEvents(minimalList);
    } catch (error) {
      console.error('Fetch events error:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return events.filter((event) =>
      event.title.toLowerCase().includes(lowerCaseQuery)
    );
  }, [events, searchQuery]);

  // Format time only (HH:MM)
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Format date (e.g., "December 17, 2025")
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fetchMonthlyEvents = useCallback(async () => {
    const fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const toDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    setMonthlyEventsMap({});

    try {
      const res = await fetchEvents({ from: fromDate, to: toDate });

      // Handle response - check if it's already an array or nested
      let rawList: any[] = [];

      if (Array.isArray(res)) {
        rawList = res;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
      } else if (res?.data?.items && Array.isArray(res.data.items)) {
        // Handle paginated response
        rawList = res.data.items;
      } else if (res?.data && Array.isArray(res.data)) {
        rawList = res.data;
      }

      const monthlyMap: MonthlyEventsMap = rawList.reduce((acc, event) => {
        // Extract start and end dates from ISO strings
        const startDateString = event.start_at.split('T')[0];
        const endDateString = event.end_at.split('T')[0];

        const currentDate = new Date(startDateString);
        const endDate = new Date(endDateString);

        // Map events to all days they span
        while (currentDate <= endDate) {
          const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

          const minimalEvent: EventItem = {
            id: event.id.toString(),
            title: event.title || 'Untitled Event',
            start_at: event.start_at,
            end_at: event.end_at,
          };

          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(minimalEvent);

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return acc;
      }, {} as MonthlyEventsMap);

      setMonthlyEventsMap(monthlyMap);
    } catch (error) {
      console.error('Fetch monthly events error:', error);
      setMonthlyEventsMap({});
    }
  }, [year, month, daysInMonth]);

  const fetchRainData = useCallback(async () => {
    const locationId = 1;
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const daysAhead = Math.min(daysInMonth - 1, 7);

    setRainLoading(true);
    setDailyRainForecast({});

    try {
      const rawData = await fetchDailyRainForecast(
        locationId,
        startDate,
        daysAhead
      );

      const rainMap: RainDataMap = rawData.reduce((acc, item: any) => {
        acc[item.date] = item.precipitation_probability_max;
        return acc;
      }, {} as RainDataMap);

      setDailyRainForecast(rainMap);
    } catch (error) {
      console.error('Fetch rain forecast error:', error);
      setDailyRainForecast({});
    } finally {
      setRainLoading(false);
    }
  }, [year, month, daysInMonth]);

  useEffect(() => {
    fetchRainData();
    fetchMonthlyEvents();
    setSelectedDate(null);
    setEvents([]);
  }, [fetchRainData, fetchMonthlyEvents]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* ✅ Removed duplicate Tabs (HomePage already renders Tabs) */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 hover:bg-gray-50"
            >
              Back to Events
            </button>
          </div>

          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events for selected day"
              className="w-64 rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              aria-label="Search events"
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Monthly Calendar</h2>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border-2 bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-center gap-4">
            <button
              onClick={previousMonth}
              aria-label="Previous Month"
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              aria-label="Next Month"
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-7 border-b bg-gray-100">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-bold text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
              {calendarDays.map((day, i) => {
                const dateString = day
                  ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : null;

                const rainProb = dateString
                  ? dailyRainForecast[dateString]
                  : null;
                const showRain = rainProb !== null && rainProb > 30;

                const dayEvents = dateString
                  ? monthlyEventsMap[dateString] || []
                  : [];
                const eventCount = dayEvents.length;
                const firstEventTitle =
                  eventCount > 0 ? dayEvents[0].title : null;

                return (
                  <div
                    key={i}
                    className="flex h-[120px] flex-col justify-between bg-white p-2 hover:bg-cyan-50"
                  >
                    <div className="flex items-start justify-between">
                      {day && (
                        <button
                          onClick={() => handleDayClick(day)}
                          className={`h-8 w-8 rounded-full font-semibold transition-colors ${
                            selectedDate === dateString
                              ? 'bg-cyan-500 text-white shadow-md'
                              : 'text-gray-900 hover:bg-gray-200'
                          }`}
                          aria-label={`View events on day ${day}`}
                        >
                          {day}
                        </button>
                      )}

                      {day && rainLoading && (
                        <span className="self-center text-xs text-gray-400">
                          ...
                        </span>
                      )}
                      {day && !rainLoading && showRain && (
                        <div
                          className="flex items-center rounded-full bg-blue-50 p-1 text-sm font-medium text-blue-500"
                          title={`Max chance of rain: ${rainProb}%`}
                        >
                          <CloudRain className="mr-0.5 h-4 w-4" />
                          {rainProb}%
                        </div>
                      )}
                    </div>
                    <div className="mt-1 truncate text-xs text-gray-500">
                      {eventCount > 0 ? (
                        <>
                          <p className="font-semibold text-gray-700">
                            {eventCount} Event{eventCount > 1 ? 's' : ''}
                          </p>
                          {firstEventTitle && (
                            <p className="truncate text-gray-600">
                              {firstEventTitle}
                            </p>
                          )}
                        </>
                      ) : (
                        day && <p className="text-gray-400">No events</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events List */}
          {selectedDate && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-md">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                Events on {formatDate(selectedDate)}
              </h3>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500"></div>
                  <p className="ml-3 text-gray-500">Loading events...</p>
                </div>
              )}

              {!loading && filteredEvents.length === 0 && (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">
                    {events.length > 0 && searchQuery
                      ? `No events match "${searchQuery}" on this day.`
                      : 'No events scheduled for this day.'}
                  </p>
                </div>
              )}

              <ul className="space-y-3">
                {filteredEvents.map((event) => {
                  const startTime = formatTime(event.start_at);

                  return (
                    <li
                      key={event.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:shadow-sm"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100">
                          <Calendar className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-800">
                            {event.title}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Start: {startTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="ml-4 flex-shrink-0 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
                        aria-label={`View details for ${event.title}`}
                      >
                        View Details
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyPage;
