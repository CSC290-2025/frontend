import { BellRing } from 'lucide-react';

function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white/30 px-6 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
      <h1 className="cursor-pointer">Emergency Report</h1>
      <BellRing size={'20'} className="cursor-pointer" />
    </header>
  );
}
export default Header;
