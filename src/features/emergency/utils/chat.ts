import {
  endBefore,
  get,
  limitToLast,
  onChildAdded,
  onValue,
  orderByChild,
  push,
  query,
  type Query,
  ref,
  remove,
  startAt,
} from 'firebase/database';
import { database } from '@/lib/firebase.ts';
import {
  type ChatMessage,
  ChatMessageSchema,
  type RoomDetail,
} from '@/features/emergency/types/chat.ts';
import { formatZodError } from '@/features/emergency/utils/zodError-helper.ts';

const BASE_URL = 'teams/13/chats';

const fetchMessagesFromQuery = async (q: Query) => {
  try {
    const snap = await get(q);
    console.log(snap.val());
    //if not find query
    if (!snap.exists()) {
      return {
        messages: [],
        lastTimestamp: null,
      };
    }

    const messages = Object.entries(snap.val())
      .map(([id, data]) =>
        ChatMessageSchema.safeParse({ id, ...(data as object) })
      )
      .map((res, i) =>
        res.success
          ? res.data
          : console.warn(
              `Invalid item at index ${i}:`,
              formatZodError(res.error),
              null
            )
      )
      .filter((m): m is ChatMessage => m !== null)
      .sort((a, b) => a.timestamp - b.timestamp);
    return {
      messages,
      lastTimestamp: messages.at(-1)?.timestamp ?? null,
    };
  } catch (err) {
    console.error('Failed to fetch messages');
    throw err;
  }
};

export const sendMessage = async (msg: ChatMessage, roomId: string) => {
  const validateMsg = ChatMessageSchema.safeParse(msg);

  if (!validateMsg.success) {
    const errorMessage = formatZodError(validateMsg.error);
    console.error('Invalid message data:', errorMessage);
    throw new Error(errorMessage);
  }
  await push(ref(database, `${BASE_URL}/${roomId}/messages`), validateMsg.data);
};

export const listenToNewMessages = (
  roomId: string,
  afterTimestamp: number,
  onNewMessage: (msg: ChatMessage) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    ref(database, `teams/13/chats/${roomId}/messages`),
    orderByChild('timestamp'),
    startAt(afterTimestamp)
  );
  return onChildAdded(
    q,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const parsed = ChatMessageSchema.safeParse({
        id: snapshot.key,
        ...data,
      });

      if (parsed.success) {
        onNewMessage(parsed.data);
      } else {
        console.warn('Invalid message', formatZodError(parsed.error));
      }
    },
    onError
  );
};

export const fetchInitialMessages = async (roomId: string) => {
  console.log('hi');
  const q = query(ref(database, `teams/13/chats/${roomId}/messages`));
  return fetchMessagesFromQuery(q);
};

export const loadOlderMessages = async (
  beforeTimestamp: number,
  roomId: string
) => {
  const q = query(
    ref(database, `teams/13/chats/${roomId}/messages`),
    orderByChild('timestamp'),
    endBefore(beforeTimestamp),
    limitToLast(25)
  );
  return fetchMessagesFromQuery(q);
};

export const fetchRoomId = (callback: (roomIds: string[]) => void) => {
  const roomsRef = ref(database, 'teams/13/chats');

  const unsubscribe = onValue(roomsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(Object.keys(snapshot.val()));
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

export const deleteRoomById = (roomId: string) => {
  const roomRef = ref(database, `teams/13/chats/${roomId}`);
  return remove(roomRef);
};
