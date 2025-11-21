import { post } from '.';
import type { SuccessResponseInterface } from '../interfaces/api';
import type { NotificationT, TokenModel } from '../interfaces/fcm.ts';

export default class FCMApi {
  static async sendAllNotification(
    notification: NotificationT
  ): Promise<SuccessResponseInterface<NotificationT>> {
    return await post('emergency/fcm/all', { notification });
  }
}
