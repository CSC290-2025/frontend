import { useState } from 'react';
import { BookUser, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/features/emergency/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/features/emergency/components/ui/tabs';
import { Button } from '@/features/emergency/components/ui/button';
import ContactCard from '@/features/emergency/components/modules/card/contact-card.tsx';
import { useContactForm } from '@/features/emergency/hooks/contact-from.tsx';
import { CardContent } from '@/features/emergency/components/modules/card/card.tsx';
import { useForm } from 'react-hook-form';
import {
  ContactOmit,
  type ContactRequestFrom,
} from '@/features/emergency/interfaces/contact.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@/features/emergency/components/ui/spinner.tsx';
import { toast } from 'sonner';

interface E_num {
  id: number;
  name: string;
  phone: string;
}

export default function HotlinePage() {
  const [showAdd, setShowAdd] = useState(true);
  const { contact, isLoading, createContact } = useContactForm();
  const [open, setOpen] = useState(false);
  console.log(contact);
  const E_num: E_num[] = [
    { id: 1, name: 'police', phone: '191' },
    { id: 2, name: 'Hospital', phone: '1691' },
  ];

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<ContactRequestFrom>({
    resolver: zodResolver(ContactOmit),
    defaultValues: {
      user_id: 1,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
      await createContact(data);
      reset();
      setOpen(false);
      toast('Contact add successfully', { position: 'top-right' });
    } catch (err) {
      console.error('Failed to submit contact:', err);
    }
  });

  const handleTabChange = (value: string) => {
    if (value === 'Family') {
      setShowAdd(true);
    } else {
      setShowAdd(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-2 sm:p-6">
      <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Hot line</h1>
        </div>

        {showAdd && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" iconLeft={<Plus />}>
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={onSubmit}>
                <DialogTitle className="text-center">Add contact</DialogTitle>
                <DialogDescription asChild>
                  <CardContent>
                    <div>
                      <DialogTitle className="my-6">Name</DialogTitle>
                      <Input {...register('contact_name')} />
                      {errors.contact_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.contact_name.message}
                        </p>
                      )}

                      <DialogTitle className="my-6">Phone number</DialogTitle>
                      <Input {...register('phone')} />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone.message}
                        </p>
                      )}

                      <div className="mt-6 flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => reset()}
                          >
                            Close
                          </Button>
                        </DialogClose>

                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Spinner /> Sending...
                            </>
                          ) : (
                            'Confirm'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </DialogDescription>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <Tabs
        defaultValue="Family"
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="Emergency service">Emergency service</TabsTrigger>
          <TabsTrigger value="Family">Family</TabsTrigger>
        </TabsList>

        <TabsContent value="Family">
          {contact.map((c) => (
            <ContactCard
              key={c.id}
              contactName={c.contact_name}
              phoneNumber={c.phone}
            />
          ))}
        </TabsContent>

        <TabsContent value="Emergency service">
          {E_num.map((e) => (
            <ContactCard
              key={e.id}
              contactName={e.name}
              phoneNumber={e.phone}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
