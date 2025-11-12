import { useState } from 'react';
import { BookUser, Phone, Edit, Copy } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/features/emergency/components/ui/tabs';
import { Input } from '@/features/emergency/components/ui/input';
import { Button } from '@/features/emergency/components/ui/button';
import { Card, CardContent } from '@/features/emergency/components/ui/card';

interface Contact {
  id: number;
  name: string;
  phone: string;
  image: string;
}

export default function HotlinePage() {
  const [activeTab, setActiveTab] = useState('family');
  const [searchTerm, setSearchTerm] = useState('');

  const familyContacts: Contact[] = [
    {
      id: 1,
      name: 'Dad',
      phone: '0624635984',
      image: 'https://i.imgur.com/9P8yY8R.png',
    },
    {
      id: 2,
      name: 'Mom',
      phone: '062769394',
      image: 'https://i.imgur.com/xkSkkzB.png',
    },
    {
      id: 3,
      name: 'Bro',
      phone: '0624635984',
      image: 'https://i.imgur.com/0RrWvRr.png',
    },
    {
      id: 4,
      name: 'T.M. Opera O',
      phone: '0624635984',
      image: 'https://i.imgur.com/zJbT2rI.png',
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

      <Tabs defaultValue="Ongoing" className="w-full">
        <TabsList>
          <TabsTrigger value="Emergency service">Emergency service</TabsTrigger>
          <TabsTrigger value="Family">Family</TabsTrigger>
        </TabsList>

        {/* Ongoing Tab */}
        <TabsContent value="Family" className="mb-6">
          <div className="h-auto">
            {familyContacts.map((r) => (
              <div key={r.id} className="mb-6">
                <Card className="w-full">
                  <CardContent>
                    <div className="grid grid-cols-6">
                      <div className="col-span-4 gap-2 pl-5">
                        <div className="">{r.name}</div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            className="rounded-full bg-gray-300 text-white hover:bg-gray-400"
                          >
                            <Phone className="h-5 w-5" />
                          </Button>
                          <Button
                            size="icon"
                            className="rounded-full bg-gray-300 text-white hover:bg-gray-400"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            size="icon"
                            className="rounded-full bg-gray-300 text-white hover:bg-gray-400"
                          >
                            <Copy className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
