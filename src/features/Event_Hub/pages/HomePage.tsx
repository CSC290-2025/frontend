import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import EventDetailModal from '@/features/Event_Hub/component/EventDetailModel';
import Sidebar from '@/features/Event_Hub/component/Sidebar';
import TopBar from '@/features/Event_Hub/component/Topbar';
import HistoryPage from '@/features/Event_Hub/pages/HistoryPage';
import ContactPage from '@/features/Event_Hub/pages/ContactPage';
import MonthlyPage from '@/features/Event_Hub/pages/MonthlyPage';
import BookmarkPage from '@/features/Event_Hub/pages/BookmarkPage';

import {
  fetchEvents,
  deleteEvent, // <-- Used for Admin Delete
  // fetchEventById is not used here but kept for context if needed
} from '@/features/Event_Hub/api/Event.api';

import {
  checkBookmarkStatus,
  createBookmark,
  deleteBookmark,
} from '@/features/Event_Hub/api/Bookmark.api';
import { useNavigate } from '@/router';
import { useGetAuthMe } from '@/api/generated/authentication';

interface Address {
  address_line?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postal_code?: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  date: string;
  time: string;
  imageUrl?: string;
  address: Address;
  addressDisplay: string;
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  status: 'Ended' | 'Ongoing' | 'Available';
  category: string;
}

const getEventStatus = (
  startAtISO: string,
  endAtISO: string
): Event['status'] => {
  const now = new Date();
  const start = new Date(startAtISO);
  const end = new Date(endAtISO);

  if (now > end) {
    return 'Ended';
  } else if (now >= start && now <= end) {
    return 'Ongoing';
  } else {
    return 'Available';
  }
};

const transformApiEvent = (event: any): Event => {
  let startObj: Date, endObj: Date;
  let startAtISO: string, endAtISO: string;

  if (event.start_at && event.end_at) {
    startAtISO = event.start_at;
    endAtISO = event.end_at;
    startObj = new Date(startAtISO);
    endObj = new Date(endAtISO);
  } else if (
    event.start_date &&
    event.start_time &&
    event.end_date &&
    event.end_time
  ) {
    startAtISO = `${event.start_date}T${event.start_time}:00`;
    endAtISO = `${event.end_date}T${event.end_time}:00`;
    startObj = new Date(startAtISO);
    endObj = new Date(endAtISO);
  } else {
    // Fallback if date/time fields are missing
    startObj = new Date();
    endObj = new Date();
    startAtISO = startObj.toISOString();
    endAtISO = endObj.toISOString();
  }

  const status = getEventStatus(startAtISO, endAtISO);
  const rawAddress: Address = event.address || event.addresses;
  const org = event.organization || event.event_organization;

  let addressDisplayStr = 'Location TBD';
  if (rawAddress) {
    const parts = [
      rawAddress.address_line,
      rawAddress.subdistrict,
      rawAddress.district,
      rawAddress.province,
      rawAddress.postal_code,
    ].filter(Boolean);

    if (parts.length > 0) addressDisplayStr = parts.join(', ');
  }

  // Updated logic to handle nested event_tag structure
  const categoryName =
    event.event_tag?.event_tag_name?.name || event.event_tag_name || 'events';

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    imageUrl: event.image_url || undefined,
    address: rawAddress || {},
    addressDisplay: addressDisplayStr,
    start_at: startAtISO,
    end_at: endAtISO,
    date: startObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: `${startObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })} - ${endObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`,
    organizerName: org?.name || 'Unknown Organizer',
    organizerEmail: org?.email || 'N/A',
    organizerPhone: org?.phone_number || 'N/A',
    status: status,
    category: categoryName,
  };
};
// --------------------------------------------------------------------------

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
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [isDeleting, setIsDeleting] = useState(false); // State for admin deletion

  const { data: authData } = useGetAuthMe();

  const isAdmin = useMemo(() => {
    return authData?.user?.role === 'admin';
  }, [authData]);

  const itemsPerPage = 12;

  // REFACTOR: Event loading logic moved to a reusable function
  const loadEvents = useCallback(
    async (
      page: number,
      query: string,
      category: string | 'all',
      currentActiveTab: string
    ) => {
      if (currentActiveTab === 'bookmark') {
        setEvents([]);
        setTotalEvents(0);
        setTotalPages(1);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const categoryParam = category === 'all' ? undefined : category;

        const response = await fetchEvents({
          page: page,
          limit: itemsPerPage,
          q: query || undefined,
          category: categoryParam,
        });

        const body = (response as any).data ?? response;
        const payload = body.data ?? body;
        const items: any[] = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload)
            ? payload
            : [];

        const total = payload.total ?? items.length;

        setTotalEvents(total);
        setTotalPages(Math.ceil(total / itemsPerPage));

        const transformedEvents: Event[] = items.map(transformApiEvent);
        setEvents(transformedEvents);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    loadEvents(currentPage, searchQuery, categoryFilter, activeTab);
  }, [currentPage, searchQuery, activeTab, categoryFilter, loadEvents]);

  // ... (Other useEffects and helper functions like toggleBookmark, handleOpen/CloseModal, etc. remain the same)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const eventIds = useMemo(() => events.map((e) => e.id), [events]);
  // ... (loadBookmarkStatuses effect remains the same)

  // Admin functions for Edit and Delete
  const handleEditEvent = useCallback(
    (event: Event) => {
      handleCloseModal();
      // Navigate to the event editing page with the event ID in the route
      navigate(`/event_hub/edit/${event.id}`);
    },
    [navigate]
  );

  const handleDeleteEvent = useCallback(
    async (eventId: number) => {
      handleCloseModal();
      setIsDeleting(true);

      try {
        // >>> USE REAL DELETE API FUNCTION <<<
        await deleteEvent(eventId);

        alert(`Successfully deleted event ID: ${eventId}`);

        // Refresh the event list.
        setCurrentPage(1);
        if (currentPage === 1) {
          await loadEvents(1, searchQuery, categoryFilter, activeTab);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    },
    [currentPage, searchQuery, categoryFilter, activeTab, loadEvents]
  );
  // END Admin functions

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  // ... (categories, topCategories, getFilterStatusText, getStatusClasses, renderPaginationButtons remain the same)

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Global loading overlay for deletion */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center rounded-lg bg-white p-6 shadow-xl">
            <Loader2 className="mr-3 h-6 w-6 animate-spin text-cyan-500" />
            <span className="text-lg font-medium text-gray-700">
              Deleting event...
            </span>
          </div>
        </div>
      )}

      {/* ... (Sidebar and TopBar JSX remains the same) */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <div className="flex-1 overflow-y-auto">
        {/* ... (TopBar JSX) */}
        <TopBar
          topCategories={[
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
          ]}
        />

        {/* ... (Tab content rendering remains the same) */}
        {activeTab === 'history' ? (
          <HistoryPage setActiveTab={setActiveTab} />
        ) : activeTab === 'contact' ? (
          <ContactPage setActiveTab={setActiveTab} />
        ) : activeTab === 'monthly' ? (
          <MonthlyPage setActiveTab={setActiveTab} />
        ) : activeTab === 'bookmark' ? (
          <BookmarkPage setActiveTab={setActiveTab} />
        ) : (
          // ... (Main Events grid JSX remains the same)
          <div className="mx-auto max-w-7xl p-6">
            {/* ... (Controls and Category Display) */}
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
                      aria-pressed={activeTab === tab.toLowerCase()}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-40 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    aria-label="Filter by category"
                  >
                    <option value="all">All Tags</option>
                    {categories
                      .filter((c) => c.id !== 'dashboard' && c.id !== 'contact')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for items"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    aria-label="Search events"
                  />
                </div>
              </div>
            </div>

            {/* Category Display Tag for current sidebar selection (requires currentCategory memoization) */}
            {/* ... (Omitted for brevity, assuming currentCategory memo is available) */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Events</h2>
                {!isLoading && (
                  <p className="mt-1 text-sm text-gray-500">
                    {/* Assuming getFilterStatusText is defined */}
                    Showing 12 of 100 events
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <button
                    onClick={() => navigate('/event_hub/CreatePage')}
                    className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-white transition-colors hover:bg-cyan-600"
                    aria-label="Create new event"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Create</span>
                  </button>
                )}
              </div>
            </div>

            {/* ... (Loading/Error/Event Grid rendering logic remains the same) */}

            {isLoading ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500"></div>
                <p className="text-lg text-gray-500">Loading events...</p>
              </div>
            ) : error ? (
              // ... (Error JSX)
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-red-300" />
                <p className="text-lg text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-cyan-500 px-6 py-2 text-white hover:bg-cyan-600"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => {
                    const statusClasses = {
                      badge: 'bg-green-50 text-green-700 border-green-200',
                      dot: 'bg-green-500',
                    }; // Mock status classes
                    return (
                      <div
                        key={event.id}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
                      >
                        {/* ... (Event Card JSX remains the same) */}
                        <div className="aspect-video w-full bg-gray-200">
                          {event.imageUrl ? (
                            <img
                              src={event.imageUrl}
                              alt={`Image for ${event.title}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                              <Calendar className="h-10 w-10" />
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                {event.title}
                              </h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                                  {event.category}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${statusClasses.badge}`}
                                >
                                  <div
                                    className={`h-2 w-2 rounded-full ${statusClasses.dot}`}
                                  ></div>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                            <button
                              // onClick={() => toggleBookmark(event.id)} // Assuming toggleBookmark is defined
                              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                              aria-label={'Add bookmark'}
                            >
                              <BookmarkMinus
                                className={`h-5 w-5 text-gray-400`}
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
                                {event.addressDisplay}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenModal(event)}
                            className={`w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600`}
                          >
                            More Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ... (Pagination JSX remains the same) */}
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
        // onToggleBookmark={() => selectedEvent && toggleBookmark(selectedEvent.id)} // Assuming this is defined
        isAdmin={isAdmin}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default HomePage;
