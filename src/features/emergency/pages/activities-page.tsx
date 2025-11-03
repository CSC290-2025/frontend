import { useNavigate } from '@/router.ts';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/features/emergency/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/emergency/components/ui/tabs';

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>(
    'ongoing'
  );
  const [reportType, setReportType] = useState<'quick' | 'detailed'>('quick');

  return (
    <div>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Clock size={32} />
          <h1 className="text-3xl font-bold">Activities</h1>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex border-b border-gray-200">
          <button
            className={`border-b-4 px-6 py-2 font-semibold ${
              activeTab === 'ongoing'
                ? 'border-red-500 text-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing
          </button>
          <button
            className={`border-b-4 px-6 py-2 font-semibold ${
              activeTab === 'completed'
                ? 'border-blue-500 text-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* Report type buttons */}
        <div className="mb-6 flex gap-3">
          <Button
            variant={reportType === 'quick' ? 'default' : 'outline'}
            className={`rounded-full ${
              reportType === 'quick'
                ? 'bg-gray-400 text-white hover:bg-gray-500'
                : 'border border-gray-400 text-black'
            }`}
            onClick={() => setReportType('quick')}
          >
            Quick report
          </Button>

          <Button
            variant={reportType === 'detailed' ? 'default' : 'outline'}
            className={`rounded-full ${
              reportType === 'detailed'
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'border border-gray-400 text-black'
            }`}
            onClick={() => setReportType('detailed')}
          >
            Detailed
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Example activity item */}
          <div className="flex items-center justify-between rounded-2xl border bg-gray-50 p-4 shadow-sm">
            <p className="text-sm text-black">
              Soi Phutthabucha 42, Khwaeng Bang Mot, Khet Thung Khru, Krung Thep
              Maha Nakhon 10140
            </p>
            <div className="h-16 w-16 rounded-xl bg-gray-300"></div>
          </div>
        </div>
        <Tabs defaultValue="Ongoing" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="Ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="Complete">Complete</TabsTrigger>
          </TabsList>
          <TabsContent value="Ongoing">
            Make changes to your account here.
          </TabsContent>
          <TabsContent value="Complete">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
