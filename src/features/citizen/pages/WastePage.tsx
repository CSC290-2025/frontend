import { useState } from 'react';
import Layout from '@/components/main/Layout';

import WasteHistoryCard from '../components/waste/WasteHistoryCard';
import WasteMonthlyCard from '../components/waste/WasteMonthlyCard';
import { WasteTabs } from '../components/waste/WasteTabs';
import type { TabKey } from '../components/waste/WasteTabs';
export default function WasteManagementPage() {
  const [tab, setTab] = useState<TabKey>('history');

  return (
    <Layout>
      <main className="min-h-screen bg-white px-6 py-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2B5991]">
              Waste Management
            </h1>
            <p className="text-lg text-black">
              View your waste statistics and daily history
            </p>
          </div>

          <WasteTabs value={tab} onChange={setTab} />

          <div className="mt-8">
            {tab === 'history' ? <WasteHistoryCard /> : <WasteMonthlyCard />}
          </div>
        </div>
      </main>
    </Layout>
  );
}
