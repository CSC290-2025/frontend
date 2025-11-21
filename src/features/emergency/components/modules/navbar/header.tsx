import { BellRing } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/emergency/components/ui/dropdown-menu.tsx';
import { useNavigate } from 'react-router';
import { useNotification } from '@/features/emergency/hooks/notification.tsx';

function Header() {
  const { msgLocal } = useNotification();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white/30 px-6 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
      <h1
        className="cursor-pointer scroll-m-20 text-2xl font-semibold tracking-tight"
        onClick={() => navigate('/sos')}
      >
        Emergency Report
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <BellRing size={20} className="cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-100 mt-3">
          <DropdownMenuLabel>Report Incident</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {msgLocal.map((msg, index) => (
            <DropdownMenuItem key={index}>
              {msg.title}
              {msg.body}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem>View all..</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
export default Header;
