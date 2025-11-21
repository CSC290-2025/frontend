import { useParams, useNavigate } from '@/router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import CurrentDataCard from '@/features/clean-air/components/CurrentDataCard';
import CurrentAqiCard from '@/features/clean-air/components/CurrentAqiCard';
import Pm25GuideModal from '@/features/clean-air/components/Pm25GuideModal';
import HealthTips from '@/features/clean-air/components/HealthTips';
import Summary from '@/features/clean-air/components/Summary';
import HistoricalTable from '@/features/clean-air/components/HistoricalTable';

export function DistrictDetailPage() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/clean-air/district-selection');
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="w-full border-b border-gray-700 bg-gray-600 py-4 shadow-md">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
            >
              <ArrowLeft size={20} />
              Back
            </button>

            <h1 className="text-xl font-bold text-white uppercase">
              CLEAN AIR MONITOR
            </h1>

            <div className="w-16"></div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-8">
        <div className="pt-4 text-3xl font-bold">Air Quality</div>
        <CurrentAqiCard onDocumentationClick={openModal} />
        <CurrentDataCard />
        <div className="flex space-x-6">
          <div className="w-2/3">
            <Summary />
          </div>

          <div className="w-1/3">
            <HealthTips />
          </div>
        </div>

        <HistoricalTable />
      </div>

      <Pm25GuideModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
