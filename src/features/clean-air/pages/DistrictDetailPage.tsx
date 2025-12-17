import { useParams, useNavigate } from '@/router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import CurrentDataCard from '@/features/clean-air/components/CurrentDataCard';
import CurrentAqiCard from '@/features/clean-air/components/CurrentAqiCard';
import Pm25GuideModal from '@/features/clean-air/components/Pm25GuideModal';
import HealthTips from '@/features/clean-air/components/HealthTips';
import Summary from '@/features/clean-air/components/Summary';
import HistoricalTable from '@/features/clean-air/components/HistoricalTable';
import Layout from '@/components/main/Layout';

export function DistrictDetailPage() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const navigate = useNavigate();
  const displayDistrict = district
    ? decodeURIComponent(district)
    : 'Loading Area';

  const handleBackClick = () => {
    navigate('/clean-air/district-selection');
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (!district) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 text-gray-900">
        <div className="text-xl font-semibold text-red-600">
          Error: District parameter not found.
        </div>
        <button
          onClick={handleBackClick}
          className="mt-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:opacity-80"
        >
          <ArrowLeft size={20} /> Go back to District Selection
        </button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex max-w-6xl flex-col space-y-6 px-9 py-6 sm:py-10 lg:space-y-5 lg:px-[100px]">
          <div className="text-3xl font-bold tracking-tight text-gray-800">
            Air Quality
          </div>
          <div className="w-full">
            <CurrentAqiCard onDocumentationClick={openModal} />
          </div>
          <div className="w-full">
            <CurrentDataCard />
          </div>
          <div className="flex min-h-[300px] flex-col gap-6 md:flex-row lg:gap-5">
            <div className="flex w-full md:w-2/3">
              <Summary />
            </div>
            <div className="flex w-full md:w-1/3">
              <HealthTips />
            </div>
          </div>
          <div className="w-full pt-4">
            <HistoricalTable />
          </div>
        </div>
        <Pm25GuideModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </Layout>
  );
}
