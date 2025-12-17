import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  Users,
  Filter,
  Calendar,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useNavigate } from '@/router';
import { apiClient } from '@/lib/apiClient';
import TagFilter from '@/features/volunteer/components/TagFilter';
import Layout from '@/components/main/Layout';
import { useGetAuthMe } from '@/api/generated/authentication';

// --- Interfaces ---
interface VolunteerEvent {
  id: number;
  title: string;
  description: string | null;
  start_at: string | null;
  // Added registration_deadline to interface for sorting
  registration_deadline: string | null;
  current_participants: number;
  total_seats: number;
  image_url: string | null;
  tag: string | undefined;
}

interface ApiResponse {
  success: boolean;
  data: {
    events: VolunteerEvent[];
    total: number;
    page: number;
    totalPages: number;
  };
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// --- Utility Hooks ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Components ---

const EventCardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
    <div className="h-48 w-full animate-pulse bg-gray-200" />
    <div className="flex flex-1 flex-col space-y-3 p-5">
      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-gray-200" />
      <div className="flex justify-between pt-2">
        <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  </div>
);

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

export default function CityVolunteerHomepage() {
  const navigate = useNavigate();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [showFilters, setShowFilters] = useState(false);
  const [volunteerJobs, setVolunteerJobs] = useState<VolunteerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const EVENTS_PER_PAGE = 9;

  const tags = [
    'Environment',
    'Freecycle',
    'Weather',
    'Education',
    'Funding',
    'Disability/Elderly Support',
    'Community & Social',
  ];

  // Get Role
  const role = useGetAuthMe().data?.data?.role;

  // Logic
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: EVENTS_PER_PAGE,
          search: debouncedSearch || undefined,
          tag: selectedCategory || undefined,
        };
        const response = await apiClient.get<ApiResponse>(
          '/api/v1/volunteer/getAll',
          { params }
        );

        if (response.data.success) {
          const events = response.data.data.events;

          // --- SORTING LOGIC START ---
          const sortedEvents = events.sort((a, b) => {
            const now = new Date();
            // Use registration_deadline if available, otherwise start_at
            const dateA = a.registration_deadline
              ? new Date(a.registration_deadline)
              : new Date(a.start_at || '9999-12-31');
            const dateB = b.registration_deadline
              ? new Date(b.registration_deadline)
              : new Date(b.start_at || '9999-12-31');

            const isPassedA = dateA < now;
            const isPassedB = dateB < now;

            // If A is passed and B is not, B comes first (return 1 to push A back)
            if (isPassedA && !isPassedB) return 1;
            // If B is passed and A is not, A comes first (return -1 to push B back)
            if (!isPassedA && isPassedB) return -1;

            // If both are the same status (both active or both passed), sort by date ascending
            return dateA.getTime() - dateB.getTime();
          });
          // --- SORTING LOGIC END ---

          setVolunteerJobs(sortedEvents);
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
  }, [debouncedSearch, currentPage, selectedCategory]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory]);

  const handleCardClick = (id: number) => {
    navigate('/volunteer/detail/:id', { params: { id: String(id) } });
  };

  return (
    <Layout>
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
        {/* --- Hero Section --- */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 pt-16 pb-32 text-white shadow-lg">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="mb-6 md:mb-0">
                <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Make a Difference{' '}
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                </h1>
                <p className="mt-4 max-w-xl text-lg text-blue-100">
                  Join thousands of volunteers transforming our city. Find your
                  cause, connect with others, and create impact today.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate('/volunteer/userjoin')}
                  className="group flex items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <Users className="h-5 w-5" />
                  My Joined Events
                </button>

                {(role === 'Volunteer Coordinator' || role === 'Admin') && (
                  <button
                    onClick={() => navigate('/volunteer/createpost')}
                    className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-blue-700 shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                    Create Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="relative mx-auto -mt-24 max-w-7xl flex-1 px-4 pb-12 sm:px-6 lg:px-8">
          {/* --- Search & Filter Bar --- */}
          <div className="rounded-2xl bg-white p-4 shadow-xl shadow-blue-900/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-12 text-slate-700 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-xl border px-6 py-3 font-medium transition-all ${
                  showFilters || selectedCategory
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {selectedCategory && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-xs text-blue-800">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Filter Drawer */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                showFilters
                  ? 'mt-6 grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-slate-400 uppercase">
                  Categories
                </h3>
                <TagFilter
                  categories={tags}
                  selectedCategory={selectedCategory}
                  onChange={setSelectedCategory}
                />
              </div>
            </div>
          </div>

          {/* --- Content Area --- */}
          <div className="mt-10">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {selectedCategory
                  ? `${selectedCategory} Opportunities`
                  : 'Recent Opportunities'}
              </h2>
              <span className="text-sm text-slate-500">
                {!isLoading && `${volunteerJobs.length} events found`}
              </span>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
                <p>Unable to load events. {error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                // Skeleton Loaders
                [...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)
              ) : volunteerJobs.length > 0 ? (
                // Event Cards
                volunteerJobs.map((job) => {
                  const percentFilled = Math.min(
                    (job.current_participants / job.total_seats) * 100,
                    100
                  );
                  const isFull = job.current_participants >= job.total_seats;
                  const isPassed = job.registration_deadline
                    ? new Date(job.registration_deadline) < new Date()
                    : false;

                  return (
                    <div
                      key={job.id}
                      onClick={() => handleCardClick(job.id)}
                      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-500/20 ${isPassed ? 'opacity-75 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : ''}`}
                    >
                      {/* Image Container */}
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        <img
                          src={
                            job.image_url ||
                            'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800'
                          }
                          alt={job.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                        {/* Tag Badge */}
                        {job.tag && (
                          <span className="absolute top-4 left-4 rounded-lg bg-white/90 px-3 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase backdrop-blur-sm">
                            {job.tag}
                          </span>
                        )}

                        {/* Status Badge (Passed/Full) */}
                        {isPassed ? (
                          <span className="absolute top-4 right-4 rounded-lg bg-red-600/90 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                            Closed
                          </span>
                        ) : isFull ? (
                          <span className="absolute top-4 right-4 rounded-lg bg-orange-500/90 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                            Full
                          </span>
                        ) : null}

                        {/* Date Badge */}
                        {job.start_at && (
                          <div className="absolute bottom-4 left-4 flex items-center gap-1 text-sm font-medium text-white">
                            <Calendar className="h-4 w-4 text-yellow-300" />
                            {new Date(job.start_at).toLocaleDateString(
                              undefined,
                              {
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-slate-800 group-hover:text-blue-600">
                          {job.title}
                        </h3>

                        {/* Progress Bar Section */}
                        <div className="mt-auto pt-4">
                          <div className="mb-1 flex items-end justify-between text-sm">
                            <span className="font-medium text-slate-600">
                              {isPassed
                                ? 'Registration Closed'
                                : isFull
                                  ? 'Full'
                                  : 'Spots filled'}
                            </span>
                            <span
                              className={`font-bold ${isFull || isPassed ? 'text-slate-500' : 'text-blue-600'}`}
                            >
                              {job.current_participants}/{job.total_seats}
                            </span>
                          </div>

                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isPassed ? 'bg-slate-400' : isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Empty State
                <div className="col-span-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center sm:col-span-2 lg:col-span-3">
                  <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">
                    No events found
                  </h3>
                  <p className="text-slate-500">
                    Try adjusting your search or filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory(undefined);
                    }}
                    className="mt-4 font-medium text-blue-600 hover:text-blue-700"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </main>
      </div>
    </Layout>
  );
}
