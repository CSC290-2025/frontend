import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type ChatMessage } from '@/features/emergency/types/chat.ts';
import {
  fetchInitialMessages,
  loadOlderMessages,
  listenToNewMessages,
} from '@/features/emergency/utils/chat.ts';

export const useMessages = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNext = async () => {
    if (loading || !hasMore) return;
    if (debounceTimeout.current) return;

    debounceTimeout.current = setTimeout(() => {
      debounceTimeout.current = null;
    }, 1000);

    try {
      setLoading(true);

      if (!initialLoadDone) {
        const { messages, lastTimestamp } = await fetchInitialMessages(roomId);
        console.log(messages);
        console.log(lastTimestamp);
        setMessages(messages);
        setLastTimestamp(lastTimestamp);
        setHasMore(messages.length === 25);
        setInitialLoadDone(true);

        setTimeout(() => {
          scrollToBottom();
          setTimeout(() => setHasScrolled(true), 400);
        }, 300);
      } else if (hasScrolled && lastTimestamp) {
        const { messages: older, lastTimestamp: newLast } =
          await loadOlderMessages(lastTimestamp, roomId);

        setMessages((prev) => [...older, ...prev]);
        setLastTimestamp(newLast);
        setHasMore(!!newLast);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Failed to fetch messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialLoadDone) return;
    const now = Date.now();

    const unsub = listenToNewMessages(
      roomId,
      now,
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 100);
      },
      (error) => {
        console.error('Realtime error:', error);
        toast.error('Could not listen to new messages.');
      }
    );

    return () => unsub();
  }, [initialLoadDone, roomId]);

  useEffect(() => {
    setMessages([]);
    setLastTimestamp(null);
    setHasMore(true);
    setInitialLoadDone(false);
    setHasScrolled(false);

    handleNext();
  }, [roomId]);

  return {
    messages,
    loading,
    hasMore,
    handleNext,
    scrollToBottom,
    bottomRef,
  };
};
