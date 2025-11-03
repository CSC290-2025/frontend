import { Clock } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/emergency/components/ui/tabs';

export default function ActivitiesPage() {
  return (
    <div>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Clock size={32} />
          <h1 className="text-3xl font-bold">Activities</h1>
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
