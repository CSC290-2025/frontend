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
