import { useState } from 'react';
import { BookUser } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/features/emergency/components/ui/tabs';
import { Input } from '@/features/emergency/components/ui/input';
import { Button } from '@/features/emergency/components/ui/button';
import ContactCard from '@/features/emergency/components/modules/card/contact-card.tsx';
import { useContactForm } from '@/features/emergency/hooks/contact-from.tsx';

interface E_num {
  id: number;
  name: string;
  phone: string;
}

export default function HotlinePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { contact } = useContactForm();

  const E_num: E_num[] = [
    {
      id: 1,
      name: 'police',
      phone: '191',
    },
    {
      id: 2,
      name: 'Hospital',
      phone: '1691',
    },
  ];

  return (
    <div className="p-2 sm:p-6">
      {/* Header */}
      <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <BookUser />
          <h1 className="text-3xl font-bold">Hot line</h1>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Input
            type="text"
            placeholder="Search here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            + Add new
          </Button>
        </div>
      </header>

      <Tabs defaultValue="Family" className="w-full">
        <TabsList>
          <TabsTrigger value="Emergency service">Emergency service</TabsTrigger>
          <TabsTrigger value="Family">Family</TabsTrigger>
        </TabsList>

        <TabsContent value="Family" className="mb-6">
          <div className="h-auto">
            {contact.map((c) => (
              <div key={c.id} className="mb-6">
                <ContactCard
                  contactName={c.contact_name}
                  phoneNumber={c.phone}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Emergency service" className="mb-6">
          <div className="h-auto">
            {E_num.map((e) => (
              <div key={e.id} className="mb-6">
                <ContactCard phoneNumber={e.phone} contactName={e.name} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
