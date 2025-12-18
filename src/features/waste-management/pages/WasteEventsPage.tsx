import WasteEventsList from '../components/WasteEventsList';

export default function WasteEventsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">♻️ Waste Management Events</h1>
      <WasteEventsList />
    </div>
  );
}
