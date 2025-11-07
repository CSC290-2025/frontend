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
import { cn } from '@/lib/utils';

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

  const filteredContacts = familyContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl p-6">
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-fit grid-cols-2">
          <TabsTrigger
            value="emergency"
            className={cn(
              'data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600'
            )}
          >
            Emergency service
          </TabsTrigger>
          <TabsTrigger
            value="family"
            className={cn(
              'data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:bg-transparent data-[state=active]:text-red-600'
            )}
          >
            Family
          </TabsTrigger>
        </TabsList>

        {/* Family contacts */}
        <TabsContent value="family">
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="flex items-center justify-between transition-shadow hover:shadow-sm"
              >
                <CardContent className="flex w-full items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-lg font-semibold">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                  </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Emergency contacts placeholder */}
        <TabsContent value="emergency">
          <p className="text-gray-500 italic">No emergency contacts yet.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
