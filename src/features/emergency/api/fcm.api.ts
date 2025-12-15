import { Post } from '.';
import type { SuccessResponseInterface } from '@/features/emergency/types/api';
import type {
  NotificationT,
  NotificationToken,
} from '@/features/emergency/types/fcm.ts';

export default class FCMApi {
  static async sendAllNotification(
    data: NotificationT
  ): Promise<SuccessResponseInterface<NotificationT>> {
    return await Post('emergency/fcm/all', { data });
  }

  static async sendTokenNotification(
    data: NotificationToken
  ): Promise<SuccessResponseInterface<NotificationToken>> {
    return await Post('emergency/fcm/token', { data });
  }
}
