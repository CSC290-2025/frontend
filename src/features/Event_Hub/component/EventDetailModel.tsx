import React, { useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Bookmark,
  Pencil,
  Trash2,
} from 'lucide-react';

interface Address {
  address_line?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postal_code?: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  imageUrl?: string;
  address: Address;
  addressDisplay: string;
  status: 'Ended' | 'Ongoing' | 'Available';
  event_tag: string;
  description?: string;
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
}

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  // Admin-specific props (Restored from previous step)
  isAdmin?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const getStatusClasses = (status: Event['status']) => {
  switch (status) {
    case 'Available':
      return {
        badge: 'bg-green-50 text-green-700 border-green-200',
        dot: 'bg-green-500',
      };
    case 'Ongoing':
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'Ended':
      return {
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
      };
    default:
      return {
        badge: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-500',
      };
  }
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  isBookmarked,
  onToggleBookmark,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen || !event) return null;

  const safeAddress = event.address ?? {};

  const statusClasses = getStatusClasses(event.status);
  const isEnded = event.status === 'Ended';

  const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      className="bg-opacity-50 fixed inset-0 z-50 overflow-y-auto bg-black transition-opacity duration-300"
      onClick={handleWrapperClick}
    >
      <div
        className={`mx-auto my-12 w-full max-w-4xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header Image and Close Button */}
          <div className="relative aspect-video w-full bg-gray-200">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={`Image for ${event.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <Calendar className="h-16 w-16" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900">
                  {event.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                    {event.event_tag}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${statusClasses.badge}`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${statusClasses.dot}`}
                    ></div>
                    {event.status}
                  </span>
                </div>
              </div>

              {/* Admin Actions (Edit and Delete) */}
              {isAdmin && event.id && onEdit && onDelete && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(event.id)}
                    className="rounded-lg p-2 text-cyan-500 transition-colors hover:bg-cyan-50"
                    aria-label="Edit event"
                    title="Edit Event"
                  >
                    <Pencil className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => onDelete(event.id)}
                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                    aria-label="Delete event"
                    title="Delete Event"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              )}
              {/* End Admin Actions */}
            </div>

            <p className="mb-8 leading-relaxed text-gray-600">
              {event.description ||
                'No detailed description provided for this event.'}
            </p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Event Details */}
              <div>
                <h3 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">
                  Event Schedule & Location
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-gray-700">
                    <Calendar className="h-6 w-6 flex-shrink-0 text-cyan-500" />
                    <span className="text-lg font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-700">
                    <Clock className="h-6 w-6 flex-shrink-0 text-cyan-500" />
                    <span className="text-lg font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-start gap-4 text-gray-700">
                    <MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-cyan-500" />
                    <span className="text-lg font-medium">
                      {event.addressDisplay}
                      {safeAddress.postal_code && (
                        <span className="block text-sm text-gray-500">
                          Postal Code: {safeAddress.postal_code}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organizer Info */}
              <div>
                <h3 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">
                  Organizer Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-gray-700">
                    <User className="h-6 w-6 flex-shrink-0 text-cyan-500" />
                    <span className="text-lg font-medium">
                      {event.organizerName || 'Not Specified'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-700">
                    <Mail className="h-6 w-6 flex-shrink-0 text-cyan-500" />
                    {event.organizerEmail ? (
                      <a
                        href={`mailto:${event.organizerEmail}`}
                        className="text-lg font-medium transition-colors hover:text-cyan-600"
                      >
                        {event.organizerEmail}
                      </a>
                    ) : (
                      <span className="text-lg font-medium">N/A</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-gray-700">
                    <Phone className="h-6 w-6 flex-shrink-0 text-cyan-500" />
                    {event.organizerPhone ? (
                      <a
                        href={`tel:${event.organizerPhone}`}
                        className="text-lg font-medium transition-colors hover:text-cyan-600"
                      >
                        {event.organizerPhone}
                      </a>
                    ) : (
                      <span className="text-lg font-medium">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with ONLY Bookmark Button */}
          <div className="sticky bottom-0 flex justify-center rounded-b-2xl border-t border-gray-200 bg-white p-6">
            {/* REMOVED: The second button (Register Now) was here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
