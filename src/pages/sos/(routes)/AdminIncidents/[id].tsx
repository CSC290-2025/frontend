import { useState } from 'react';
import { useParams, useNavigate } from '@/router';
import {
  mockIncidents,
  mockMessages,
} from '@/features/emergency/data/mockData';
import { IncidentDetail } from '@/features/emergency/components/admin/IncidentDetail';
import { ChatPanel } from '@/features/emergency/components/admin/ChatPanel';
import { MapView } from '@/features/emergency/components/admin/MapView';
import type {
  IncidentStatus,
  ChatMessage,
} from '@/features/emergency/interfaces/incident';

import { Button } from '@/features/emergency/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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

export default function IncidentDetailPage() {
  const { id } = useParams('/sos/AdminIncidents/:id');
  const navigate = useNavigate();
  const incident = mockIncidents.find((i) => String(i.id) === id);
  const [messages, setMessages] = useState<ChatMessage[]>(
    mockMessages.filter((m) => String(m.incidentId) === id)
  );
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-foreground text-lg font-semibold">
            CASE#{incident.id}
          </h1>
          <p className="text-muted-foreground text-sm">{incident.address}</p>
        </div>
      </div>

      {/* Content - Stacks on Mobile, 3 cols on Desktop */}
      <div className="grid grow grid-cols-1 overflow-hidden lg:grid-cols-3">
        {/* Left: Details */}
        <div className="border-border bg-background min-h-[500px] overflow-y-auto border-r p-4 lg:col-span-1 lg:min-h-0">
          <IncidentDetail
            incident={incident}
            onStatusChange={handleStatusChange}
            onBroadcast={handleBroadcast}
          />
        </div>

        {/* Middle: Map */}
        <div className="border-border bg-background min-h-[400px] border-r p-4 lg:col-span-1 lg:min-h-0">
          <div className="card-elevated h-full overflow-hidden">
            <MapView incidents={[incident]} />
          </div>
        </div>

        {/* Right: Chat */}
        <div className="border-border flex min-h-[500px] flex-col border-t lg:col-span-1 lg:min-h-0 lg:border-t-0">
          <ChatPanel
            messages={messages}
            incidentId={incident.id}
            onSendMessage={handleSendMessage}
          />
        </div>
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
              className="bg-warning text-warning-foreground rounded-xl"
            >
              Send Alert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
