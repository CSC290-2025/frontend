import { useEffect, useState } from 'react';
import {
  fetchRoomId,
  deleteRoomById,
} from '@/features/emergency/utils/chat.ts';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

type ChatSidebarProps = {
  onSelectRoom: (roomId: number | null) => void;
  selectRoomId: number | null;
};

const ChatSidebar = ({ onSelectRoom, selectRoomId }: ChatSidebarProps) => {
  const [roomIds, setRoomIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = fetchRoomId(setRoomIds);
    return () => unsubscribe();
  }, []);

  const handleDeleteRoom = async (roomId: string) => {
    await deleteRoomById(roomId);
    if (selectRoomId === Number(roomId)) {
      onSelectRoom(null);
    }
  };

  return (
    <div className="w-[320px] border-r">
      {roomIds.map((r) => {
        const roomNumber = Number(r);
        const isActive = selectRoomId === roomNumber;

        return (
          <ContextMenu key={r}>
            <ContextMenuTrigger>
              <div
                onClick={() => onSelectRoom(roomNumber)}
                className={`cursor-pointer px-4 py-3 ${
                  isActive ? 'bg-primary/10 font-semibold' : 'hover:bg-muted'
                }`}
              >
                Room {r}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleDeleteRoom(r)}>
                Delete Room
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
};

export default ChatSidebar;
