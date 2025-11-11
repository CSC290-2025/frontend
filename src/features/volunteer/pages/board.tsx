import React, { useState } from 'react';
import { Search, Filter, Calendar, Bus, Cloud, Heart, Building, Bike, Users, Recycle, Settings, Wallet, User, LogOut } from 'lucide-react';

export default function CityVolunteerHomepage() {
  const [activeSection, setActiveSection] = useState('Events');

  const categories = [
    { icon: Calendar, title: 'Events', subtitle: 'Activities and volunteer' },
    { icon: Bike, title: 'Free cycle', subtitle: 'Activities and volunteer' },
    { icon: Users, title: 'Volunteer', subtitle: 'Activities and volunteer' },
    { icon: Recycle, title: 'Waste Management', subtitle: 'Activities and volunteer' }
  ];

  const sidebarItems = [
    { icon: Building, title: 'City Insights', subtitle: 'Dashboard and quick service', section: 'City Insights' },
    { icon: Bus, title: 'Transport', subtitle: 'Bus timing and routes', section: 'Transport' },
    { icon: Calendar, title: 'Events', subtitle: 'Activities and volunteer', section: 'Events' },
    { icon: Cloud, title: 'Weather reports', subtitle: 'Forecast & Air Quality', section: 'Weather' },
    { icon: Heart, title: 'Healthcare', subtitle: 'Hospital & Emergency services', section: 'Healthcare' },
    { icon: Brain, title: 'Know AI', subtitle: 'Learning with AI', section: 'AI' },
    { icon: Users, title: 'Contact us', subtitle: 'report issues', section: 'Contact' },
    { icon: User, title: 'Profile', subtitle: '', section: 'Profile' }
  ];

  const volunteerJobs = Array(8).fill({
    title: 'Teaching',
    date: '14 Sep 2025',
    participated: '47/55'
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">City Portal</h1>
        </div>
        
        <nav className="flex-1 px-3">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveSection(item.section)}
              className={`w-full flex items-start p-3 mb-2 rounded-lg transition-colors ${
                activeSection === item.section ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mt-0.5 mr-3 text-gray-600" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">{item.title}</div>
                {item.subtitle && (
                  <div className="text-xs text-gray-500">{item.subtitle}</div>
                )}
              </div>
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-2">
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50">
            <Settings className="w-5 h-5 mr-3 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Setting</span>
          </button>
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50">
            <Wallet className="w-5 h-5 mr-3 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">E-wallet</span>
          </button>
          <button className="w-full flex items-center justify-center p-3 rounded-lg bg-blue-400 text-white hover:bg-blue-500">
            <LogOut className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Category Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <category.icon className="w-8 h-8 mb-3 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-500">{category.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for volunteer works"
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button className="px-6 py-3 rounded-full border border-blue-400 text-blue-400 flex items-center gap-2 hover:bg-blue-50">
              <Filter className="w-5 h-5" />
              <span>Fillter</span>
            </button>
          </div>

          {/* Volunteer Jobs Section */}
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Volunteer Jobs</h2>

          <div className="grid grid-cols-4 gap-6">
            {volunteerJobs.map((job, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-40 flex items-center justify-center">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((person) => (
                      <div
                        key={person}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-purple-300"
                      />
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">{job.date}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Participated {job.participated}
                  </p>
                  <button className="w-full py-2 rounded-full bg-lime-400 text-gray-800 font-medium hover:bg-lime-500 transition-colors">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Brain(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}