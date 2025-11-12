import { Button } from '@/components/ui/button';
import { BusFront } from 'lucide-react';
import { TrafficCone } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { Wind } from 'lucide-react';
import { Trophy } from 'lucide-react';
import { Siren } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Header() {
  return (
    <div className="font-poppins mx-auto ml-60 w-full max-w-[1200px] px-4 pt-6 pb-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <BusFront className="h-6 w-6" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Transport</div>
            <div className="text-xs text-neutral-500">
              Bus timing and routes
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <TrafficCone className="h-6 w-8" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Traffics</div>
            <div className="text-xs text-neutral-500">
              Hospital & emergency services
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <MapPin className="h-6 w-6" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Nearby</div>
            <div className="text-xs text-neutral-500">
              Activities and volunteer
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <MessageCircle className="h-6 w-6" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Support Map</div>
            <div className="text-xs text-neutral-500">Reservation</div>
          </div>
        </button>
      </div>
      <div className="mt-5 ml-87 flex w-full justify-end">
        <div className="mb-2 flex w-full justify-end"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="mr-80 h-9 items-center gap-2 rounded-full border border-[#6FA8FF] bg-[#2749C9] px-4 text-white transition hover:bg-[#1f3db1]">
              Filter
              <ChevronDown className="h-4 w-4" strokeWidth={4} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-48 rounded-2xl bg-[#2749C9] p-3 text-white shadow-xl"
          >
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]">
              <BusFront className="h-6 w-6 text-white" strokeWidth={2} />
              <span className="text-base">Transportation</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]">
              <Wind className="h-6 w-6 text-white" strokeWidth={2} />
              <span className="text-base">Impure Air</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]">
              <TrafficCone className="h-6 w-6 text-white" strokeWidth={2} />
              <span className="text-base">Traffics</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]">
              <Trophy className="h-6 w-6 text-white" strokeWidth={2} />
              <span className="text-base">Events</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]">
              <Siren className="h-6 w-6 text-white" strokeWidth={2} />
              <span className="text-base">Emergency Request</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]">
              <TriangleAlert className="h-6 w-6 text-white" strokeWidth={2} />
              <span className="text-base">Danger Area</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
export default Header;
