import { useState, type FC } from 'react';
import {
  Card,
  CardContent,
} from '@/features/emergency/components/modules/card/card.tsx';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/features/emergency/components/ui/dialog';
import { Copy, Edit, Phone, Delete } from 'lucide-react';
import { toast } from 'sonner';
import { useContactForm } from '@/features/emergency/contexts/contact-from.tsx';

type ContactCardProps = {
  phoneNumber: string | null;
  contactName: string;
  onUpdate?: (name: string, phone: string) => void;
  id: number;
  value: string;
};

const ContactCard: FC<ContactCardProps> = ({
  phoneNumber,
  contactName,
  id,
  onUpdate,
  value,
}) => {
  const [editName, setEditName] = useState(contactName);
  const [editPhone, setEditPhone] = useState(phoneNumber || '');
  const [isOpen, setIsOpen] = useState(false);

  const { updateContact, deleteContactById } = useContactForm();

  const handleSave = async () => {
    if (onUpdate) onUpdate(editName, editPhone);
    setIsOpen(false);
    console.log(editName, editPhone);

    try {
      await updateContact(
        { contact_name: editName, phone: editPhone },
        id.toString()
      );
    } catch (error) {
      console.error(error);
    }
  };
  console.log(id);

  return (
    <Card className="mb-4 w-full">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold sm:text-lg">
              {contactName}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-sm font-medium text-gray-600 sm:mr-4">
              {phoneNumber}
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => (window.location.href = `tel:${phoneNumber}`)}
              >
                <Phone className="h-4 w-4" />
              </Button>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  {value === 'family' && (
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Contact</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary" type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSave}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => {
                  if (phoneNumber) {
                    navigator.clipboard.writeText(phoneNumber);
                    toast('Phone number copied!'); // หรือใช้ toast notification
                  }
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {value === 'family' && (
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={async () => {
                    try {
                      await deleteContactById(id.toString());
                      toast('Contact deleted successfully');
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                >
                  <Delete className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactCard;
