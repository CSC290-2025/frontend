import { useNavigate } from 'react-router';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';

function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white/30 px-6 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
      <h1
        className="cursor-pointer scroll-m-20 text-2xl font-semibold tracking-tight"
        onClick={() => navigate('/sos')}
      >
        Emergency Report
      </h1>
      <SidebarTrigger />
    </header>
  );
}
export default Header;
