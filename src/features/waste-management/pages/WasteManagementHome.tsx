import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardPage } from '../pages/DashboardPage';
import { EventsPage } from '../pages/EventsPage';
import { FreeCyclePage } from '../pages/FreeCyclePage';

// Main App
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'events':
        return <EventsPage />;
      case 'transport':
        return <FreeCyclePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;
