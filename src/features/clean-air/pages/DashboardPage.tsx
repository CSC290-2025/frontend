import React, { useState } from 'react';
import { CurrentAqiCard } from '@/features/clean-air/components/CurrentAqiCard';
import { HealthTips } from '@/features/clean-air/components/HealthTips';
import { PollutantsCard } from '@/features/clean-air/components/PollutantsCard';
import { HistoricalTable } from '@/features/clean-air/components/HistoricalTable';
import { Summary } from '@/features/clean-air/components/Summary';
import Pm25GuideModal from '@/features/clean-air/components/Pm25GuideModal';

export function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="w-full border-b border-gray-700 bg-gray-600 py-4 text-center shadow-md">
        <h1 className="text-xl font-bold text-white uppercase">
          CLEAN AIR MONITOR
        </h1>
      </header>
      <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-8">
        <CurrentAqiCard onDocumentationClick={openModal} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Summary />
          </div>
          <HealthTips />
        </div>

        <PollutantsCard />
        <HistoricalTable />
      </div>
      <Pm25GuideModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
