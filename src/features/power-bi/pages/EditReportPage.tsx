import React, { useEffect, useState } from 'react';
import ReportForm from '../components/ReportForm';
import { useParams } from '@/router';
import { getReports, type Report } from '../api/reports.api';

function EditReportPage() {
  const { id } = useParams('/power-bi/edit/:id');
  const [reportData, setReportData] = useState<Report | null>(null);
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
          const category = reportsByCategory[categoryName];
          const report = category.reports.find(
            (r) => r.report_id === parseInt(id || '0', 10)
          );
          if (report) {
            foundReport = report;
            break;
          }
        }

        if (!foundReport) {
          setError('Report not found');
        } else {
          setReportData(foundReport);
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

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return <ReportForm oldReport={reportData} />;
}

export default EditReportPage;
