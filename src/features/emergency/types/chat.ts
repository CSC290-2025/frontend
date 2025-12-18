import * as z from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  sender: z.number(),
  role: z.string().optional(),
  timestamp: z.number(),
});

const RoomDetailSchema = z.array(z.tuple([z.string(), ChatMessageSchema]));

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type RoomDetail = z.infer<typeof RoomDetailSchema>;
