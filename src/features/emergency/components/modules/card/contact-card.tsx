import type { FC } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
} from '@/features/emergency/components/ui/card.tsx';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { Copy, Edit, Phone } from 'lucide-react';

type ContactCardProps = {
  phoneNumber: string | null;
  contactName: string;
};

const ContactCard: FC<ContactCardProps> = ({ phoneNumber, contactName }) => {
  return (
    <Card className="mb-6 w-full">
      <CardContent>
        <div className="m-4 flex items-center justify-between">
          <CardTitle>{contactName}</CardTitle>
          <div className="flex items-center justify-between gap-16">
            <CardTitle>{phoneNumber}</CardTitle>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                className="rounded-full bg-gray-300 text-white hover:bg-gray-400"
                onClick={() => {
                  window.location.href = `tel:${phoneNumber}`;
                }}
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
  );
};

export default ContactCard;
