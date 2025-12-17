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
import { HeartPlus } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Header() {
  return (
    <div className="font-poppins mx-auto w-full max-w-[1200px] px-5 pt-6 pb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <BusFront className="h-6 w-6" />
          <div className="leading-tight">
            <div className="text-sm font-semibold md:text-base">Transport</div>
            <div className="text-xs text-neutral-500 md:text-sm">
              Bus timing and routes
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <TrafficCone className="h-6 w-8" />
          <div className="leading-tight">
            <div className="text-sm font-semibold md:text-base">Traffics</div>
            <div className="text-xs text-neutral-500 md:text-sm">
              Hospital &amp; emergency services
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <MapPin className="h-6 w-6" />
          <div className="leading-tight">
            <div className="text-sm font-semibold md:text-base">Nearby</div>
            <div className="text-xs text-neutral-500 md:text-sm">
              Activities and volunteer
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <MessageCircle className="h-6 w-6" />
          <div className="leading-tight">
            <div className="text-sm font-semibold md:text-base">
              Support Map
            </div>
            <div className="text-xs text-neutral-500 md:text-sm">
              Reservation
            </div>
          </div>
        </button>
      </div>

      <div className="mt-5 flex w-full justify-center md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-9 items-center gap-2 rounded-full border border-[#6FA8FF] bg-[#2749C9] px-4 text-white transition hover:bg-[#1f3db1]">
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

      <div className="mt-5 hidden w-full justify-end md:flex lg:mr-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-9 items-center gap-2 rounded-full border border-[#6FA8FF] bg-[#2749C9] px-4 text-white transition hover:bg-[#1f3db1]">
              Filter
              <ChevronDown className="h-4 w-4" strokeWidth={4} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-54 rounded-2xl bg-[#2749C9] p-3 text-white shadow-xl"
          >
            <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black">
              <Wind
                className="h-6 w-6 text-white group-hover:text-black"
                strokeWidth={2}
              />
              <span className="text-base group-hover:text-black">
                Impure Air
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black">
              <TrafficCone
                className="h-6 w-6 text-white group-hover:text-black"
                strokeWidth={2}
              />
              <span className="text-base group-hover:text-black">Traffics</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black">
              <Trophy
                className="h-6 w-6 text-white group-hover:text-black"
                strokeWidth={2}
              />
              <span className="text-base group-hover:text-black">Events</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black">
              <Siren
                className="h-6 w-6 text-white group-hover:text-black"
                strokeWidth={2}
              />
              <span className="text-base group-hover:text-black">
                Emergency Request
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black">
              <TriangleAlert
                className="h-6 w-6 text-white group-hover:text-black"
                strokeWidth={2}
              />
              <span className="text-base group-hover:text-black">
                Danger Area
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black">
              <HeartPlus
                className="h-6 w-6 text-white group-hover:text-black"
                strokeWidth={2}
              />
              <span className="text-base group-hover:text-black">
                Injured Area
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black">
              <Trash2
                className="h-6 w-6 text-white group-hover:text-black"
                strokeWidth={2}
              />
              <span className="text-base group-hover:text-black">
                Trash Area
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
export default Header;
