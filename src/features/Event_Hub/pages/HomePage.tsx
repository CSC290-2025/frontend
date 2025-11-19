import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Search,
  Filter,
  BookmarkMinus,
  Building2,
  BusFront,
  Cloud,
  Hospital,
  BookMarked,
  Phone,
  Tv,
  Handshake,
  Trash2,
  Home,
} from 'lucide-react';
import EventDetailModal from '@/features/Event_Hub/component/EventDetailModel';
import Sidebar from '@/features/Event_Hub/component/Sidebar';
import TopBar from '@/features/Event_Hub/component/Topbar';
import HistoryPage from '@/features/Event_Hub/component/HistoryPage';
import ContactPage from '@/features/Event_Hub/component/ContactPage';
import MonthlyPage from '@/features/Event_Hub/component/MonthlyPage';

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

const HomePage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedCategory, setSelectedCategory] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedEvents, setBookmarkedEvents] = useState(new Set<number>());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const events: Event[] = [
    {
      id: 1,
      title: 'Big cleaning',
      date: '24 Sep 2025',
      time: '11:50 - 17:00',
      location: 'KMUTT',
      status: 'Available',
      category: 'volunteer',
      description:
        'Join us for a big cleaning event at KMUTT campus. Help make our university cleaner and more beautiful!',
      organizerName: 'KMUTT Environmental Club',
      organizerEmail: 'env.club@kmutt.ac.th',
      organizerPhone: '+66 2-470-8000',
    },
    {
      id: 2,
      title: 'Big cleaning',
      date: '24 Sep 2025',
      time: '11:50 - 17:00',
      location: 'KMUTT',
      status: 'Available',
      category: 'volunteer',
    },
    {
      id: 3,
      title: 'Beach cleanup',
      date: '28 Sep 2025',
      time: '08:00 - 12:00',
      location: 'Pattaya Beach',
      status: 'Available',
      category: 'volunteer',
      description:
        'Help us clean up Pattaya Beach and protect our marine life. All materials will be provided.',
      organizerName: 'Ocean Conservation Thailand',
      organizerEmail: 'info@oceanconservation.th',
      organizerPhone: '+66 38-123-456',
    },
    {
      id: 4,
      title: 'Tree planting',
      date: '30 Sep 2025',
      time: '09:00 - 15:00',
      location: 'City Park',
      status: 'Available',
      category: 'volunteer',
      description:
        'Plant trees and contribute to a greener city. Free lunch and refreshments provided.',
      organizerName: 'Green City Initiative',
      organizerEmail: 'contact@greencity.org',
      organizerPhone: '+66 2-555-1234',
    },
    {
      id: 5,
      title: 'Food donation drive',
      date: '05 Oct 2025',
      time: '10:00 - 16:00',
      location: 'Community Center',
      status: 'Available',
      category: 'volunteer',
    },
    {
      id: 6,
      title: 'Street art festival',
      date: '12 Oct 2025',
      time: '14:00 - 20:00',
      location: 'Downtown',
      status: 'Available',
      category: 'events',
      description:
        'Experience amazing street art performances and exhibitions. Fun for the whole family!',
      organizerName: 'Bangkok Arts Council',
      organizerEmail: 'info@bangkokartscouncil.com',
      organizerPhone: '+66 2-789-4567',
    },
  ];

  const categories = [
    {
      id: 'dashboard',
      icon: Building2,
      label: 'City Insights',
      subtitle: 'Dashboard and quick service',
    },
    {
      id: 'transport',
      icon: BusFront,
      label: 'Transport',
      subtitle: 'Bus timing and routes',
    },
    {
      id: 'events',
      icon: Calendar,
      label: 'Events',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'weather',
      icon: Cloud,
      label: 'Weather reports',
      subtitle: 'Forecast & Air Quality',
    },
    {
      id: 'healthcare',
      icon: Hospital,
      label: 'Healthcare',
      subtitle: 'Hospital & Emergency services',
    },
    {
      id: 'ai',
      icon: BookMarked,
      label: 'Know Ai',
      subtitle: 'Learning with ai',
    },
    {
      id: 'contact',
      icon: Phone,
      label: 'Contact us',
      subtitle: 'Report issues',
    },
  ];

  const topCategories = [
    {
      id: 'events',
      icon: Calendar,
      label: 'Events',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'cycle',
      icon: Tv,
      label: 'Free cycle',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'volunteer',
      icon: Handshake,
      label: 'Volunteer',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'waste',
      icon: Trash2,
      label: 'Waste Management',
      subtitle: 'Activities and volunteer',
    },
  ];

  const toggleBookmark = (id: number) => {
    setBookmarkedEvents((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handleOpenModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* TopBar Component */}
        <TopBar topCategories={topCategories} />

        {/* Content Area */}
        {activeTab === 'history' ? (
          <HistoryPage setActiveTab={setActiveTab} />
        ) : activeTab === 'contact' ? (
          <ContactPage setActiveTab={setActiveTab} />
        ) : activeTab === 'monthly' ? (
          <MonthlyPage setActiveTab={setActiveTab} />
        ) : (
          <div className="mx-auto max-w-7xl p-6">
            {/* Tabs and Search */}
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                {['Events', 'History', 'Contact', 'Monthly', 'Bookmark'].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`rounded-full px-6 py-2.5 font-medium transition-colors ${
                        activeTab === tab.toLowerCase()
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

            {/* Events Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">Events</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-white transition-colors hover:bg-cyan-600">
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Create</span>
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 transition-colors hover:bg-gray-50">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Filter</span>
                </button>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-xl font-bold text-gray-800">
                        {event.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        {event.status}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleBookmark(event.id)}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <BookmarkMinus
                        className={`h-5 w-5 ${bookmarkedEvents.has(event.id) ? 'fill-cyan-500 text-cyan-500' : 'text-gray-400'}`}
                      />
                    </button>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span className="font-medium">{event.location}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(event)}
                    className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600"
                  >
                    More Details
                  </button>
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="text-lg text-gray-500">No events found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        isBookmarked={
          selectedEvent ? bookmarkedEvents.has(selectedEvent.id) : false
        }
        onToggleBookmark={() =>
          selectedEvent && toggleBookmark(selectedEvent.id)
        }
      />
    </div>
  );
};

export default HomePage;
