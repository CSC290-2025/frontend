import React, { useState } from 'react';
import Categories from '../components/Categories';
import { useUserRole } from '../hooks/useUserRole';

function Home() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const { role } = useUserRole();

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F9FaFB] p-7 md:justify-between lg:justify-between">
      <h1 className="my-5 text-center text-lg font-bold md:text-xl lg:text-2xl">
        Access your {role} Portal
      </h1>
      <div>
        <div
          className={`grid grid-cols-1 gap-4 ${
            role === 'admin'
              ? 'md:grid-cols-3 lg:grid-cols-4'
              : 'md:grid-cols-2 lg:grid-cols-2'
          } `}
        >
          <div
            className={`w-full cursor-pointer rounded-2xl border p-2 shadow-sm duration-300 hover:scale-103 ${
              openSection === 'summary'
                ? 'border-[#01CCFF]'
                : 'border-[#D9D9D9] bg-white'
            }`}
            onClick={() => toggleSection('summary')}
          >
            <h2 className="font-medium">Summary City Performance Dashboard</h2>
            <p className="text-left">
              Explore an overview of your city&apos;s key performance metric
              across essential services like traffic, healthcare, and weather
            </p>
          </div>
          <div
            className={`w-full cursor-pointer rounded-2xl border p-2 shadow-sm duration-300 hover:scale-103 ${openSection === 'trends' ? 'border-[#01CCFF]' : 'border-[#D9D9D9] bg-white'}`}
            onClick={() => toggleSection('trends')}
          >
            <h2 className="font-medium">Public Trends Report</h2>
            <p className="text-left">
              Dive deeper into long-term trends shaping your city - from
              population shifts to environmental changes and public health data.
            </p>
          </div>
          {role === 'admin' && (
            <div
              className={`w-full cursor-pointer rounded-2xl border p-2 shadow-sm duration-300 hover:scale-103 ${openSection === 'detailed' ? 'border-[#01CCFF]' : 'border-[#D9D9D9] bg-white'}`}
              onClick={() => toggleSection('detailed')}
            >
              <h2 className="font-medium">Detailed Operational Dashboards</h2>
              <p className="text-left">
                Dive into real-time operational data across essential services —
                including traffic flow, healthcare capacity, and weather
                conditions.
              </p>
            </div>
          )}
          {role === 'admin' && (
            <div
              className={`w-full cursor-pointer rounded-2xl border p-2 shadow-sm duration-300 hover:scale-103 ${openSection === 'planning' ? 'border-[#01CCFF]' : 'border-[#D9D9D9] bg-white'}`}
              onClick={() => toggleSection('planning')}
            >
              <h2 className="font-medium">Financial & Resource Planning</h2>
              <p className="text-left">
                Analyze city spending, budget allocation, and resource
                distribution to support strategic decision-making and long-term
                sustainability.
              </p>
            </div>
          )}
          {role === 'admin' && (
            <div
              className={`w-full cursor-pointer rounded-2xl border p-2 shadow-sm duration-300 hover:scale-103 md:col-span-2 lg:col-span-2 ${openSection === 'usage' ? 'border-[#01CCFF]' : 'border-[#D9D9D9] bg-white'}`}
              onClick={() => toggleSection('usage')}
            >
              <h2 className="font-medium">Report Usage Analysis</h2>
              <p className="text-left">
                Monitor and evaluate how key city resources are consumed — from
                utilities to public services — to improve efficiency and reduce
                waste.
              </p>
            </div>
          )}
          {role === 'admin' && (
            <div
              className={`w-full cursor-pointer rounded-2xl border p-2 shadow-sm duration-300 hover:scale-103 md:col-span-2 lg:col-span-2 ${openSection === 'data' ? 'border-[#01CCFF]' : 'border-[#D9D9D9] bg-white'}`}
              onClick={() => toggleSection('data')}
            >
              <h2 className="font-medium">Data Quality Dashboard</h2>
              <p className="text-left">
                Track the accuracy, completeness, and freshness of your city’s
                datasets to ensure reliable insights and confident
                decision-making.
              </p>
            </div>
          )}
        </div>

        <div
          className={`mt-5 transform transition-all duration-500 ${openSection ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
        >
          {openSection && <Categories type={openSection} />}
        </div>
      </div>
      <div></div>
    </div>
  );
}

export default Home;
