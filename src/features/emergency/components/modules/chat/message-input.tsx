import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { v4 as uuid } from 'uuid';
import { sendMessage } from '@/features/emergency/utils/chat.ts';
import { useAuth } from '@/features/auth';
import { useState } from 'react';

type MessageInputProps = {
  selectRoom?: number | null;
  userId?: number | null;
  role: string | null;
};

const MessageInput = ({ selectRoom, userId, role }: MessageInputProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState('');

  const roomId = role === 'Admin' ? selectRoom : userId;

  const handleSend = async () => {
    if (!messages.trim()) return;
    if (!roomId || !userId) return;

    const message = {
      id: uuid(),
      text: messages,
      sender: userId,
      role: user?.roles.role_name,
      timestamp: Date.now(),
    };

    try {
      await sendMessage(message, roomId.toString());
      setMessages('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-background flex items-center gap-3 border-t p-4">
      <Textarea
        placeholder="Write a message..."
        className="flex-1 resize-none"
        rows={1}
        value={messages}
        onChange={(e) => setMessages(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSend();
          }
        }}
      />
      <Button onClick={handleSend} disabled={!messages.trim() || !roomId}>
        Send
      </Button>
    </div>
  );
};

export default MessageInput;
