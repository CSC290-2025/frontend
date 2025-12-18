import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Info,
} from 'lucide-react';
import { QuickActionCard } from '@/features/_healthcare/components/cards/QuickActionCard';

interface EmergencyReport {
  id: number;
  title: string | null;
  description: string | null;
  level: string | null;
  status: string | null;
  image_url: string | null;
  created_at: string;
}

const AdminEmergencyPage: React.FC = () => {
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(
    null
  );

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    setLoading(true);
    const token = localStorage.getItem('healthcare_token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:3000/api/healthcare/emergencies',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.message || 'Failed to fetch emergencies');
      }
    } catch (err) {
      setError('An error occurred while fetching reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <QuickActionCard
          icon={PhoneCall}
          title="Hotline"
          description="+1 (555) 443-0021"
        />
        <QuickActionCard
          icon={ShieldAlert}
          title="Incident command"
          description="Central triage channel"
        />
        <QuickActionCard
          icon={MapPin}
          title="Nearest facility"
          description="Routing to emergency hub"
        />
      </section>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Active Emergencies
          </h2>
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            Live Feed
          </span>
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            <span className="font-medium">Error!</span> {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading emergency feed...
          </div>
        ) : reports.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No active emergencies reported.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${
                      report.level === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : report.level === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {report.level || 'Unknown Level'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleTimeString()}
                  </span>
                </div>

                {report.image_url && (
                  <div className="mb-3 h-32 w-full overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={report.image_url}
                      alt="Incident"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <h3 className="mb-1 line-clamp-1 font-bold text-gray-800">
                  {report.title || 'Untitled Report'}
                </h3>
                <p className="mb-3 line-clamp-2 flex-grow text-sm text-gray-600">
                  {report.description || 'No description provided.'}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1">
                    {report.status === 'verified' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <AlertTriangle className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Info className="h-5 w-5 text-indigo-600" />
                Emergency Details
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <span
                      className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${
                        selectedReport.level === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : selectedReport.level === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {selectedReport.level || 'Unknown Level'}
                    </span>
                    <h4 className="mb-2 text-2xl font-bold text-gray-900">
                      {selectedReport.title || 'Untitled Report'}
                    </h4>
                    <p className="leading-relaxed text-gray-600">
                      {selectedReport.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedReport.status === 'verified' ? (
                        <span className="flex items-center gap-1 font-medium text-green-600">
                          <CheckCircle className="h-4 w-4" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-amber-600">
                          <AlertTriangle className="h-4 w-4" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedReport.image_url ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                      <img
                        src={selectedReport.image_url}
                        alt="Evidence"
                        className="h-auto max-h-64 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
                      <span className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4" /> No image evidence
                      </span>
                    </div>
                  )}

                  {/* Placeholder for map or other metadata */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <h5 className="mb-1 flex items-center gap-2 font-semibold text-indigo-900">
                      <MapPin className="h-4 w-4" /> Location Data
                    </h5>
                    <p className="text-xs text-indigo-700">
                      Coordinates and address resolution would appear here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmergencyPage;
