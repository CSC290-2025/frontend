import { useState } from 'react';
import { useWasteEvents } from '../hooks/useWasteEvents';
import { Calendar, Clock, MapPin } from 'lucide-react';
import WasteEventDetail from './WasteEventDetail';

export default function WasteEventsList() {
  const { data: events, isLoading, error } = useWasteEvents();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMoreDetails = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading events</p>;
  if (!events || events.length === 0) {
    return <p>No waste events found</p>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })} - ${end.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })}`;
  };

  const getLocation = (addresses: any) => {
    if (!addresses || !addresses.address_line) {
      return 'Location TBD';
    }
    return addresses.address_line;
  };

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event: any) => (
          <div
            key={event.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="p-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {capitalizeWords(event.title)}
              </h3>

              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-sm font-medium text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Available
                </span>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(event.start_at)}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>{formatTime(event.start_at, event.end_at)}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{getLocation(event.addresses)}</span>
                </div>
              </div>

              <button
                onClick={() => handleMoreDetails(event)}
                className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-medium text-white transition-colors hover:bg-cyan-500"
              >
                More Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <WasteEventDetail
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
