import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@/router';
import { IncidentDetail } from '@/features/emergency/components/admin/IncidentDetail';
import type {
  IncidentStatus,
  ChatMessage,
  Incident,
} from '@/features/emergency/types/incident';

import { Button } from '@/features/emergency/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/apiClient.ts';
import config from '@/features/emergency/config/env.ts';
import axios from 'axios';

export default function IncidentDetailPage() {
  const { id } = useParams('/sos/AdminIncidents/:id');
  console.log(id);
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, string>>({});
  const [incident, setIncident] = useState<Incident>({});
  const [messages, setMessages] = useState<ChatMessage[]>();
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);

  useEffect(() => {
    const fetch = async (id: string) => {
      const res = await apiClient.get(`/emergency/report/${id}`);
      setIncident(res.data.data.report);
      setData(res.data.data.report);
    };
    fetch(id);
    console.log(data);
  }, [id]);

  const [addressMap, setAddressMap] = useState<string>('');

  const convertPo = async (
    lat: string | null,
    long: string | null,
    id: number
  ) => {
    if (!lat || !long || addressMap[id]) return;
    console.log(lat, long);
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${config.GEO_API_KEY}`;
      const res = await axios.get(url);
      const formatted =
        res.data?.features?.[0]?.properties?.formatted ?? 'Unknown location';
      console.log(formatted);

      setAddressMap(formatted);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (data?.lat && data?.long && data.id) {
      convertPo(data.lat, data.long, Number(data.id));
    }
    console.log(addressMap);
  }, [data]);

  if (!incident) {
    return (
      <div className="p-6">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Case not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4 rounded-xl">
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  const handleStatusChange = (status: IncidentStatus) => {
    if (status === 'verified') {
      setShowBroadcastDialog(true);
    }
    toast.success(`Status changed to "${status}"`);
  };

  const handleBroadcast = () => {
    setShowBroadcastDialog(true);
  };

  const confirmBroadcast = () => {
    toast.success('Alert sent to nearby users');
    setShowBroadcastDialog(false);
  };

  const handleSendMessage = (message: string, isInternal: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      incidentId: incident.id,
      senderId: 'admin1',
      senderType: 'admin',
      message,
      createdAt: new Date(),
      isInternal,
    };
    setMessages([...messages, newMessage]);
    if (!isInternal) {
      toast.success('Message sent to user');
    }
  };

  return (
    // Responsive container: height auto on mobile to scroll, fixed on desktop
    <div className="flex h-auto flex-col lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-border bg-card flex shrink-0 items-center gap-4 border-b p-4">
        <div>
          <h1 className="text-foreground text-lg font-semibold">
            CASE {data.id}
          </h1>
        </div>
      </div>

      <div className="border-border bg-background min-h-[500px] overflow-y-auto border-r p-4">
        <IncidentDetail
          incident={incident}
          onStatusChange={handleStatusChange}
          onBroadcast={handleBroadcast}
          id={id}
          address={addressMap}
        />
      </div>

      {/* Broadcast Dialog */}
      <AlertDialog
        open={showBroadcastDialog}
        onOpenChange={setShowBroadcastDialog}
      >
        <AlertDialogContent className="w-[90%] max-w-lg rounded-2xl md:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Send emergency alert?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to send an alert to users within a 1km radius of the
              incident?
              <br />
              <br />
              <strong>Category:</strong> {incident.category}
              <br />
              <strong>Location:</strong> {incident.address}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBroadcast}
              className="cursor-pointer rounded-xl text-white"
            >
              Send Alert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
