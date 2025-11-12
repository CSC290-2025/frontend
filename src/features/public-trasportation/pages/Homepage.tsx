import React from 'react';
import Sidebar from '../components/Sidebar';
import BusInfo from '../components/BusInfo';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      <Sidebar active="Transport" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Tabs */}
        <div className="mb-6 flex items-center space-x-4">
          {['Transport', 'Traffics', 'Nearby', 'Support Map'].map((tab, i) => (
            <button
              key={i}
              className={`rounded-xl border px-6 py-2 text-sm font-medium ${
                i === 0
                  ? 'border-sky-500 bg-sky-500 text-white'
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for your destination"
            className="w-1/2 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Map + Bus Info */}
        <div className="flex gap-6">
          {/* Map */}
          <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200">
            <img
              src="/map-placeholder.png"
              alt="map"
              className="h-[500px] w-full object-cover"
            />
            <select className="absolute top-4 right-4 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
              <option>Bus Station</option>
              <option>BTS Station</option>
              <option>MRT Station</option>
            </select>
          </div>

          {/* Bus Info Panel */}
          <div className="max-h-[500px] w-80 space-y-3 overflow-y-auto rounded-2xl bg-blue-700 p-4 text-white">
            <BusInfo
              route="75 / 4-13"
              from="Putthabucha"
              to="Hualumphong"
              gpsAvailable
              stops={[
                'Khajonrot School',
                'Soi Pracha-Utid 40',
                'Opposite of Wat Klang Na',
                'Soi Pracha-Utid 18',
              ]}
            />
            <BusInfo
              route="21E / 4-7E"
              from="Wattnukasing"
              to="Chulalongkorn"
              gpsAvailable={false}
              stops={[
                'Wat Thong Sala Ngam',
                'Charoenkrung 77',
                'ICONSIAM',
                'Chulalongkorn Soi 9',
              ]}
            />
            <BusInfo
              route="88 / 4-17"
              from="KMUTT"
              to="Mahanhak"
              gpsAvailable
              stops={[
                'KMUTT Gate',
                'Big C Dao Khanong',
                'Bangkok Yai Hospital',
                'Mahanak Market',
              ]}
            />
            <BusInfo
              route="Mini Truck 99"
              from="KMUTT"
              to="Bangpakok"
              gpsAvailable={false}
              stops={[
                'KMUTT',
                'Rama 2 Soi 40',
                'Bangmod Hospital',
                'Bangpakok Market',
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
