import Layout from '@/components/main/Layout';

import WasteHistoryCard from '../components/waste/WasteHistoryCard';
import WasteMonthlyCard from '../components/waste/WasteMonthlyCard';

export default function WasteManagementPage() {
  return (
    <Layout>
      <main className="min-h-screen bg-[#F5F7FB] px-4 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-3xl bg-white p-8 shadow-2xl md:p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#2B5991]">
                Waste Management
              </h1>
              <p className="mt-2 text-base text-gray-600">
                View your waste statistics and daily history
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <WasteHistoryCard />
              <WasteMonthlyCard />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
