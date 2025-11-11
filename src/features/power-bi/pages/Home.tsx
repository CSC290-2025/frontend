import React, { useState } from 'react';
import Categories from '../components/Categories';

function Home() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-7">
      <h1 className="my-5 text-center text-xl font-bold">
        Access your Citizen Portal
      </h1>
      <div className="flex items-center justify-around gap-5 text-center">
        <div onClick={() => toggleSection('summary')}>
          <h2 className="font-medium">Summary City Performance Dashboard</h2>
          <p className="text-left">
            Explore an overview of your city&apos;s key performance metric
            across essential services like traffic, healthcare, and weather
          </p>
        </div>
        <div onClick={() => toggleSection('trends')}>
          <h2 className="font-medium">Public Trends Report</h2>
          <p className="text-left">
            Dive deeper into long-term trends shaping your city - from
            population shifts to environmental changes and public health data.
          </p>
        </div>
      </div>

      <div
        className={`mt-5 transform transition-all duration-500 ${openSection ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
      >
        {openSection && <Categories type={openSection} />}
      </div>
    </div>
  );
}

export default Home;
