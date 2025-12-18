import { useEffect, useMemo, useRef, useState } from 'react';
import Categories from '../components/Categories';
import { useUserRole } from '../hooks/useUserRole';
import Nav from '../components/Nav';

type SectionId = 'summary' | 'trends';
// | 'detailed'
// | 'planning'
// | 'usage'
// | 'data';

const SECTIONS: Array<{
  id: SectionId;
  title: string;
  description: string;
  adminOnly?: boolean;
  badge: string;
  gradient: string;
}> = [
  {
    id: 'summary',
    title: 'Summary City Performance Dashboard',
    description:
      'A high-level overview highlighting traffic, healthcare and weather KPIs for citizen-facing comms.',
    badge: 'Open • Citizens',
    gradient: 'linear-gradient(135deg, #01CCFF 0%, #2B5991 100%)',
  },
  {
    id: 'trends',
    title: 'Public Trends Report',
    description:
      'Surface long-term shifts in population, climate and public health to create proactive programs.',
    badge: 'Insights',
    gradient: 'linear-gradient(135deg, #96E0E1 0%, #2B5991 100%)',
  },
  {
    id: 'detailed',
    title: 'Detailed Operational Dashboards',
    description:
      'Live telemetry across services — traffic flow, healthcare capacity, emergency readiness.',
    badge: 'Admin',
    adminOnly: true,
    gradient: 'linear-gradient(135deg, #2B5991 0%, #0091B5 100%)',
  },
  {
    id: 'planning',
    title: 'Financial & Resource Planning',
    description:
      'Budget health, capital allocation and workforce forecasting in a unified playbook.',
    badge: 'Admin',
    adminOnly: true,
    gradient: 'linear-gradient(135deg, #F9FAFB 0%, #2B5991 100%)',
  },
  {
    id: 'usage',
    title: 'Report Usage Analysis',
    description:
      'Understand which dashboards drive the most engagement and where knowledge gaps exist.',
    badge: 'Admin',
    adminOnly: true,
    gradient: 'linear-gradient(135deg, #1ABFAE 0%, #01CCFF 100%)',
  },
  {
    id: 'data',
    title: 'Data Quality Dashboard',
    description:
      'Score accuracy, completeness and freshness of every dataset powering your reports.',
    badge: 'Admin',
    adminOnly: true,
    gradient: 'linear-gradient(135deg, #2B5991 0%, #1E2C4C 100%)',
  },
];

function Home() {
  const [openSection, setOpenSection] = useState<SectionId | null>(null);
  const { role } = useUserRole();
  const categoriesRef = useRef<HTMLDivElement | null>(null);

  const visibleSections = useMemo(
    () => SECTIONS.filter((section) => !section.adminOnly || role === 'admin'),
    [role]
  );

  const selectedSection = visibleSections.find(
    (section) => section.id === openSection
  );

  const toggleSection = (section: SectionId) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  useEffect(() => {
    if (selectedSection && categoriesRef.current) {
      categoriesRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedSection]);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] px-4 pt-6 pb-12 text-[#1B1F3B] md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Nav />

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl shadow-[#0D111D]/5">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.4em] text-[#2B5991] uppercase">
                City Intelligence
              </p>
              <h2 className="mt-2 text-3xl leading-tight font-black text-[#1B1F3B]">
                Choose a dashboard collection
              </h2>
              <p className="mt-3 text-sm text-[#4A5568]">
                Tap into curated data stories for transparency, planning, and
                rapid response. Select a collection to reveal the categories
                that power it.
              </p>
            </div>
            <div className="rounded-3xl bg-[#F1FBFF] px-5 py-4 text-sm text-[#1B1F3B]">
              <p className="font-semibold text-[#2B5991]">
                Need a new collection?
              </p>
              <p>Admins can craft new Power BI journeys in minutes.</p>
            </div>
          </div>
        </section>

        <section
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${role !== 'admin' ? 'xl:grid-cols-3' : 'xl:grid-cols-3'}`}
        >
          {visibleSections.map((section) => {
            const isActive = section.id === openSection;
            return (
              <article
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className={`group cursor-pointer rounded-3xl border border-[#E2E8F0] p-[1px] transition duration-300 ${
                  isActive
                    ? 'shadow-xl shadow-[#01CCFF]/30'
                    : 'shadow-md shadow-[#0D111D]/5'
                }`}
                style={{ background: section.gradient }}
              >
                <div className="flex h-full flex-col rounded-[26px] bg-white/85 p-5 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#2B5991] uppercase">
                      {section.badge}
                    </span>
                    <span className="rounded-full bg-[#2B5991]/10 px-3 py-1 text-xs font-semibold text-[#2B5991]">
                      {section.id === openSection ? 'Viewing' : 'Preview'}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl leading-tight font-extrabold text-[#1B1F3B]">
                    {section.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#4A5568]">
                    {section.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-[#2B5991]">
                    {isActive ? 'Selected' : 'Tap to explore'}
                    <span
                      className={`transition ${
                        isActive ? 'translate-x-1 opacity-100' : 'opacity-70'
                      }`}
                    >
                      →
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <div
          ref={categoriesRef}
          className={`transition-all duration-500 ${
            selectedSection ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {selectedSection && <Categories type={selectedSection.id} />}
        </div>
      </div>
      <div></div>
    </div>
  );
}

export default Home;
