import React, { useState } from 'react';
import { Plus, Tag, Search, Calendar } from 'lucide-react';

interface ContactPageProps {
  setActiveTab: (tab: string) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    adminEmail: '',
    eventTitle: '',
    description: '',
    date: '',
    timeStart: '',
    timeEnd: '',
    location: '',
    organizerName: '',
    organizerEmail: '',
    organizerNumber: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePublish = () => {
    console.log('Publishing event:', formData);
    // Handle publish logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Tabs and Search - Matching HomePage */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {['Events', 'History', 'Contact', 'Monthly', 'Bookmark'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab.toLowerCase().replace(' ', ''))
                  }
                  className={`rounded-full px-6 py-2.5 font-medium transition-colors ${
                    tab.toLowerCase() === 'contact'
                      ? 'bg-cyan-500 text-white'
                      : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for items"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">Contact</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-white transition-colors hover:bg-cyan-600">
              <Plus className="h-5 w-5" />
              <span className="font-medium">Create</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 transition-colors hover:bg-gray-50">
              <Tag className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filter</span>
            </button>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {/* Admin Email Section */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Admin email:
                <span className="ml-2 text-sm font-normal text-gray-500">
                  for contact
                </span>
              </label>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="admin@example.com"
              />
              <p className="mt-2 text-sm text-gray-500">
                Example what need to send in email for event to be post in here
              </p>
            </div>

            {/* Event Title */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                name="eventTitle"
                value={formData.eventTitle}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="name of event"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="detail of event"
              />
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="dd/mm/yyyy"
              />
            </div>

            {/* Time */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Time
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  name="timeStart"
                  value={formData.timeStart}
                  onChange={handleInputChange}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  name="timeEnd"
                  value={formData.timeEnd}
                  onChange={handleInputChange}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="location of event"
              />
            </div>

            {/* Organizer Name */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Organizer Name
              </label>
              <input
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="name of Organizer"
              />
            </div>

            {/* Organizer Email */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Organizer Email
              </label>
              <input
                type="email"
                name="organizerEmail"
                value={formData.organizerEmail}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="email of Organizer"
              />
            </div>

            {/* Organizer Number */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Organizer Number
              </label>
              <input
                type="tel"
                name="organizerNumber"
                value={formData.organizerNumber}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="number of Organizer"
              />
            </div>

            {/* Publish Button and Note */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <button
                onClick={handlePublish}
                className="rounded-lg bg-cyan-500 px-8 py-3 font-medium text-white transition-colors hover:bg-cyan-600"
              >
                Publish Event
              </button>
              <p className="text-sm text-gray-500">send via admin email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
