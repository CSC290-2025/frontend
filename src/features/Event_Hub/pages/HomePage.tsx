import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Pencil,
} from 'lucide-react';

// Component Imports
import EventDetailModal from '@/features/Event_Hub/component/EventDetailModel';
import Layout from '@/components/main/Layout';
import TopBar from '@/features/Event_Hub/component/Topbar';
import ContactPage from '@/features/Event_Hub/pages/ContactPage';
import MonthlyPage from '@/features/Event_Hub/pages/MonthlyPage';

// API Imports
import { fetchEvents, deleteEvent } from '@/features/Event_Hub/api/Event.api';
import { useNavigate } from 'react-router';
import { useGetAuthMe } from '@/api/generated/authentication';

// --------------------------------------------------------------------------
// TYPES & CONSTANTS
// --------------------------------------------------------------------------
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

const TABS = ['Events', 'Contact', 'Monthly'];

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

  const authPayload = (authMeData as any)?.data ?? authMeData;
  const role = (authPayload?.role ?? authPayload?.user?.role) as
    | string
    | undefined;
  const isAdmin = role === 'admin';

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // --------------------------------------------------------------------------
  // ROBUST TRANSFORMATION
  // --------------------------------------------------------------------------
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

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      imageUrl: event.image_url,
      address: rawAddress,
      addressDisplay: addressStr,
      organizerName:
        org?.name ?? org?.organization_name ?? event.organizer_name,
      organizerEmail: org?.email ?? event.organizer_email,
      organizerPhone: org?.phone_number ?? org?.phone ?? event.organizer_phone,
      start_at: startAtISO,
      end_at: endAtISO,
      date: start.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
      status,
      event_tag: event.event_tag?.name || 'General',
    };
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Increased limit for frontend search
      const response = await fetchEvents({ page: 1, limit: 100 });
      const data =
        (response as any)?.data?.data || (response as any)?.data || response;
      const items = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];
      setAllEvents(items.map(transformApiEvent));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transformApiEvent]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // --------------------------------------------------------------------------
  // FRONTEND SEARCH & PAGINATION
  // --------------------------------------------------------------------------
  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allEvents;
    return allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.addressDisplay.toLowerCase().includes(term) ||
        event.event_tag.toLowerCase().includes(term)
    );
  }, [searchTerm, allEvents]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEdit = (id: number) => navigate(`/event_hub/EditPage/${id}`);

  const handleDelete = async (id: number) => {
    if (!isAdmin || !window.confirm('Delete this event?')) return;
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          </div>
        )}

        <TopBar
          topCategories={TOP_BAR_CATEGORIES}
          onSelectCategory={(id) => {
            if (id === 'events') setActiveTab('events');
            else navigate(`/${id}`);
          }}
        />

        <div className="mx-auto w-full max-w-7xl p-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'border bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                className="w-full rounded-lg border py-2 pr-4 pl-10 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {activeTab === 'events' ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Available Events
                  </h1>
                  <p className="text-sm text-gray-500">
                    {searchTerm
                      ? `Found ${filteredEvents.length} results`
                      : `Showing ${allEvents.length} events`}
                  </p>
                </div>
                {authMeData && (
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
              ) : filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Search className="mb-4 h-16 w-16 opacity-20" />
                  <p>No results found for `{searchTerm}`</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg"
                    >
                      <div className="relative aspect-video bg-gray-100">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                            <Calendar className="h-12 w-12" />
                          </div>
                        )}
                        {authMeData && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(event.id);
                            }}
                            className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-gray-700 shadow-sm transition-transform hover:scale-110 hover:bg-cyan-500 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-grow flex-col p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-bold text-cyan-700 uppercase">
                            {event.event_tag}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-medium ${getStatusClasses(event.status).badge}`}
                          >
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${getStatusClasses(event.status).dot}`}
                            ></div>
                            {event.status}
                          </span>
                        </div>
                        <h3 className="line-clamp-1 text-lg font-bold text-gray-800">
                          {event.title}
                        </h3>
                        <div className="mt-4 mb-6 space-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />{' '}
                            {event.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
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
                          className="mt-auto w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-600"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2 pb-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-4 font-medium text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="animate-in fade-in mt-4 duration-300">
              {activeTab === 'contact' && (
                <ContactPage setActiveTab={setActiveTab} />
              )}
              {activeTab === 'monthly' && (
                <MonthlyPage setActiveTab={setActiveTab} />
              )}
            </div>
          )}
        </div>
      </div>

      <EventDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        isAdmin={isAdmin}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        isBookmarked={false}
        onToggleBookmark={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    </Layout>
  );
};

export default HomePage;
