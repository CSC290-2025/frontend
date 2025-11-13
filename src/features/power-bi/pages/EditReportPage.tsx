import React from 'react';
import ReportForm from '../components/ReportForm';
import { useParams } from '@/router';
import { useUserRole } from '../hooks/useUserRole';
import { useReportById } from '../hooks/useReportById';

function EditReportPage() {
  const { id } = useParams('/power-bi/edit/:id');
  const { role } = useUserRole();
  const { report, loading, error } = useReportById({ role, id });

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

  return <ReportForm oldReport={report} />;
}

export default EditReportPage;
