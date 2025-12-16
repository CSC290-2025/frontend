import * as z from 'zod';

export interface TokenModel {
  _id: string;
  token: string;
}

const CreateTokenSchema = z.object({
  token: z.string(),
  user_id: z.number(),
});

const NotificationSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export type NotificationT = z.infer<typeof NotificationSchema>;
export type CreateToken = z.infer<typeof CreateTokenSchema>;
