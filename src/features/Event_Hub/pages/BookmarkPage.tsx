import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Loader2,
  Bookmark,
} from 'lucide-react';
import EventDetailModal from '@/features/Event_Hub/component/EventDetailModel';
import {
  fetchUserBookmarks,
  deleteBookmark,
} from '@/features/Event_Hub/api/Bookmark.api';
import { useGetAuthMe } from '@/api/generated/authentication';

// --------------------------------------------------------------------------
// TYPE DEFINITIONS
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
  category: string;
}

// --------------------------------------------------------------------------
// UTILITY FUNCTIONS
// --------------------------------------------------------------------------
const getEventStatus = (
  startAtISO: string,
  endAtISO: string
): Event['status'] => {
  const now = new Date();
  const start = new Date(startAtISO);
  const end = new Date(endAtISO);

  if (now > end) return 'Ended';
  if (now >= start && now <= end) return 'Ongoing';
  return 'Available';
};

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

const transformApiEvent = (bookmark: any): Event | null => {
  const event = bookmark.event || bookmark;
  if (!event || !event.id) return null;

  let startAtISO: string, endAtISO: string;

  if (event.start_at && event.end_at) {
    startAtISO = event.start_at;
    endAtISO = event.end_at;
  } else if (
    event.start_date &&
    event.start_time &&
    event.end_date &&
    event.end_time
  ) {
    startAtISO = `${event.start_date}T${event.start_time}:00`;
    endAtISO = `${event.end_date}T${event.end_time}:00`;
  } else {
    return null;
  }

  const startObj = new Date(startAtISO);
  const endObj = new Date(endAtISO);
  const status = getEventStatus(startAtISO, endAtISO);

  const rawAddress: Address =
    event.address ||
    event.addresses ||
    event.address_detail ||
    event.location ||
    {};
  const org =
    event.organization ||
    event.event_organization ||
    event.organizer ||
    event.org ||
    null;

  let addressDisplayStr = 'Location TBD';
  const parts = [
    rawAddress.address_line,
    rawAddress.subdistrict,
    rawAddress.district,
    rawAddress.province,
  ].filter(Boolean);
  if (parts.length > 0) addressDisplayStr = parts.join(', ');

  const categoryName =
    event.event_tag?.event_tag_name?.name || event.event_tag_name || 'events';

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    imageUrl: event.image_url || undefined,
    address: rawAddress,
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
    organizerName:
      org?.name ||
      org?.organization_name ||
      event.organizer_name ||
      'Unknown Organizer',
    organizerEmail: org?.email || event.organizer_email || 'N/A',
    organizerPhone:
      org?.phone_number || org?.phone || event.organizer_phone || 'N/A',
    status,
    category: categoryName,
  };
};

// --------------------------------------------------------------------------
// COMPONENT
// --------------------------------------------------------------------------
interface BookmarkPageProps {
  setActiveTab: (tab: string) => void;
}

const BookmarkPage: React.FC<BookmarkPageProps> = ({ setActiveTab }) => {
  const { data: authMeData } = useGetAuthMe({
    query: { staleTime: Infinity, retry: 1 },
  });

  const [bookmarkedEvents, setBookmarkedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAuthenticated = !!authMeData?.data;
  const itemsPerPage = 12;

  const loadBookmarkedEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to view your bookmarks');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchUserBookmarks({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery || undefined,
      });

      const body = (response as any).data ?? response;
      const payload = body.data ?? body;
      const items: any[] = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];

      const transformedEvents = items
        .map(transformApiEvent)
        .filter((event): event is Event => event !== null);

      const total = payload.total ?? transformedEvents.length;
      setTotalEvents(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
      setBookmarkedEvents(transformedEvents);
    } catch (err: any) {
      console.error('Error fetching bookmarked events:', err);
      setError(err.message || 'Failed to load bookmarked events');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, itemsPerPage, isAuthenticated]);

  useEffect(() => {
    loadBookmarkedEvents();
  }, [loadBookmarkedEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRemoveBookmark = useCallback(
    async (eventId: number) => {
      setIsDeleting(true);
      try {
        await deleteBookmark(eventId);
        setBookmarkedEvents((prev) =>
          prev.filter((event) => event.id !== eventId)
        );
        setTotalEvents((prev) => Math.max(0, prev - 1));

        if (bookmarkedEvents.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          loadBookmarkedEvents();
        }
      } catch (err) {
        console.error('Error removing bookmark:', err);
        alert('Failed to remove bookmark. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    },
    [bookmarkedEvents.length, currentPage, loadBookmarkedEvents]
  );

  const handleOpenModal = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [totalPages]
  );

  const renderPaginationButtons = useMemo(() => {
    const pages: (number | '...')[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) pages.push(i);

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span
            key={`ellipsis-${index}`}
            className="flex h-10 w-10 items-center justify-center text-gray-500"
          >
            ...
          </span>
        );
      }
      return (
        <button
          key={page}
          onClick={() => handlePageChange(page as number)}
          className={`h-10 w-10 rounded-lg font-medium transition-colors ${
            currentPage === page
              ? 'bg-cyan-500 text-white'
              : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
          }`}
          aria-label={`Go to page ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      );
    });
  }, [currentPage, totalPages, handlePageChange]);

  return (
    <div className="w-full">
      {/* Loading Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
            <p className="mt-4 font-semibold text-gray-700">
              Removing bookmark...
            </p>
          </div>
        </div>
      )}

      {/* Search (NO tabs here; HomePage renders tabs already) */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookmarked items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            aria-label="Search bookmarked events"
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Bookmarked Events
          </h2>
          {!isLoading && (
            <p className="mt-1 text-sm text-gray-500">
              Showing {bookmarkedEvents.length} of {totalEvents} bookmarked
              events
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-cyan-50 px-4 py-2.5 text-cyan-600">
          <BookMarked className="h-5 w-5" />
          <span className="font-medium">My Bookmarks</span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500"></div>
          <p className="text-lg text-gray-500">Loading bookmarked events...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-4 h-16 w-16 text-red-300" />
          <p className="text-lg text-red-500">{error}</p>
          <button
            onClick={loadBookmarkedEvents}
            className="mt-4 rounded-lg bg-cyan-500 px-6 py-2 text-white hover:bg-cyan-600"
          >
            Retry
          </button>
        </div>
      ) : bookmarkedEvents.length === 0 ? (
        <div className="py-12 text-center">
          <BookMarked className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="text-lg text-gray-500">
            {searchQuery
              ? 'No bookmarked events found matching your search'
              : 'You have no bookmarked events yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setActiveTab('events')}
              className="mt-4 rounded-lg bg-cyan-500 px-6 py-2 text-white hover:bg-cyan-600"
            >
              Browse Events
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Events Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookmarkedEvents.map((event) => {
              const statusClasses = getStatusClasses(event.status);

              return (
                <div
                  key={event.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-video w-full bg-gray-200">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Calendar className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="truncate text-xl font-bold text-gray-800">
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
                        onClick={() => handleRemoveBookmark(event.id)}
                        className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100"
                        aria-label="Remove bookmark"
                        disabled={isDeleting}
                      >
                        <Bookmark className="h-5 w-5 fill-cyan-500 text-cyan-500" />
                      </button>
                    </div>

                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar
                          className="h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Clock
                          className="h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-start gap-3 text-gray-600">
                        <MapPin
                          className="mt-0.5 h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="line-clamp-2 font-medium">
                          {event.addressDisplay}
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
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <>
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex gap-1">{renderPaginationButtons}</div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 text-center text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </>
          )}
        </>
      )}

      <EventDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        isBookmarked={true}
        onToggleBookmark={() =>
          selectedEvent && handleRemoveBookmark(selectedEvent.id)
        }
      />
    </div>
  );
};

export default BookmarkPage;
