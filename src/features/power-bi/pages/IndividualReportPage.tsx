import { useNavigate, useParams } from '@/router';
import Nav from '../components/Nav';
import { Button } from '@/components/ui/button';
import { useUserRole } from '../hooks/useUserRole';
import { useReportById } from '../hooks/useReportById';
import { deleteReport } from '../api/reports.api';

const TYPE_LABELS: Record<
  string,
  { title: string; description: string; badge: string }
> = {
  summary: {
    title: 'Summary City Performance Dashboard',
    description:
      'Citizen-facing KPI overview covering traffic, healthcare, weather and more.',
    badge: 'Featured',
  },
  trends: {
    title: 'Public Trends Report',
    description:
      'Longitudinal analysis highlighting macro shifts across the city.',
    badge: 'Trends',
  },
  detailed: {
    title: 'Detailed Operational Dashboards',
    description: 'Real-time telemetry for frontline teams and ops leaders.',
    badge: 'Operational',
  },
  planning: {
    title: 'Financial & Resource Planning',
    description: 'Budget planning, resource modeling and fiscal guardrails.',
    badge: 'Planning',
  },
  usage: {
    title: 'Report Usage Analysis',
    description: 'Engagement analytics for every dashboard interaction.',
    badge: 'Engagement',
  },
  data: {
    title: 'Data Quality Dashboard',
    description:
      'Freshness, accuracy and completeness scoring for BI data sources.',
    badge: 'Quality',
  },
};

function IndividualReportPage() {
  const { type, category, id } = useParams('/power-bi/:type/:category/:id');
  const navigate = useNavigate();
  const { role } = useUserRole();
  const { report, loading, error } = useReportById({ role, id });

  const onDelete = async () => {
    if (!id) return;
    if (role !== 'admin') {
      alert('You do not have permission to delete reports.');
      return;
    }
    const confirmed = window.confirm(
      'Delete this report? This cannot be undone.'
    );
    if (!confirmed) return;
    try {
      await deleteReport(parseInt(id, 10), role);
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
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] text-[#1B1F3B]">
        <p className="text-lg">Loading report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] text-[#1B1F3B]">
        <p className="text-lg text-red-500">
          Error: {error || 'Report not found'}
        </p>
      </div>
    );
  }

  const typeMeta = TYPE_LABELS[type as string] ?? {
    title: 'Power BI Collection',
    description:
      'Explore the live dashboard, collaborate with teammates, and share findings.',
    badge: 'Collection',
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] px-4 pt-6 pb-12 text-[#1B1F3B] md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Nav />

        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-max cursor-pointer border-[#CFE2FF] bg-transparent text-[#2B5991] hover:bg-[#E8F4FF]"
        >
          ← Back to list
        </Button>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl shadow-[#0D111D]/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-[#E8F4FF] px-4 py-1 text-xs font-semibold tracking-[0.3em] text-[#2B5991] uppercase">
                {typeMeta.badge}
              </span>
              <h1 className="mt-3 text-3xl leading-tight font-black text-[#1B1F3B]">
                {report.title_string}
              </h1>
              <p className="mt-2 text-sm text-[#4A5568]">{typeMeta.title}</p>
              <p className="text-sm text-[#4A5568]">{typeMeta.description}</p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-[#4A5568]">
              <div className="rounded-2xl bg-[#F3F7FD] px-4 py-3 capitalize">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#2B5991] uppercase">
                  Category
                </p>
                <p>{category}</p>
              </div>
              <div className="rounded-2xl bg-[#F3F7FD] px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#2B5991] uppercase">
                  Visibility
                </p>
                <p>{report.visibility}</p>
              </div>
            </div>
          </div>

          {report.description_string && (
            <p className="mt-6 text-sm text-[#4A5568]">
              {report.description_string}
            </p>
          )}
        </section>

        {report.power_bi_report_id_string && (
          <div className="overflow-hidden rounded-3xl border border-[#CFE2FF] bg-white shadow-2xl shadow-[#0D111D]/5">
            <iframe
              title={report.title_string}
              src={report.power_bi_report_id_string}
              className="h-[720px] w-full border-0 outline-none"
              frameBorder="0"
            ></iframe>
          </div>
        )}

        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 text-sm text-[#4A5568]">
          <p>
            Share this dashboard with your team to align on the next actions.
            Need to embed elsewhere? Use the Power BI share controls from the
            iframe toolbar.
          </p>
        </div>

        {role === 'admin' && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                navigate('/power-bi/edit/:id', { params: { id: id as string } })
              }
              className="cursor-pointer bg-[#01CCFF] text-white hover:bg-[#0091B5]"
            >
              Edit report
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer border-[#CFE2FF] text-[#2B5991] hover:bg-[#E8F4FF]"
              onClick={() => navigate('/power-bi')}
            >
              Back to collections
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              className="cursor-pointer bg-[#D64545] hover:bg-[#b53333]"
            >
              Delete report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndividualReportPage;
