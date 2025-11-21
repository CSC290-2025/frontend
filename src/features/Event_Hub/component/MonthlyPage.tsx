import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Search, Tag } from 'lucide-react';

interface MonthlyPageProps {
  setActiveTab: (tab: string) => void;
}

const MonthlyPage: React.FC<MonthlyPageProps> = ({ setActiveTab }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const MAX_CALENDAR_SLOTS = 6 * 7;
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  while (calendarDays.length < MAX_CALENDAR_SLOTS) {
    calendarDays.push(null);
  }
  const today = new Date();
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Tabs and Search - (unchanged) */}
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
                    tab.toLowerCase() === 'monthly'
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

        {/* Monthly Calendar Header - (unchanged) */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">Monthly Calendar</h2>
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

        {/* Calendar Card */}
        <div className="rounded-2xl border-2 border-gray-800 bg-white p-8 shadow-lg">
          {/* Month/Year Header with Navigation - (unchanged) */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <button
              onClick={previousMonth}
              className="rounded-lg border-2 border-gray-800 bg-white p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h2 className="min-w-[200px] text-center text-2xl font-bold text-gray-800">
              {monthNames[month]} {year}
            </h2>

            <button
              onClick={nextMonth}
              className="rounded-lg border-2 border-gray-800 bg-white p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-6 overflow-hidden rounded-lg border-2 border-gray-800">
            {/* Days of Week Header - (unchanged) */}
            <div className="grid grid-cols-7 border-b-2 border-gray-800 bg-gray-100">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="border-r-2 border-gray-800 p-4 text-center font-bold text-gray-800 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days (Grid fixed to 6 rows) */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`relative h-[120px] border-b-2 border-gray-800 p-2 ${
                    index % 7 !== 6 ? 'border-r-2' : ''
                  } ${day ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50'} ${
                    index >= MAX_CALENDAR_SLOTS - 7 ? 'border-b-0' : ''
                  }`}
                >
                  {day && (
                    <>
                      {/* Date Number and Hover Effect - (unchanged) */}
                      <div
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-semibold text-gray-800 transition-colors hover:bg-green-400 hover:text-white`}
                      >
                        {day}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Navigation - (unchanged) */}
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(today.getFullYear(), today.getMonth(), 1)
                )
              }
              className="rounded-lg border-2 border-gray-800 bg-white px-6 py-2 font-bold text-gray-800 transition-colors hover:bg-gray-50"
            >
              Current Month
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg border-2 border-gray-800 bg-white px-6 py-2 font-bold text-gray-800 transition-colors hover:bg-gray-50"
            >
              Next Month →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPage;
