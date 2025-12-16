import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  BookmarkMinus,
  BookMarked,
  X,
  User,
  Mail,
  Phone,
  Bookmark,
} from 'lucide-react';
import EventDetailModal from '@/features/Event_Hub/component/EventDetailModel';
import { fetchEvents } from '@/features/Event_Hub/api/Event.api';
import {
  checkBookmarkStatus,
  createBookmark,
  deleteBookmark,
  // NOTE: fetchBookmarkedEvents is a function we're assuming exists
  // but we'll mock its behavior by filtering all events for now.
} from '@/features/Event_Hub/api/Bookmark.api';

// --- Interfaces and Utility Functions (Adapted for self-containment) ---

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
    startObj = new Date(event.start_at);
    endObj = new Date(event.end_at);
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
    startObj = new Date(startAtISO);
    endObj = new Date(endAtISO);
  } else {
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

const getStatusClasses = (status: Event['status']) => {
  switch (status) {
    case 'Available':
      return {
        badge: 'bg-green-50 text-green-700 border-green-200',
        dot: 'bg-green-500',
      };
    case 'Ongoing':
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'Ended':
      return {
        badge: 'bg-gray-100 text-gray-500 border-gray-200',
        dot: 'bg-gray-400',
      };
    default:
      return {
        badge: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-500',
      };
  }
};

// --- Component Implementation ---

interface BookmarkPageProps {
  setActiveTab: (tab: string) => void;
}

const BookmarkPage: React.FC<BookmarkPageProps> = ({ setActiveTab }) => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local state to manage the bookmark status for cards on this page
  const [isBookmarkedSet, setIsBookmarkedSet] = useState(new Set<number>());

  const itemsPerPage = 12;

  // Function to load bookmarked events
  const loadBookmarkedEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // NOTE: Since a dedicated fetchBookmarkedEvents API is not provided,
      // we are using fetchEvents and then manually filtering based on checkBookmarkStatus.
      // This is for demonstration; a production app should use a dedicated endpoint.
      const response = await fetchEvents({
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

      // Check bookmark status for all events to simulate API filtering
      const eventIds = items.map((item) => item.id);
      const bookmarkedIds = new Set<number>();

      await Promise.all(
        eventIds.map(async (eventId) => {
          try {
            const bookmarkStatusResponse = await checkBookmarkStatus(eventId);
            if (
              bookmarkStatusResponse.data?.bookmarked ||
              bookmarkStatusResponse.data?.data?.bookmarked
            ) {
              bookmarkedIds.add(eventId);
            }
          } catch (err) {
            // Ignore not bookmarked errors
          }
        })
      );

      const transformedEvents: Event[] = items
        .map(transformApiEvent)
        .filter((event) => bookmarkedIds.has(event.id));

      // Update local bookmark set for event cards
      setIsBookmarkedSet(bookmarkedIds);

      // Simple pagination based on the locally filtered list size for the mock
      const totalFiltered = transformedEvents.length;
      setTotalEvents(totalFiltered);
      setTotalPages(Math.ceil(totalFiltered / itemsPerPage));

      setBookmarkedEvents(transformedEvents);
    } catch (err: any) {
      console.error('Error fetching bookmarked events:', err);
      setError(err.message || 'Failed to load bookmarked events');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, itemsPerPage]);

  useEffect(() => {
    loadBookmarkedEvents();
  }, [loadBookmarkedEvents]);

  const toggleBookmark = useCallback(
    async (id: number) => {
      try {
        const isCurrentlyBookmarked = isBookmarkedSet.has(id);

        if (isCurrentlyBookmarked) {
          await deleteBookmark(id);
          // Remove from local set and state, then reload data
          setIsBookmarkedSet((prev) => {
            const updated = new Set(prev);
            updated.delete(id);
            return updated;
          });
          setBookmarkedEvents((prev) =>
            prev.filter((event) => event.id !== id)
          );
          // Reload the page to fix pagination/count
          loadBookmarkedEvents();
        } else {
          // Add bookmark (should not happen frequently on this dedicated page, but keeps it functional)
          await createBookmark({ event_id: id });
          setIsBookmarkedSet((prev) => {
            const updated = new Set(prev);
            updated.add(id);
            return updated;
          });
          // Reload to show the newly bookmarked item (if API supports it)
          loadBookmarkedEvents();
        }
      } catch (err) {
        console.error('Error toggling bookmark:', err);
        alert('Failed to update bookmark. Please try again.');
      }
    },
    [isBookmarkedSet, loadBookmarkedEvents]
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

  const renderPaginationButtons = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="h-10 w-10 rounded-lg border border-gray-300 bg-white font-medium text-gray-800 transition-colors hover:bg-gray-50"
          aria-label="Go to page 1"
        >
          1
        </button>
      );

      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis-1"
            className="flex h-10 w-10 items-center justify-center text-gray-500"
          >
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`h-10 w-10 rounded-lg font-medium transition-colors ${
            currentPage === i
              ? 'bg-cyan-500 text-white'
              : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
          }`}
          aria-label={`Go to page ${i}`}
          aria-current={currentPage === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis-2"
            className="flex h-10 w-10 items-center justify-center text-gray-500"
          >
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="h-10 w-10 rounded-lg border border-gray-300 bg-white font-medium text-gray-800 transition-colors hover:bg-gray-50"
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {['Events', 'History', 'Contact', 'Monthly', 'Bookmark'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`rounded-full px-6 py-2.5 font-medium transition-colors ${
                  'bookmark' === tab.toLowerCase()
                    ? 'bg-cyan-500 text-white'
                    : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
                aria-pressed={'bookmark' === tab.toLowerCase()}
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
              placeholder="Search bookmarked items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              aria-label="Search bookmarked events"
            />
          </div>
        </div>
      </div>

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
      ) : (
        <>
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
                          {/* Category Tag */}
                          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                            {event.category}
                          </span>
                          {/* Existing Status Tag */}
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
                        onClick={() => toggleBookmark(event.id)}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                        aria-label={
                          isBookmarkedSet.has(event.id)
                            ? 'Remove bookmark'
                            : 'Add bookmark'
                        }
                      >
                        <BookmarkMinus
                          className={`h-5 w-5 ${
                            isBookmarkedSet.has(event.id)
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
                          {event.addressDisplay}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenModal(event)}
                      className={`w-full rounded-lg py-3 font-medium text-white transition-colors ${
                        event.status === 'Ended'
                          ? 'cursor-not-allowed bg-gray-400'
                          : 'bg-cyan-500 hover:bg-cyan-600'
                      }`}
                      disabled={event.status === 'Ended'}
                    >
                      {event.status === 'Ended'
                        ? 'Event Ended'
                        : 'More Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {bookmarkedEvents.length === 0 && !isLoading && (
            <div className="py-12 text-center">
              <BookMarked className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-lg text-gray-500">
                {searchQuery
                  ? 'No bookmarked events found matching your search'
                  : 'You have no bookmarked events yet.'}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-1">{renderPaginationButtons()}</div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </>
      )}

      <EventDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        isBookmarked={
          selectedEvent ? isBookmarkedSet.has(selectedEvent.id) : false
        }
        onToggleBookmark={() =>
          selectedEvent && toggleBookmark(selectedEvent.id)
        }
      />
    </div>
  );
};

export default BookmarkPage;
