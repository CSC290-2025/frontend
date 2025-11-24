import { useAuth } from '@/features/auth';
import { useNavigate } from '@/router';
import { useEffect } from 'react';
import Layout from '@/components/main/Layout';
import { Activity, AlertCircle, Droplet } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Explore our comprehensive city services platform
          </p>
        </div>

        {/* City Insights Stats */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            City Insights
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Air Quality Card */}
            <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <Activity className="h-6 w-6 text-blue-600" />
                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                  Good
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Air Quality</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">AQI: 65</p>
              <p className="mt-2 text-xs text-gray-500">Status: Moderate</p>
            </div>

            {/* Public Transport Card */}
            <div className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <Activity className="h-6 w-6 text-green-600" />
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                  Active
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Transit Status
              </h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">24 Routes</p>
              <p className="mt-2 text-xs text-gray-500">All operational</p>
            </div>

            {/* Active Cases Card */}
            <div className="rounded-lg border-l-4 border-orange-500 bg-white p-6 shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700">
                  Watch
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Emergency Cases
              </h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">3</p>
              <p className="mt-2 text-xs text-gray-500">Active in district</p>
            </div>

            {/* Water Usage Card */}
            <div className="rounded-lg border-l-4 border-cyan-500 bg-white p-6 shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <Droplet className="h-6 w-6 text-cyan-600" />
                <span className="rounded bg-cyan-100 px-2 py-1 text-xs text-cyan-700">
                  Normal
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Water Quality
              </h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">98%</p>
              <p className="mt-2 text-xs text-gray-500">Supply status</p>
            </div>
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">→</span>
              <span>
                Access all services from the left sidebar - use dropdowns to
                explore more options
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">→</span>
              <span>
                Check City Insights regularly for real-time updates on air
                quality, transit, and emergency alerts
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">→</span>
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
