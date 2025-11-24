import { useAuth } from '@/features/auth';
import { useNavigate } from '@/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/main/Layout';
import {
  Wind,
  BusFront,
  AlertTriangle,
  Heart,
  ChevronRight,
  Loader,
} from 'lucide-react';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: string;
  statusColor: string;
  bgColor: string;
  borderColor: string;
  onClick: () => void;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Simulate data loading
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  if (!user) return null;

  const quickAccessItems = [
    {
      label: 'Transport',
      path: '/public_transportation',
      icon: BusFront,
    },
    {
      label: 'Weather',
      path: '/weatherCity',
      icon: Wind,
    },
    {
      label: 'Emergency',
      path: '/sos',
      icon: AlertTriangle,
    },
    {
      label: 'Healthcare',
      path: '/healthcare',
      icon: Heart,
    },
  ];

  const statCards: StatCard[] = [
    {
      icon: <Wind className="h-6 w-6 text-blue-600" />,
      label: 'Air Quality',
      value: 'AQI: 65',
      status: 'Good',
      statusColor: 'bg-blue-100 text-blue-700',
      borderColor: 'border-blue-500',
      bgColor: 'bg-white',
      onClick: () => navigate('/weather-aqi/overview/main'),
    },
    {
      icon: <BusFront className="h-6 w-6 text-green-600" />,
      label: 'Transit Status',
      value: '24 Routes',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-700',
      borderColor: 'border-green-500',
      bgColor: 'bg-white',
      onClick: () => navigate('/public_transportation'),
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      label: 'Emergency Cases',
      value: '3',
      status: 'Watch',
      statusColor: 'bg-orange-100 text-orange-700',
      borderColor: 'border-orange-500',
      bgColor: 'bg-white',
      onClick: () => navigate('/sos'),
    },
    {
      icon: <Heart className="h-6 w-6 text-red-600" />,
      label: 'Healthcare',
      value: '12 Clinics',
      status: 'Available',
      statusColor: 'bg-red-100 text-red-700',
      borderColor: 'border-red-500',
      bgColor: 'bg-white',
      onClick: () => navigate('/healthcare'),
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
        {/* Welcome Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Explore our comprehensive city services platform
          </p>
        </div>

        {/* Quick Access Buttons */}
        <div className="mb-8 md:mb-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg bg-white p-4 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95"
                >
                  <Icon className="h-6 w-6 text-blue-600" />
                  <span className="text-center text-xs font-medium text-gray-700">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* City Insights Stats */}
        <div className="mb-8 md:mb-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 md:mb-6">
            City Insights
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center rounded-lg bg-white py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {statCards.map((card) => (
                <button
                  key={card.label}
                  onClick={card.onClick}
                  className={`cursor-pointer rounded-lg border-l-4 ${card.borderColor} ${card.bgColor} p-5 shadow-md transition-all hover:scale-102 hover:shadow-lg active:scale-98 md:p-6`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    {card.icon}
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${card.statusColor}`}
                    >
                      {card.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    {card.label}
                  </h3>
                  <p className="mt-1 text-xl font-bold text-gray-900 md:text-2xl">
                    {card.value}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Click to view details
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips Section */}
        <div className="rounded-lg bg-white p-5 shadow-md md:p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Tips
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <span>
                Use Quick Access buttons above to jump directly to key services
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <span>
                Click City Insights cards to view detailed information and
                real-time updates
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <span>
                Access all services from the left sidebar - use dropdowns to
                explore more options
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <span>
                Visit your profile to update personal settings and preferences
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
