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
      <div className="flex w-full justify-end">
        <button
          type="button"
          className="mt-3 justify-end self-start rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:shadow-sm md:self-auto"
          title="Filter"
        >
          Filter
        </button>
      </div>
    </div>
  );
}
export default Header;
