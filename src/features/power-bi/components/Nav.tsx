import { Button } from '@/components/ui/button';
import { useNavigate } from '@/router';
import { useUserRole } from '../hooks/useUserRole';

function Nav() {
  // const user = {
  //   name: 'Alora',
  //   role: 'admin',
  // };
  const { role } = useUserRole();
  const navigate = useNavigate();

  return (
    <header className="w-full rounded-3xl border border-[#E2E8F0] bg-white px-6 py-5 text-[#1B1F3B] shadow-xl shadow-[#0D111D]/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.4em] text-[#2B5991]/60 uppercase">
            Power BI Portal
          </p>
          <h1 className="text-2xl leading-tight font-black sm:text-3xl">
            Access your {role} portal
          </h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            Curated dashboards, insights, and reports designed for your role in
            the city intelligence ecosystem.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => navigate('/power-bi')}
            variant="outline"
            className="cursor-pointer border-[#2B5991] text-[#2B5991] hover:bg-[#2B599115]"
          >
            Home
          </Button>

          {role === 'admin' && (
            <Button
              onClick={() => navigate('/power-bi/create')}
              className="cursor-pointer border-0 bg-[#01CCFF] px-6 font-semibold text-white transition hover:bg-[#09B2E0]"
            >
              + New Report
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Nav;
