import React, { useEffect, useState } from 'react';
import ReportForm from '../components/ReportForm';
import { useParams } from '@/router';

function EditReportPage() {
  const { id } = useParams();
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      const data = {
        id,
        title: 'Healthcare Report Test',
        url: '123.com',
        visibility: 'citizens',
        type: 'summary',
        category: 'healthcare',
        description: 'healthcare stats',
      };
      setReportData(data);
    };

    fetchReport();
  }, [id]);

  return <ReportForm oldReport={reportData} />;
}

export default EditReportPage;
