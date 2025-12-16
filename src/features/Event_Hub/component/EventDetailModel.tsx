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
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  category: string;
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
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  isBookmarked,
  onToggleBookmark,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus on close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab as any);
    return () => modal.removeEventListener('keydown', handleTab as any);
  }, [isOpen]);

  if (!isOpen || !event) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          ref={modalRef}
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white p-6">
            <div>
              <p className="mb-1 text-sm text-gray-500">Event Information</p>
              <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
                {event.title}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>
              <div className="min-h-[100px] rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="leading-relaxed text-gray-700">
                  {event.description ||
                    'Join us for this amazing event! This is a great opportunity to contribute to our community and make a positive impact. All volunteers are welcome, and no prior experience is necessary. We will provide all the necessary equipment and guidance.'}
                </p>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Date
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                  <Calendar
                    className="h-5 w-5 text-cyan-600"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-gray-800">
                    {event.date}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Time
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                  <Clock className="h-5 w-5 text-cyan-600" aria-hidden="true" />
                  <span className="font-medium text-gray-800">
                    {event.time}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Location
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                  <MapPin
                    className="h-5 w-5 text-cyan-600"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-gray-800">
                    {event.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Organizer Information */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Organizer Information
              </label>
              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-500">Organizer name</p>
                    <p className="font-medium text-gray-800">
                      {event.organizerName || 'City Volunteer Organization'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a
                      href={`mailto:${event.organizerEmail || 'contact@cityvolunteer.org'}`}
                      className="font-medium text-cyan-600 hover:text-cyan-700 hover:underline"
                    >
                      {event.organizerEmail || 'contact@cityvolunteer.org'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-500">Phone number</p>
                    <a
                      href={`tel:${event.organizerPhone || '+6621234567'}`}
                      className="font-medium text-cyan-600 hover:text-cyan-700 hover:underline"
                    >
                      {event.organizerPhone || '+66 2-123-4567'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Status
              </label>
              <span className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                <div
                  className="h-2 w-2 rounded-full bg-green-500"
                  aria-hidden="true"
                ></div>
                {event.status}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex gap-3 rounded-b-2xl border-t border-gray-200 bg-white p-6">
            <button
              onClick={onToggleBookmark}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${
                isBookmarked
                  ? 'border-2 border-cyan-600 bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                  : 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark
                className={`h-5 w-5 ${isBookmarked ? 'fill-cyan-600' : ''}`}
                aria-hidden="true"
              />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            <button className="flex-1 rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white transition-colors hover:bg-cyan-600">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetailModal;
