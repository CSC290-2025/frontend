import InfiniteScroll from '@/features/emergency/components/ui/expansions/InfiniteScroll';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useMessages } from '@/features/emergency/hooks/useMessages';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { apiClient } from '@/lib/apiClient.ts';

type MessageListProps = {
  onSelectUserId?: number | null;
  onSelectRoomId?: number | null;
};

const MessageList = ({ onSelectUserId, onSelectRoomId }: MessageListProps) => {
  const [userId, setUserId] = useState<number | null>(null);
  console.log(onSelectUserId);
  console.log(onSelectRoomId);

  const activeRoomId = onSelectRoomId ?? onSelectUserId;

  const { messages, loading, hasMore, handleNext, bottomRef } = useMessages(
    activeRoomId ? activeRoomId.toString() : ''
  );

  useEffect(() => {
    const fetchUserId = async () => {
      const me = await apiClient.get('/auth/me');
      setUserId(me.data.data.userId);
    };
    fetchUserId();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-2">
      <InfiniteScroll
        isLoading={loading}
        hasMore={hasMore}
        next={handleNext}
        threshold={1}
        reverse
      >
        {hasMore && (
          <Loader2 className="text-muted-foreground mx-auto my-4 h-5 w-5 animate-spin" />
        )}
      </InfiniteScroll>

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={clsx(
            'max-w-[70%] rounded-xl px-4 py-2 text-sm',
            msg.sender === userId
              ? 'bg-primary/10 ml-auto self-end text-right'
              : 'bg-muted self-start'
          )}
        >
          <div className="text-muted-foreground text-xs font-semibold">
            {msg.sender}
          </div>
          <div>{msg.text}</div>
        </div>
      ))}

      {messages.length === 0 && !loading && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          No messages yet, start chatting!
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
