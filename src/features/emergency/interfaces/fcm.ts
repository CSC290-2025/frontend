import * as z from 'zod';

export interface TokenModel {
  _id: string;
  token: string;
}

const NotificationSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export type NotificationT = z.infer<typeof NotificationSchema>;
