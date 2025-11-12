import { Button } from '@/components/ui/button';
import { Link, useNavigate, useParams } from '@/router';
import React, { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { getReports, type Report } from '../api/reports.api';

function ReportsPage() {
  const { type, category } = useParams('/power-bi/:type/:category');
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Get role from user context/auth, defaulting to 'citizen' for now
        const role = 'citizen';
        const reportsByCategory = await getReports(role);

        // Get reports for the current category (backend returns lowercase category names)
        const categoryKey = category?.toLowerCase();
        const categoryData = reportsByCategory[categoryKey];
        const categoryReports = categoryData?.reports || [];

        setReports(categoryReports);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchReports();
    }
  }, [category]);

  return (
    <div className="flex h-screen w-screen flex-col justify-around p-5">
      <Nav />
      <div className="flex items-center gap-2">
        <h2 className="font-medium">
          {type === 'summary'
            ? 'Summary City Performance Dashboard'
            : type === 'trends'
              ? 'Public Trends Report'
              : 'No information found.'}
        </h2>
        <div>
          <select
            value={category}
            onChange={(e) => navigate(`/power-bi/${type}/${e.target.value}`)}
            className="border-0 bg-gray-100 px-1 py-2"
          >
            <option>healthcare</option>
            <option>weather</option>
            <option>demographic</option>
            <option>traffic</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <p className="mt-10 text-lg">Loading reports...</p>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center">
          <p className="mt-10 text-lg text-red-500">Error: {error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="mt-10 text-lg">No reports yet — check back later.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.report_id}>
            <Link to={`/power-bi/${type}/${category}/${report.report_id}`}>
              <h2>{report.title_string}</h2>
              {report.power_bi_report_id_string && (
                <iframe
                  title={report.title_string}
                  src={report.power_bi_report_id_string}
                  className="h-[400px] w-full border-0 outline-none"
                  frameBorder="0"
                ></iframe>
              )}
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export default ReportsPage;
