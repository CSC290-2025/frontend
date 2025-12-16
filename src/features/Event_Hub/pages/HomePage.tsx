// ============================================================
// HomePage.tsx - Fixed with Pagination and Data Display
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Search,
  Filter,
  BookmarkMinus,
  Building2,
  BusFront,
  Cloud,
  Hospital,
  BookMarked,
  Phone,
  Tv,
  Handshake,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import EventDetailModal from '@/features/Event_Hub/component/EventDetailModel';
import Sidebar from '@/features/Event_Hub/component/Sidebar';
import TopBar from '@/features/Event_Hub/component/Topbar';
import HistoryPage from '@/features/Event_Hub/pages/HistoryPage';
import ContactPage from '@/features/Event_Hub/pages/ContactPage';
import MonthlyPage from '@/features/Event_Hub/pages/MonthlyPage';
import { fetchEvents } from '@/features/Event_Hub/api/Event.api';
import {
  fetchBookmarks,
  createBookmark,
  deleteBookmark,
} from '@/features/Event_Hub/api/Bookmark.api';
import { useNavigate } from '@/router';

interface Event {
  id: number;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  date: string;
  time: string;
  location: string;
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  status: string;
  category: string;
}

const HomePage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedCategory, setSelectedCategory] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedEvents, setBookmarkedEvents] = useState(new Set<number>());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchEvents({
          page: currentPage,
          limit: itemsPerPage,
          q: searchQuery || undefined,
        });

        const body = (response as any).data ?? response;
        const payload = body.data ?? body;
        const items: any[] = Array.isArray(payload.items) ? payload.items : [];
        const total = payload.total ?? items.length;

        // Calculate total pages
        setTotalEvents(total);
        setTotalPages(Math.ceil(total / itemsPerPage));

        const transformedEvents: Event[] = items.map((event: any) => {
          // Format address
          let locationStr = 'Location TBD';
          if (event.address) {
            const parts = [
              event.address.address_line,
              event.address.subdistrict,
              event.address.district,
              event.address.province,
              event.address.postal_code,
            ].filter(Boolean);
            locationStr = parts.length > 0 ? parts.join(', ') : 'Location TBD';
          }

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            start_at: event.start_at,
            end_at: event.end_at,

            // Date formatting
            date: new Date(event.start_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),

            // Time formatting
            time: `${new Date(event.start_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })} - ${new Date(event.end_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}`,

            // Location with full address
            location: locationStr,

            // Organization details
            organizerName: event.organization?.name ?? 'Unknown Organizer',
            organizerEmail: event.organization?.email ?? 'N/A',
            organizerPhone: event.organization?.phone_number ?? 'N/A',

            status: 'Available',
            category: 'events',
          };
        });

        setEvents(transformedEvents);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [currentPage, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const response = await fetchBookmarks();
        const bookmarkedIds = new Set(
          response.data.data.map((bookmark: any) => bookmark.event_id)
        );
        setBookmarkedEvents(bookmarkedIds);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      }
    };

    loadBookmarks();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (activeTab === 'bookmark') {
      return bookmarkedEvents.has(event.id);
    }
    return true;
  });

  const categories = [
    {
      id: 'dashboard',
      icon: Building2,
      label: 'City Insights',
      subtitle: 'Dashboard and quick service',
    },
    {
      id: 'transport',
      icon: BusFront,
      label: 'Transport',
      subtitle: 'Bus timing and routes',
    },
    {
      id: 'events',
      icon: Calendar,
      label: 'Events',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'weather',
      icon: Cloud,
      label: 'Weather reports',
      subtitle: 'Forecast & Air Quality',
    },
    {
      id: 'healthcare',
      icon: Hospital,
      label: 'Healthcare',
      subtitle: 'Hospital & Emergency services',
    },
    {
      id: 'ai',
      icon: BookMarked,
      label: 'Know Ai',
      subtitle: 'Learning with ai',
    },
    {
      id: 'contact',
      icon: Phone,
      label: 'Contact us',
      subtitle: 'Report issues',
    },
  ];

  const topCategories = [
    {
      id: 'events',
      icon: Calendar,
      label: 'Events',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'cycle',
      icon: Tv,
      label: 'Free cycle',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'volunteer',
      icon: Handshake,
      label: 'Volunteer',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'waste',
      icon: Trash2,
      label: 'Waste Management',
      subtitle: 'Activities and volunteer',
    },
  ];

  const toggleBookmark = async (id: number) => {
    try {
      if (bookmarkedEvents.has(id)) {
        await deleteBookmark(id);
        setBookmarkedEvents((prev) => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      } else {
        await createBookmark({ event_id: id });
        setBookmarkedEvents((prev) => {
          const updated = new Set(prev);
          updated.add(id);
          return updated;
        });
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const handleOpenModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <div className="flex-1 overflow-y-auto">
        <TopBar topCategories={topCategories} />

        {activeTab === 'history' ? (
          <HistoryPage setActiveTab={setActiveTab} />
        ) : activeTab === 'contact' ? (
          <ContactPage setActiveTab={setActiveTab} />
        ) : activeTab === 'monthly' ? (
          <MonthlyPage setActiveTab={setActiveTab} />
        ) : (
          <div className="mx-auto max-w-7xl p-6">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                {['Events', 'History', 'Contact', 'Monthly', 'Bookmark'].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`rounded-full px-6 py-2.5 font-medium transition-colors ${
                        activeTab === tab.toLowerCase()
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

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Events</h2>
                {!isLoading && (
                  <p className="mt-1 text-sm text-gray-500">
                    Showing {filteredEvents.length} of {totalEvents} events
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/event_hub/CreatePage')}
                  className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-white transition-colors hover:bg-cyan-600"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Create</span>
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 transition-colors hover:bg-gray-50">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Filter</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500"></div>
                <p className="text-lg text-gray-500">Loading events...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-red-300" />
                <p className="text-lg text-red-500">{error}</p>
              </div>
            ) : (
              <>
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
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            {event.status}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleBookmark(event.id)}
                          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                        >
                          <BookmarkMinus
                            className={`h-5 w-5 ${
                              bookmarkedEvents.has(event.id)
                                ? 'fill-cyan-500 text-cyan-500'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mb-6 space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-start gap-3 text-gray-600">
                          <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0" />
                          <span className="line-clamp-2 font-medium">
                            {event.location}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenModal(event)}
                        className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600"
                      >
                        More Details
                      </button>
                    </div>
                  ))}
                </div>

                {filteredEvents.length === 0 && (
                  <div className="py-12 text-center">
                    <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <p className="text-lg text-gray-500">
                      {searchQuery
                        ? 'No events found matching your search'
                        : 'No events found'}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !searchQuery && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex gap-1">
                      {/* Show first page */}
                      <button
                        onClick={() => handlePageChange(1)}
                        className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-cyan-500 text-white'
                            : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        1
                      </button>

                      {/* Show ellipsis if needed */}
                      {currentPage > 3 && (
                        <span className="flex h-10 w-10 items-center justify-center text-gray-500">
                          ...
                        </span>
                      )}

                      {/* Show pages around current page */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page !== 1 &&
                            page !== totalPages &&
                            page >= currentPage - 1 &&
                            page <= currentPage + 1
                        )
                        .map((page) => (
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
                        ))}

                      {/* Show ellipsis if needed */}
                      {currentPage < totalPages - 2 && (
                        <span className="flex h-10 w-10 items-center justify-center text-gray-500">
                          ...
                        </span>
                      )}

                      {/* Show last page */}
                      {totalPages > 1 && (
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                            currentPage === totalPages
                              ? 'bg-cyan-500 text-white'
                              : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          {totalPages}
                        </button>
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

                {/* Page info */}
                {totalPages > 1 && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <EventDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        isBookmarked={
          selectedEvent ? bookmarkedEvents.has(selectedEvent.id) : false
        }
        onToggleBookmark={() =>
          selectedEvent && toggleBookmark(selectedEvent.id)
        }
      />
    </div>
  );
};

export default HomePage;
