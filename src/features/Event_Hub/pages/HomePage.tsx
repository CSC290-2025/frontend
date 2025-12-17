import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  MapPin,
  Plus,
  Search,
  Building2,
  Cloud,
  Hospital,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Bookmark,
} from 'lucide-react';

// Component Imports
import EventDetailModal from '@/features/Event_Hub/component/EventDetailModel';
import Layout from '@/components/main/Layout';
import TopBar from '@/features/Event_Hub/component/Topbar';

import ContactPage from '@/features/Event_Hub/pages/ContactPage';
import MonthlyPage from '@/features/Event_Hub/pages/MonthlyPage';
import BookmarkPage from '@/features/Event_Hub/pages/BookmarkPage';

// API Imports
import { fetchEvents, deleteEvent } from '@/features/Event_Hub/api/Event.api';
import {
  createBookmark,
  deleteBookmark,
  fetchUserBookmarks,
} from '@/features/Event_Hub/api/Bookmark.api';
import { useNavigate } from 'react-router';
import { useGetAuthMe } from '@/api/generated/authentication';

//
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
  event_tag: string;
}

// --------------------------------------------------------------------------
// CONSTANTS & HELPERS
// --------------------------------------------------------------------------
const ITEMS_PER_PAGE = 12;

const TOP_BAR_CATEGORIES = [
  {
    id: 'dashboard',
    icon: Building2,
    label: 'City Insights',
    subtitle: 'Explore City',
  },
  {
    id: 'events',
    icon: Calendar,
    label: 'Events',
    subtitle: 'Local Activities',
  },
  {
    id: 'weather',
    icon: Cloud,
    label: 'Weather',
    subtitle: 'Current Forecast',
  },
  {
    id: 'healthcare',
    icon: Hospital,
    label: 'Healthcare',
    subtitle: 'Medical Centers',
  },
];

const TABS = ['Events', 'Contact', 'Monthly', 'Bookmark'];

const getStatusClasses = (status: Event['status']) => {
  const statusMap = {
    Available: {
      badge: 'bg-green-50 text-green-700 border-green-200',
      dot: 'bg-green-500',
    },
    Ongoing: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    Ended: {
      badge: 'bg-gray-50 text-gray-700 border-gray-200',
      dot: 'bg-gray-500',
    },
  };
  return statusMap[status];
};

const HomePage = () => {
  const navigate = useNavigate();
  const { data: authMeData } = useGetAuthMe({
    query: { staleTime: Infinity, retry: 1 },
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // Security
  // ✅ Robust auth extraction
  const authPayload = (authMeData as any)?.data ?? authMeData;
  const role = (authPayload?.role ?? authPayload?.user?.role) as
    | string
    | undefined;

  const isAdmin = role === 'admin';
  const isAuthenticated = !!authPayload;
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const transformApiEvent = useCallback((event: any): Event => {
    const startAtISO =
      event.start_at || `${event.start_date}T${event.start_time}:00`;
    const endAtISO = event.end_at || `${event.end_date}T${event.end_time}:00`;

    const now = new Date();
    const start = new Date(startAtISO);
    const end = new Date(endAtISO);

    let status: Event['status'] = 'Available';
    if (now > end) status = 'Ended';
    else if (now >= start && now <= end) status = 'Ongoing';

    const rawAddress = (event.address ??
      event.addresses ??
      event.address_detail ??
      event.location ??
      {}) as Address;

    const addressStr =
      [
        rawAddress.address_line,
        rawAddress.subdistrict,
        rawAddress.district,
        rawAddress.province,
        rawAddress.postal_code,
      ]
        .filter(Boolean)
        .join(', ') || 'Location TBD';

    const org =
      event.organization ??
      event.event_organization ??
      event.organizer ??
      event.org ??
      event.host ??
      null;

    const organizerName =
      org?.name ?? org?.organization_name ?? event.organizer_name ?? undefined;

    const organizerEmail = org?.email ?? event.organizer_email ?? undefined;

    const organizerPhone =
      org?.phone_number ?? org?.phone ?? event.organizer_phone ?? undefined;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      imageUrl: event.image_url,
      address: rawAddress ?? {},
      addressDisplay: addressStr,
      organizerName,
      organizerEmail,
      organizerPhone,
      start_at: startAtISO,
      end_at: endAtISO,
      date: start.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: `${start.getHours().toString().padStart(2, '0')}:${start
        .getMinutes()
        .toString()
        .padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end
        .getMinutes()
        .toString()
        .padStart(2, '0')}`,
      status,
      event_tag: event.event_tag?.name || 'General',
    };
  }, []);

  // 2) Load bookmarked IDs (so bookmark icons reflect real data)
  const loadBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarkedEvents(new Set());
      return;
    }

    try {
      const res = await fetchUserBookmarks({ limit: 500 });
      const body = (res as any).data ?? res;
      const payload = body.data ?? body;

      const items: any[] = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];

      const ids = new Set<number>();
      for (const item of items) {
        const eventId =
          typeof item?.event_id === 'number'
            ? item.event_id
            : typeof item?.event?.id === 'number'
              ? item.event.id
              : typeof item?.id === 'number'
                ? item.id
                : null;

        if (typeof eventId === 'number') ids.add(eventId);
      }

      setBookmarkedEvents(ids);
    } catch {
      // if endpoint fails, just don't show any as bookmarked
      setBookmarkedEvents(new Set());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // 3. Fetching Logic
  const loadEvents = useCallback(async () => {
    if (activeTab !== 'events') return;
    setIsLoading(true);
    try {
      const response = await fetchEvents({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        q: searchQuery || undefined,
      });

      const data =
        (response as any)?.data?.data || (response as any)?.data || response;
      const items = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      const mapped = items.map(transformApiEvent);
      const filtered =
        categoryFilter === 'all'
          ? mapped
          : mapped.filter((e) =>
              (e.category || '')
                .toLowerCase()
                .includes(categoryFilter.toLowerCase())
            );

      setEvents(filtered);
      setTotalEvents(data.total || items.length);
      setTotalPages(Math.ceil((data.total || items.length) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter, activeTab, transformApiEvent]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleToggleBookmark = async (eventId: number) => {
    if (!isAuthenticated) {
      alert('Please log in.');
      return;
    }

    setIsActionLoading(true);
    try {
      if (bookmarkedEvents.has(eventId)) {
        await deleteBookmark(eventId);

        setBookmarkedEvents((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        await createBookmark({ event_id: eventId });

        setBookmarkedEvents((prev) => {
          const next = new Set(prev);
          next.add(eventId);
          return next;
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return; // ✅ admin-only
    if (!window.confirm('Delete this event?')) return;
    setIsActionLoading(true);
    try {
      await deleteEvent(id);
      setIsModalOpen(false);
      loadEvents();
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen flex-col bg-gray-50">
        {isActionLoading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          </div>
        )}

        <TopBar
          topCategories={TOP_BAR_CATEGORIES}
          onSelectCategory={(id) => {
            if (id === 'events') setActiveTab('events');
            if (id === 'dashboard') navigate('/dashboard');
            if (id === 'weather') navigate('/weather');
            if (id === 'healthcare') navigate('/healthcare');
          }}
        />

        <div className="mx-auto w-full max-w-7xl p-6">
          {/* Filter Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'border bg-white text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="rounded-lg border py-2 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Main Feed */}
          {activeTab === 'events' ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Available Events
                  </h1>
                  <p className="text-sm text-gray-500">
                    Showing {events.length} events
                  </p>
                </div>

                {/* ✅ Admin-only Create button */}
                {isAdmin && (
                  <button
                    onClick={() => navigate('/event_hub/CreatePage')}
                    className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-white shadow-md transition-all hover:bg-cyan-600"
                  >
                    <Plus className="h-4 w-4" /> Create Event
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => {
                    const statusClasses = getStatusClasses(event.status);
                    return (
                      <div
                        key={event.id}
                        className="group overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg"
                      >
                        <div className="relative aspect-video bg-gray-100">
                          {event.imageUrl && (
                            <img
                              src={event.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => handleToggleBookmark(event.id)}
                            className="absolute top-3 right-3 rounded-full bg-white/80 p-2 hover:bg-white"
                            aria-label="Toggle bookmark"
                          >
                            <Bookmark
                              className={`h-5 w-5 ${
                                bookmarkedEvents.has(event.id)
                                  ? 'fill-cyan-500 text-cyan-500'
                                  : 'text-gray-400'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="p-5">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-bold text-cyan-700 uppercase">
                              {event.event_tag}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-medium ${statusClasses.badge}`}
                            >
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`}
                              ></div>
                              {event.status}
                            </span>
                          </div>

                          <h3 className="line-clamp-1 text-lg font-bold text-gray-800">
                            {event.title}
                          </h3>

                          <div className="mt-4 space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> {event.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />{' '}
                              <span className="line-clamp-1">
                                {event.addressDisplay}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsModalOpen(true);
                            }}
                            className="mt-6 w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-600"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2 pb-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-10 w-10 rounded-lg border ${
                        currentPage === i + 1
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white'
                      }`}
                      aria-label={`Go to page ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30"
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4">
              {activeTab === 'contact' && (
                <ContactPage setActiveTab={setActiveTab} />
              )}
              {activeTab === 'monthly' && (
                <MonthlyPage setActiveTab={setActiveTab} />
              )}
              {activeTab === 'bookmark' && (
                <BookmarkPage setActiveTab={setActiveTab} />
              )}
            </div>
          )}
        </div>
      </div>

      <EventDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        isBookmarked={
          selectedEvent ? bookmarkedEvents.has(selectedEvent.id) : false
        }
        onToggleBookmark={() =>
          selectedEvent && handleToggleBookmark(selectedEvent.id)
        }
        isAdmin={isAdmin}
        onEdit={
          isAdmin ? (id) => navigate(`/event_hub/EditPage/${id}`) : undefined
        }
        onDelete={isAdmin ? handleDelete : undefined}
      />
    </Layout>
  );
};

export default HomePage;
