import { X, Calendar, Clock, MapPin, User, Mail, Phone } from 'lucide-react';
import { useEffect } from 'react';

interface WasteEventDetailProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function WasteEventDetail({
  event,
  isOpen,
  onClose,
}: WasteEventDetailProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 border-b border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Event Information</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {capitalizeWords(event.title)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Description
            </h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-gray-900">{event.description}</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Date</h3>
              <div className="flex items-center gap-3 rounded-lg bg-cyan-50 p-4">
                <Calendar className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-900">
                  {formatDate(event.start_at)}
                </span>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Time</h3>
              <div className="flex items-center gap-3 rounded-lg bg-cyan-50 p-4">
                <Clock className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-900">
                  {formatTime(event.start_at, event.end_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Location</h3>
            <div className="flex items-center gap-3 rounded-lg bg-cyan-50 p-4">
              <MapPin className="h-5 w-5 text-cyan-600" />
              <span className="text-gray-900">
                {getLocation(event.addresses)}
              </span>
            </div>
          </div>

          {/* Organizer Information */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Organizer Information
            </h3>
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Organizer name</p>
                  <p className="font-medium text-gray-900">
                    {event.event_organization?.name || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900">
                    {event.event_organization?.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone number</p>
                  <p className="text-gray-900">
                    {event.event_organization?.phone_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Status</h3>
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
