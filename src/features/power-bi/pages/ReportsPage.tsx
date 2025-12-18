import { Link, useNavigate, useParams } from '@/router';
import Nav from '../components/Nav';
import { useUserRole } from '../hooks/useUserRole';
import { useReportsByCategory } from '../hooks/useReportsByCategory';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

const TYPE_COPY: Record<
  string,
  { title: string; description: string; badge: string }
> = {
  summary: {
    title: 'Summary City Performance Dashboard',
    description:
      'Daily digest surfacing the highest-signal KPIs for citizens and leaders.',
    badge: 'Featured',
  },
  trends: {
    title: 'Public Trends Report',
    description:
      'Long-term indicators covering population, environment and wellbeing shifts.',
    badge: 'Trends',
  },
  // detailed: {
  //   title: 'Detailed Operational Dashboards',
  //   description:
  //     'Real-time telemetry for operations teams – traffic, healthcare, weather.',
  //   badge: 'Admin',
  // },
  // planning: {
  //   title: 'Financial & Resource Planning',
  //   description:
  //     'Budget, scenario planning and workforce allocation all in one view.',
  //   badge: 'Admin',
  // },
  // usage: {
  //   title: 'Report Usage Analysis',
  //   description:
  //     'Understand which dashboards are resonating and where gaps exist.',
  //   badge: 'Admin',
  // },
  // data: {
  //   title: 'Data Quality Dashboard',
  //   description:
  //     'Freshness, completeness and accuracy scoring for every dataset powering BI.',
  //   badge: 'Quality',
  // },
};

function ReportsPage() {
  const { type, category } = useParams('/power-bi/:type/:category');
  const navigate = useNavigate();
  const { role } = useUserRole();
  const { reports, loading, error } = useReportsByCategory({
    role,
    type,
    category,
  });
  const [page, setPage] = useState(1);
  const perPage = 3;

  const typeMeta = TYPE_COPY[type as string] ?? {
    title: 'Power BI Collection',
    description: 'Select a report to explore the live dashboard.',
    badge: 'Collection',
  };

  const totalPages = Math.max(1, Math.ceil(reports.length / perPage));
  const start = (page - 1) * perPage;
  const currentReports = reports.slice(start, start + perPage);

  const statusBlock = useMemo(() => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white text-lg text-[#4A5568]">
          Loading reports...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-lg text-red-600">
          Error: {error}
        </div>
      );
    }

    if (currentReports.length === 0) {
      return (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-[#E2E8F0] bg-white text-center text-[#4A5568]">
          <p className="text-lg font-semibold text-[#1B1F3B]">
            No reports yet — check back soon
          </p>
          <p className="text-sm">
            {role === 'admin'
              ? 'Create one now from the + New Report button.'
              : 'Your administrators are preparing insights for this category.'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        {currentReports.map((report) => (
          <article
            key={report.report_id}
            className="rounded-3xl border border-[#E2E8F0] bg-white p-6 text-[#1B1F3B] shadow-lg shadow-[#0D111D]/5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#4A5568]">
              <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-[#2B5991] capitalize">
                {category}
              </span>
              <span className="text-xs tracking-[0.3em] text-[#2B5991] uppercase">
                {typeMeta.badge}
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-extrabold text-[#1B1F3B]">
              {report.title_string}
            </h3>
            {report.description_string && (
              <p className="mt-2 text-sm text-[#4A5568]">
                {report.description_string}
              </p>
            )}
            {report.power_bi_report_id_string && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#CFE2FF] bg-[#F7FBFF]">
                <iframe
                  title={report.title_string}
                  src={report.power_bi_report_id_string}
                  className="h-[420px] w-full border-0 outline-none"
                  frameBorder="0"
                ></iframe>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="cursor-pointer bg-[#01CCFF] text-white hover:bg-[#0091B5]"
              >
                <Link
                  to="/power-bi/:type/:category/:id"
                  params={{
                    type: type as string,
                    category: category as string,
                    id: String(report.report_id),
                  }}
                >
                  Open detail view
                </Link>
              </Button>
              {role === 'admin' && (
                <Button
                  variant="outline"
                  className="cursor-pointer border-[#CFE2FF] text-[#2B5991] hover:bg-[#E8F4FF]"
                  asChild
                >
                  <Link
                    to="/power-bi/edit/:id"
                    params={{ id: String(report.report_id) }}
                  >
                    Edit report
                  </Link>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  }, [category, currentReports, error, loading, role, type, typeMeta.badge]);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] px-4 pt-6 pb-10 text-[#1B1F3B] md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Nav />

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl shadow-[#0D111D]/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-[#E8F4FF] px-4 py-1 text-xs font-semibold tracking-[0.3em] text-[#2B5991] uppercase">
                {typeMeta.badge}
              </span>
              <h2 className="mt-3 text-3xl leading-tight font-black text-[#1B1F3B]">
                {typeMeta.title}
              </h2>
              <p className="mt-2 text-sm text-[#4A5568]">
                {typeMeta.description}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-3xl border border-[#E2E8F0] bg-[#F7FBFF] p-4">
              <label
                htmlFor="category"
                className="text-xs font-semibold tracking-[0.25em] text-[#2B5991] uppercase"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) =>
                  navigate('/power-bi/:type/:category', {
                    params: { type: type as string, category: e.target.value },
                  })
                }
                className="cursor-pointer rounded-2xl border border-[#CFE2FF] bg-white px-4 py-3 text-base font-semibold text-[#2B5991] focus-visible:ring-2 focus-visible:ring-[#01CCFF] focus-visible:outline-none"
              >
                <option value="healthcare">Healthcare</option>
                <option value="weather">Weather</option>
                <option value="demographic">Demographic</option>
                <option value="traffic">Traffic</option>
              </select>
            </div>
          </div>
        </section>

        {statusBlock}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              const isActive = page === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#01CCFF] text-white'
                      : 'bg-white text-[#2B5991] hover:bg-[#E8F4FF]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
