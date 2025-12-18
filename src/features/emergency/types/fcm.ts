import * as z from 'zod';

const TokenResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  token: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

const CreateTokenSchema = z.object({
  token: z.string(),
  user_id: z.number(),
});

const NotificationSchema = z.object({
  title: z.string(),
  body: z.string(),
});

const NotificationTokenSchema = z.object({
  token: z.string(),
  notification: {
    title: z.string(),
    body: z.string(),
  },
});

export type NotificationT = z.infer<typeof NotificationSchema>;
export type CreateToken = z.infer<typeof CreateTokenSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type NotificationToken = z.infer<typeof NotificationTokenSchema>;
