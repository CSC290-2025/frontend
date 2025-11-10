import { useState } from 'react';
import { Search, Plus, Filter, Bookmark } from 'lucide-react';
import { Header } from '../components/Header';
import { PageWrapper } from '../components/PageWrapper';
import { useEvents } from '../hooks/useEvents';

interface EventsPageProps {
  onNavigate: (page: string) => void;
}

export default function EventsPage({ onNavigate }: EventsPageProps) {
  const { events, loading } = useEvents();
  const [activeTab, setActiveTab] = useState('Events');

  return (
    <PageWrapper>
      <Header onNavigate={onNavigate} />

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search for items"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-10"
        />
        <Search className="absolute top-3.5 left-3 text-gray-400" size={20} />
      </div>

      <div className="mb-6 flex gap-4">
        {['Events', 'History', 'Contact', 'Monthly', 'Book mark'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-6 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'bg-cyan-400 text-white'
                : 'border border-cyan-400 bg-white text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Events</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-cyan-400 px-6 py-2 text-white hover:bg-cyan-500">
            <Plus size={20} />
            create
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{event.title}</h3>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                    {event.status}
                  </span>
                </div>
                <Bookmark
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                  size={20}
                />
              </div>

              <div className="mb-6 space-y-2 text-sm">
                <p>
                  <span className="font-medium">Date:</span> {event.date}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {event.time}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{' '}
                  {event.location}
                </p>
              </div>

              <button className="w-full rounded-lg bg-cyan-400 py-2 text-white hover:bg-cyan-500">
                More Details
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
