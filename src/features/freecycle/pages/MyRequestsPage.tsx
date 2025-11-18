import { useEffect, useState } from 'react';

interface RequestItem {
  id: number;
  item_name: string;
  status: 'pending' | 'accepted' | 'denied' | 'completed';
  created_at: string;
}

// Mock data for requests
const MOCK_REQUESTS: RequestItem[] = [
  {
    id: 1,
    item_name: 'Vintage Wooden Chair',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    item_name: 'Set of Books',
    status: 'accepted',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    item_name: 'Coffee Maker',
    status: 'completed',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    item_name: 'Desk Lamp',
    status: 'denied',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    item_name: 'Plant Pot',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function MyRequestsPage() {
  const [requests] = useState<RequestItem[]>(MOCK_REQUESTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // TODO: INTEGRATION - Uncomment when backend integration is ready
  // const fetchMyRequests = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch('/api/requests');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setRequests(data.data);
  //     }
  //   } catch (err) {
  //     console.error('Failed to fetch requests:', err);
  //   }
  //   setLoading(false);
  // };

  const getStatusCount = (status: string) => {
    return requests.filter((r) => r.status === status).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800';
      case 'accepted':
        return 'bg-green-50 text-green-800';
      case 'denied':
        return 'bg-red-50 text-red-800';
      case 'completed':
        return 'bg-blue-50 text-blue-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Request Items</h1>
        <div className="flex flex-wrap gap-4">
          <div className="rounded-lg bg-yellow-50 px-4 py-2">
            <span className="text-sm text-yellow-800">
              Pending: {getStatusCount('pending')}
            </span>
          </div>
          <div className="rounded-lg bg-green-50 px-4 py-2">
            <span className="text-sm text-green-800">
              Accepted: {getStatusCount('accepted')}
            </span>
          </div>
          <div className="rounded-lg bg-red-50 px-4 py-2">
            <span className="text-sm text-red-800">
              Denied: {getStatusCount('denied')}
            </span>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-2">
            <span className="text-sm text-blue-800">
              Completed: {getStatusCount('completed')}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">Loading your requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">
            You haven&apos;t made any requests yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="mb-3">
                <p className="font-semibold text-gray-900">
                  {request.item_name}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}
                >
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
