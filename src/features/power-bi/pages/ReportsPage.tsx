import { Link, useNavigate, useParams } from '@/router';
import Nav from '../components/Nav';
import { useUserRole } from '../hooks/useUserRole';
import { useReportsByCategory } from '../hooks/useReportsByCategory';

function ReportsPage() {
  const { type, category } = useParams('/power-bi/:type/:category');
  const navigate = useNavigate();
  const { role } = useUserRole();
  const { reports, loading, error } = useReportsByCategory({
    role,
    type,
    category,
  });

  return (
    <div className="flex h-screen w-screen flex-col justify-around bg-[#F9FaFB] p-5">
      <Nav />
      <div className="flex items-center gap-2">
        <h2 className="font-medium">
          {type === 'summary'
            ? 'Summary City Performance Dashboard'
            : type === 'trends'
              ? 'Public Trends Report'
              : type === 'detailed'
                ? 'Detailed Operational Dashboards'
                : type === 'planning'
                  ? 'Financial & Resource Planning'
                  : type === 'usage'
                    ? 'Report Usage Analysis'
                    : type === 'data'
                      ? 'Data Quality Dashboard'
                      : 'No information found.'}
        </h2>
        <div>
          <select
            value={category}
            onChange={(e) =>
              navigate('/power-bi/:type/:category', {
                params: { type: type as string, category: e.target.value },
              })
            }
            className="cursor-pointer rounded-2xl border border-[#D9D9D9] bg-[#01CCFF] py-2 text-center font-normal text-white hover:bg-[#0091B5]"
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
            <Link
              to="/power-bi/:type/:category/:id"
              params={{
                type: type as string,
                category: category as string,
                id: String(report.report_id),
              }}
            >
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
