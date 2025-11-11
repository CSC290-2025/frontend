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
    totalPages: number;
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

export default function CityVolunteerHomepage() {
  const [activeSection, setActiveSection] = useState('Events');
  const navigate = useNavigate();

  const [volunteerJobs, setVolunteerJobs] = useState<VolunteerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const categories = [
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
          page: 1,
          limit: 9,
          search: debouncedSearch || undefined,
          department_id: departmentFilter || undefined,
        };

        const response = await axios.get<ApiResponse>(
          'http://localhost:3000/api/v1/volunteer/getAll'
        );

        if (response.data.success) {
          setVolunteerJobs(response.data.data.events);
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
  }, [debouncedSearch, departmentFilter]);

  const handleCardClick = (id: number) => {
    navigate('/volunteer/detail/:id', { params: { id: String(id) } });
  };
  const handleCreateClick = () => {
    navigate('/volunteer/createpost');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="p-6"></div>

        <nav className="flex-1 px-3">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveSection(item.section)}
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
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Category Cards */}
          <div className="mb-8 grid grid-cols-4 gap-4">
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
          <div className="mb-6 flex gap-3">
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

            <select
              value={departmentFilter || ''}
              onChange={(e) =>
                setDepartmentFilter(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="flex items-center gap-2 rounded-full border border-blue-400 px-6 py-3 text-blue-400 hover:bg-blue-50"
            >
              <option value="">All Departments</option>
              <option value="1">Test Dept 1</option>
              <option value="2">Test Dept 2</option>
            </select>

            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
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
            <div className="grid grid-cols-4 gap-6">
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
                        {job.start_at
                          ? new Date(job.start_at).toLocaleDateString()
                          : 'Date TBD'}
                      </p>
                      <p className="mb-4 text-sm text-gray-600">
                        Participated {job.current_participants}/
                        {job.total_seats}
                      </p>
                      <button className="w-full rounded-full bg-lime-400 py-2 font-medium text-gray-800 transition-colors hover:bg-lime-500">
                        Join
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center text-gray-500">
                  No events found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
