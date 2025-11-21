import { Button } from '@/components/ui/button';
import { useNavigate } from '@/router';

const CATEGORY_CARDS = [
  {
    id: 'healthcare',
    title: 'Healthcare',
    description:
      'Monitor hospital capacity, vaccination progress, and wellness sentiment in real time.',
    accent: 'linear-gradient(135deg, #1ABFAE 0%, #01CCFF 100%)',
  },
  {
    id: 'weather',
    title: 'Weather',
    description:
      'Track severe weather alerts, historical climate data, and predictive modelling.',
    accent: 'linear-gradient(135deg, #2B5991 0%, #01CCFF 100%)',
  },
  {
    id: 'demographic',
    title: 'Demographic',
    description:
      'Understand population shifts, density, and household metrics to plan smarter services.',
    accent: 'linear-gradient(135deg, #96E0E1 0%, #2B5991 100%)',
  },
  {
    id: 'traffic',
    title: 'Traffic',
    description:
      'Visualise live congestion, commuting trends, and infrastructure bottlenecks.',
    accent: 'linear-gradient(135deg, #2B5991 0%, #0091B5 100%)',
  },
];

interface CategoriesProps {
  type: string;
}

function Categories({ type }: CategoriesProps) {
  const navigate = useNavigate();

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl border border-[#E2E8F0] bg-white p-6 text-left shadow-xl shadow-[#0D111D]/5">
      <div className="mb-6 flex flex-col gap-1 text-center md:text-left">
        <p className="text-xs font-bold tracking-[0.4em] text-[#2B5991]/70 uppercase">
          Categories
        </p>
        <h2 className="text-2xl font-black text-[#2B5991]">
          Dive into a focused dataset
        </h2>
        <p className="text-sm text-[#2B5991]/70">
          Choose a domain that best matches the insights you are seeking. We
          will tailor the dashboard experience to highlight the most relevant
          metrics for {type} reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CATEGORY_CARDS.map((card) => (
          <article
            key={card.id}
            className="flex flex-col justify-between rounded-2xl border border-[#2B5991]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white shadow-inner"
                style={{ background: card.accent }}
              >
                {card.title.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2B5991]">
                  {card.title}
                </h3>
                <p className="text-sm text-[#2B5991]/80">{card.description}</p>
              </div>
            </div>
            <Button
              onClick={() =>
                navigate('/power-bi/:type/:category', {
                  params: { type, category: card.id },
                })
              }
              className="mt-4 w-full cursor-pointer bg-[#01CCFF] font-semibold text-[#0F1B2F] hover:bg-[#0091B5] hover:text-white"
            >
              Explore {card.title}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Categories;
