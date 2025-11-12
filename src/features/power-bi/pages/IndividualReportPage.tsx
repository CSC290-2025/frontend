import { useNavigate, useParams } from '@/router';
import React, { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { Button } from '@/components/ui/button';
import { getReports, type Report } from '../api/reports.api';

function IndividualReportPage() {
  const user = {
    name: 'Alora',
    role: 'admin', // TODO: Get from user context/auth
  };

  const { type, category, id } = useParams('/power-bi/:type/:category/:id');
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Get role from user context/auth, defaulting to 'citizen' for now
        const role = 'citizen';
        const reportsByCategory = await getReports(role);

        // Find the report by ID across all categories
        let foundReport: Report | null = null;
        for (const categoryName in reportsByCategory) {
          const categoryData = reportsByCategory[categoryName];
          const reportItem = categoryData.reports.find(
            (r) => r.report_id === parseInt(id || '0', 10)
          );
          if (reportItem) {
            foundReport = reportItem;
            break;
          }
        }

        if (!foundReport) {
          setError('Report not found');
        } else {
          setReport(foundReport);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Error: {error || 'Report not found'}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-around p-10">
      <Nav />
      <div className="w-full">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          ← Back
        </Button>
      </div>
      <h2 className="font-medium">
        {type === 'summary'
          ? 'Summary City Performance Dashboard'
          : type === 'trends'
            ? 'Public Trends Report'
            : 'No information found.'}
      </h2>
      <h2>{category}</h2>
      <h2>{report.title_string}</h2>
      {report.power_bi_report_id_string && (
        <iframe
          title={report.title_string}
          src={report.power_bi_report_id_string}
          className="mb-4 h-[800px] w-full border-0 outline-none"
          frameBorder="0"
        ></iframe>
      )}
      {report.description_string && <p>{report.description_string}</p>}
      {user.role === 'admin' && (
        <div className="mt-4 flex gap-2">
          <Button onClick={() => navigate(`/power-bi/edit/${id}`)}>
            Edit Report
          </Button>
          <Button onClick={() => navigate('/power-bi')}>Delete Report</Button>
        </div>
      )}
    </div>
  );
}

export default IndividualReportPage;
