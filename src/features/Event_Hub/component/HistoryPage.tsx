import React, { useState } from 'react';
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

interface HistoryEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'Completed' | 'Cancelled' | 'Attended';
}

interface HistoryPageProps {
  setActiveTab: (tab: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ setActiveTab }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 6;

  // Mock history data
  const historyEvents: HistoryEvent[] = [
    {
      id: 1,
      title: 'Big cleaning',
      date: '15 Aug 2025',
      time: '09:00 - 15:00',
      location: 'KMUTT',
      status: 'Completed',
    },
    {
      id: 2,
      title: 'Beach cleanup',
      date: '10 Aug 2025',
      time: '08:00 - 12:00',
      location: 'Pattaya Beach',
      status: 'Completed',
    },
    {
      id: 3,
      title: 'Tree planting',
      date: '05 Aug 2025',
      time: '09:00 - 15:00',
      location: 'City Park',
      status: 'Attended',
    },
    {
      id: 4,
      title: 'Food donation drive',
      date: '01 Aug 2025',
      time: '10:00 - 16:00',
      location: 'Community Center',
      status: 'Completed',
    },
    {
      id: 5,
      title: 'Street art festival',
      date: '25 Jul 2025',
      time: '14:00 - 20:00',
      location: 'Downtown',
      status: 'Attended',
    },
    {
      id: 6,
      title: 'Music workshop',
      date: '20 Jul 2025',
      time: '13:00 - 17:00',
      location: 'Arts Center',
      status: 'Cancelled',
    },
    {
      id: 7,
      title: 'Community cooking',
      date: '15 Jul 2025',
      time: '11:00 - 14:00',
      location: 'Community Kitchen',
      status: 'Completed',
    },
    {
      id: 8,
      title: 'Park renovation',
      date: '10 Jul 2025',
      time: '08:00 - 16:00',
      location: 'Central Park',
      status: 'Completed',
    },
  ];

  const tags = ['All', 'Completed', 'Attended', 'Cancelled'];

  // Filter events by selected tag AND search query
  const filteredEvents = historyEvents
    .filter((event) => selectedTag === 'All' || event.status === selectedTag)
    .filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle tag change
  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
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
        {/* Tabs and Search - Matching HomePage */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* History Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">History</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-white transition-colors hover:bg-cyan-600">
              <Plus className="h-5 w-5" />
              <span className="font-medium">Create</span>
            </button>
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
              onClick={() => handleTagChange(tag)}
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

        {/* Events Grid - 3 columns like HomePage */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentEvents.map((event) => (
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

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg text-gray-500">No history events found</p>
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
