import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  Calendar,
  Bus,
  Cloud,
  Heart,
  Building,
  Bike,
  Users,
  Recycle,
  Settings,
  Wallet,
  User,
  LogOut,
  Brain,
  Menu,
  X,
  ArrowLeft, // NEW for Pagination
  ArrowRight, // NEW for Pagination
} from 'lucide-react';
import { useNavigate } from '@/router';

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

// --- NEW COMPONENT: PaginationControls ---
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
  // Logic for displaying a small set of page numbers (e.g., current, prev, next)
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
  const [activeSection, setActiveSection] = useState('Events');
  const navigate = useNavigate();

  const [volunteerJobs, setVolunteerJobs] = useState<VolunteerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // --- NEW Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const EVENTS_PER_PAGE = 9; // Fixed to 9 for a 3x3 layout

  // State to manage sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = [
    // ... categories data ...
    { icon: Calendar, title: 'Events', subtitle: 'Activities and volunteer' },
    { icon: Bike, title: 'Free cycle', subtitle: 'Activities and volunteer' },
    { icon: Users, title: 'Volunteer', subtitle: 'Activities and volunteer' },
    {
      icon: Recycle,
      title: 'Waste Management',
      subtitle: 'Activities and volunteer',
    },
  ];

  const sidebarItems = [
    // ... sidebarItems data ...
    {
      icon: Building,
      title: 'City Insights',
      subtitle: 'Dashboard and quick service',
      section: 'City Insights',
    },
    {
      icon: Bus,
      title: 'Transport',
      subtitle: 'Bus timing and routes',
      section: 'Transport',
    },
    {
      icon: Calendar,
      title: 'Events',
      subtitle: 'Activities and volunteer',
      section: 'Events',
    },
    {
      icon: Cloud,
      title: 'Weather reports',
      subtitle: 'Forecast & Air Quality',
      section: 'Weather',
    },
    {
      icon: Heart,
      title: 'Healthcare',
      subtitle: 'Hospital & Emergency services',
      section: 'Healthcare',
    },
    {
      icon: Brain,
      title: 'Know AI',
      subtitle: 'Learning with AI',
      section: 'AI',
    },
    {
      icon: Users,
      title: 'Contact us',
      subtitle: 'report issues',
      section: 'Contact',
    },
    { icon: User, title: 'Profile', subtitle: '', section: 'Profile' },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage, // Pass current page
          limit: EVENTS_PER_PAGE, // Pass the fixed limit
          search: debouncedSearch || undefined,
        };

        const response = await axios.get<ApiResponse>(
          'http://localhost:3000/api/v1/volunteer/getAll',
          { params }
        );

        if (response.data.success) {
          setVolunteerJobs(response.data.data.events);
          setTotalPages(response.data.data.totalPages); // Set total pages from API
        } else {
          throw new Error('API did not return success');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch events.');
      } finally {
        setIsLoading(false);
      }
    };

    // NOTE: Depend on currentPage AND debouncedSearch
    fetchEvents();
  }, [debouncedSearch, currentPage]);

  // --- NEW Handler for Pagination ---
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Optional: scroll to the top of the event list for better UX
      window.scrollTo(0, 0);
    }
  };

  // Reset page to 1 whenever a new search is performed
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
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-30 flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Mobile header for sidebar with close button */}
        <div className="flex h-16 items-center justify-between p-4 lg:hidden">
          <span className="text-lg font-bold">Menu</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-gray-700 hover:text-gray-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="hidden p-6 lg:block"></div>

        <nav className="flex-grow px-3">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveSection(item.section);
                setIsSidebarOpen(false); // Close sidebar on item click
              }}
              className={`mb-2 flex w-full items-start rounded-lg p-3 transition-colors ${
                activeSection === item.section
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <item.icon className="mt-0.5 mr-3 h-5 w-5 text-gray-600" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-xs text-gray-500">{item.subtitle}</div>
                )}
              </div>
            </button>
          ))}
        </nav>

        <div className="space-y-2 p-3">
          <button className="flex w-full items-center rounded-lg p-3 hover:bg-gray-50">
            <Settings className="mr-3 h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Setting</span>
          </button>
          <button className="flex w-full items-center rounded-lg p-3 hover:bg-gray-50">
            <Wallet className="mr-3 h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">E-wallet</span>
          </button>
          <button className="flex w-full items-center justify-center rounded-lg bg-blue-400 p-3 text-white hover:bg-blue-500">
            <LogOut className="mr-2 h-5 w-5" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile header with Hamburger button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 lg:hidden">
          <span className="text-lg font-bold">City Volunteer</span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-gray-700 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* This div now handles the scrolling for the main content */}
        <div className="overflow-auto">
          <div className="p-4 md:p-8">
            {/* Category Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
                >
                  <category.icon className="mb-3 h-8 w-8 text-gray-700" />
                  <h3 className="mb-1 text-lg font-semibold text-gray-800">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-500">{category.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row">
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
              Volunteer Jobs
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
                            job.image_url ||
                            'https://via.placeholder.com/300x160'
                          }
                          alt={job.title}
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-5">
                          <h3 className="mb-2 truncate text-lg font-semibold text-gray-800">
                            {job.title}
                          </h3>
                          <p className="mb-1 text-sm text-gray-600">
                            {job.start_at
                              ? new Date(job.start_at).toLocaleDateString()
                              : 'Date TBD'}
                          </p>
                          <p className="mb-4 text-sm text-gray-600">
                            Participated {job.current_participants}/
                            {job.total_seats}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-1 text-center text-gray-500 sm:col-span-2 lg:col-span-3">
                      No events found.
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
        </div>
      </div>
    </div>
  );
}
