import MessageInput from '@/features/emergency/components/modules/chat/message-input.tsx';
import MessageList from '@/features/emergency/components/modules/chat/message-list.tsx';
import ChatSidebar from '@/features/emergency/components/modules/chat/chat-sidebar.tsx';
import { useAuth } from '@/features/auth';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient.ts';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectRoom, setSelectRoom] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const me = await apiClient.get('/auth/me');
      setUserId(me.data.data.userId);
      setRole(me.data.data.role);
    };
    fetchUserId();
  }, []);
  return (
    <div className="bg-background flex h-[calc(100vh-3rem)] w-full flex-col overflow-hidden">
      <div className="bg-background sticky top-0 z-10 border-b p-4 font-semibold">
        Chat app
      </div>
      <div className="flex flex-1 overflow-hidden">
        {user?.roles.role_name === 'Admin' && (
          <ChatSidebar onSelectRoom={setSelectRoom} selectRoomId={selectRoom} />
        )}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <MessageList onSelectUserId={userId} onSelectRoomId={selectRoom} />
          </div>
          <MessageInput selectRoom={selectRoom} role={role} userId={userId} />
        </div>
      </div>
    </div>
  );
}
