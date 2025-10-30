import { post } from '.';
import type { SuccessResponseInterface } from '../interfaces/api';
import type { NotificationT, TokenModel } from '../interfaces/common';

export default class FCMApi {
  static async sendAllNotification(
    notification: NotificationT
  ): Promise<SuccessResponseInterface<TokenModel>> {
    return await post('/fcm/all', { notification });
  }
}
