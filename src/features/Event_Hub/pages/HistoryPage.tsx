import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Tag,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { fetchPastBookmarkedEvents } from '@/features/Event_Hub/api/Event.api.ts'; // Assuming correct import path

// Utility function to format date/time from ISO string
const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-US', { dateStyle: 'medium' });
const formatTime = (isoString: string) =>
  new Date(isoString).toLocaleTimeString('en-US', { timeStyle: 'short' });

// Define the shape of the event returned by the API
interface Address {
  address_line?: string;
  province?: string;
  district?: string;
}

interface EventFromApi {
  id: number;
  title: string;
  start_at: string;
  end_at: string;
  addresses?: Address;
  // NOTE: Assuming event status logic remains on the client-side for now
}

interface HistoryEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'Completed' | 'Cancelled' | 'Attended';
}

interface ApiResponse {
  items: EventFromApi[];
  total: number;
  page: number;
  limit: number;
}

interface HistoryPageProps {
  setActiveTab: (tab: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ setActiveTab }) => {
  const itemsPerPage = 6;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<
    HistoryEvent['status'] | 'All'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const tags = ['All', 'Completed', 'Attended', 'Cancelled'];

  // Memoize the API call logic
  const loadHistoryEvents = useCallback(
    async (page: number, q: string) => {
      setIsLoading(true);
      try {
        // Use the new API function
        const response = await fetchPastBookmarkedEvents({
          page: page,
          limit: itemsPerPage,
          q: q,
        });

        const data = response.data.data as ApiResponse;

        const mappedEvents: HistoryEvent[] = data.items.map((event) => {
          // Map API response to HistoryEvent structure
          const locationParts = [
            event.addresses?.address_line,
            event.addresses?.district,
            event.addresses?.province,
          ].filter(Boolean); // Filter out undefined/null/empty strings

          return {
            id: event.id,
            title: event.title,
            // Use end_at to determine the past event date/time
            date: formatDate(event.end_at),
            time: formatTime(event.end_at),
            location: locationParts.join(', '),
            // Status is a placeholder/client-side filter for now
            // You would need backend logic or client-side logic to determine the true status
            status: 'Completed', // Defaulting to 'Completed' as the API filters for past events
          } as HistoryEvent;
        });

        setHistoryEvents(mappedEvents);
        setTotalEvents(data.total);
        setCurrentPage(data.page); // Ensure current page matches returned page
      } catch (error) {
        console.error('Error loading history events:', error);
        setHistoryEvents([]);
        setTotalEvents(0);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    loadHistoryEvents(currentPage, searchQuery);
  }, [loadHistoryEvents, currentPage, searchQuery]);

  const filteredEvents = historyEvents.filter(
    (event) => selectedTag === 'All' || event.status === selectedTag
  );

  // Calculate pagination (based on total events returned by API)
  const totalPages = Math.ceil(totalEvents / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle tag change - This is now only a client-side filter
  const handleTagChange = (tag: HistoryEvent['status'] | 'All') => {
    setSelectedTag(tag);
    // Since the API call already filters on 'q' and 'page',
    // we only reset to page 1 if we decide to re-fetch on tag change,
    // but here we rely on the current page's data for client-side status filtering.
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-700';
      case 'Attended':
        return 'bg-blue-50 text-blue-700';
      case 'Cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'Attended':
        return 'bg-blue-500';
      case 'Cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Tabs and Search */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {['Events', 'History', 'Contact', 'Monthly', 'Bookmark'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab.toLowerCase().replace(' ', ''))
                  }
                  className={`rounded-full px-6 py-2.5 font-medium transition-colors ${
                    tab.toLowerCase() === 'history'
                      ? 'bg-cyan-500 text-white'
                      : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for items"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset page on search change
                }}
                className="w-64 rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* History Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">History</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 transition-colors hover:bg-gray-50">
              <Tag className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="mb-6 flex gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                handleTagChange(tag as HistoryEvent['status'] | 'All')
              }
              className={`rounded-full px-6 py-2.5 font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-cyan-500 text-white'
                  : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-xl font-bold text-gray-800">
                      {event.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(event.status)}`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${getStatusDotColor(event.status)}`}
                      ></div>
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>

                <button className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600">
                  More Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg text-gray-500">
              {searchQuery
                ? `No results found for "${searchQuery}"`
                : 'No history events yet'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-cyan-500 text-white'
                        : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
