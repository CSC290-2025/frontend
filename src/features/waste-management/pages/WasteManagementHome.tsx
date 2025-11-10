// --- src/App.tsx ---
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import DashboardPage from '../pages/DashboardPage';
import FreeCyclePage from '../pages/FreeCyclePage';
import EventsPage from '../pages/EventsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'freecycle':
        return <FreeCyclePage onNavigate={setCurrentPage} />;
      case 'events':
        return <EventsPage onNavigate={setCurrentPage} />;

      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="ml-60 w-[calc(100%-15rem)]">{renderPage()}</main>
    </div>
  );
}
