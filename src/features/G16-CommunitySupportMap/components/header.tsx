import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Header() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <span className="h-6 w-6 rounded-full border border-neutral-300" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Transport</div>
            <div className="text-xs text-neutral-500">
              Bus timing and routes
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <span className="h-6 w-6 rounded-full border border-neutral-300" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Traffics</div>
            <div className="text-xs text-neutral-500">
              Hospital & emergency services
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <span className="h-6 w-6 rounded-full border border-neutral-300" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Nearby</div>
            <div className="text-xs text-neutral-500">
              Activities and volunteer
            </div>
          </div>
        </button>

        <button className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm">
          <span className="h-6 w-6 rounded-full border border-neutral-300" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Support Map</div>
            <div className="text-xs text-neutral-500">Reservation</div>
          </div>
        </button>
      </div>
      <div className="mt-3 flex w-full justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Billing
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Keyboard shortcuts
                <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Email</DropdownMenuItem>
                    <DropdownMenuItem>Message</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>More...</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem>
                New Team
                <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>GitHub</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuItem disabled>API</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
export default Header;
