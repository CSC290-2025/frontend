import { useParams, useNavigate } from '@/router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { CurrentDataCard } from '@/features/clean-air/components/CurrentDataCard';
import { CurrentAqiCard } from '@/features/clean-air/components/CurrentAqiCard';
import { Pm25GuideModal } from '@/features/clean-air/components/Pm25GuideModal';
import { HealthTips } from '../components/HealthTips';

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
    <div className="min-h-screen bg-gray-50">
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

      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
        <CurrentAqiCard onDocumentationClick={openModal} />
        <CurrentDataCard />
        <HealthTips />
      </div>

      <Pm25GuideModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
