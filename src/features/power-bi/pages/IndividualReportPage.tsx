import { useNavigate, useParams } from '@/router';
import Nav from '../components/Nav';
import { Button } from '@/components/ui/button';
import { useUserRole } from '../hooks/useUserRole';
import { useReportById } from '../hooks/useReportById';
import { deleteReport } from '../api/reports.api';

function IndividualReportPage() {
  // const user = {
  //   name: 'Alora',
  //   role: 'admin',
  // };

  const { type, category, id } = useParams('/power-bi/:type/:category/:id');
  const navigate = useNavigate();
  const { role } = useUserRole();
  const { report, loading, error } = useReportById({ role, id });
  const onDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      'Delete this report? This cannot be undone.'
    );
    if (!confirmed) return;
    try {
      await deleteReport(parseInt(id, 10));
      navigate('/power-bi');
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : 'Failed to delete report. Please try again.'
      );
    }
  };

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
      {role === 'admin' && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() =>
              navigate('/power-bi/edit/:id', { params: { id: id as string } })
            }
          >
            Edit Report
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete Report
          </Button>
        </div>
      )}
    </div>
  );
}

export default IndividualReportPage;
