import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  ArrowLeft, // NEW for Pagination
  ArrowRight, // NEW for Pagination
} from 'lucide-react';
import { useNavigate } from '@/router';
import { apiClient } from '@/lib/apiClient';

// --- Interfaces (No Change) ---
interface VolunteerEvent {
  id: number;
  title: string;
  description: string | null;
  start_at: string | null;
  current_participants: number;
  total_seats: number;
  image_url: string | null;
}

interface ApiResponse {
  success: boolean;
  data: {
    events: VolunteerEvent[];
    total: number;
    page: number;
    totalPages: number; // CRITICAL: The API must return this
  };
}

// --- useDebounce Hook (No Change) ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- PaginationControls Component (No Change) ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-8 flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Show first page if not already in the visible range */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            1
          </button>
          {startPage > 2 && <span className="text-gray-500">...</span>}
        </>
      )}

      {/* Visible page buttons */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Show last page if not already in the visible range */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="text-gray-500">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
};
// --- END PaginationControls ---

export default function CityVolunteerHomepage() {
  const navigate = useNavigate();

  const [volunteerJobs, setVolunteerJobs] = useState<VolunteerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const EVENTS_PER_PAGE = 9;

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: EVENTS_PER_PAGE,
          search: debouncedSearch || undefined,
        };

        const response = await apiClient.get<ApiResponse>(
          'api/v1/volunteer/getAll',
          { params }
        );

        if (response.data.success) {
          setVolunteerJobs(response.data.data.events);
          setTotalPages(response.data.data.totalPages);
        } else {
          throw new Error('API did not return success');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch events.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [debouncedSearch, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleCardClick = (id: number) => {
    navigate('/volunteer/detail/:id', { params: { id: String(id) } });
  };
  const handleCreateClick = () => {
    navigate('/volunteer/createpost');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Main Content (now starts at the top of the page) */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Search and Create Button */}
          <div className="mb-8 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search for volunteer works"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-200 py-3 pr-4 pl-12 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleCreateClick}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 md:w-auto"
            >
              <span>Create Event</span>
            </button>
          </div>

          {/* Volunteer Jobs Section */}
          <h2 className="mb-6 text-3xl font-bold text-gray-800">
            Current Volunteer Opportunities 🌟
          </h2>

          {isLoading && (
            <div className="text-center text-gray-500">Loading jobs...</div>
          )}

          {error && (
            <div className="text-center text-red-500">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {volunteerJobs.length > 0 ? (
                  volunteerJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleCardClick(job.id)}
                      className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
                    >
                      <img
                        src={
                          job.image_url || 'https://via.placeholder.com/300x160'
                        }
                        alt={job.title}
                        className="h-40 w-full object-cover"
                      />
                      <div className="p-5">
                        <h3 className="mb-2 truncate text-lg font-semibold text-gray-800">
                          {job.title}
                        </h3>
                        <p className="mb-1 text-sm text-gray-600">
                          <span className="font-medium">Date:</span>{' '}
                          {job.start_at
                            ? new Date(job.start_at).toLocaleDateString()
                            : 'Date TBD'}
                        </p>
                        <p className="mb-4 text-sm text-gray-600">
                          <span className="font-medium">Slots:</span>{' '}
                          {job.current_participants} / {job.total_seats} filled
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 text-center text-gray-500 sm:col-span-2 lg:col-span-3">
                    No events found matching your search.
                  </div>
                )}
              </div>

              {/* --- Pagination Controls --- */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
