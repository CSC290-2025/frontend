import { Post } from '.';
import type { SuccessResponseInterface } from '../interfaces/api';
import type { CreateToken } from '../interfaces/fcm.ts';

export default class TokenApi {
  // static async getTokens() {
  //     const response: SuccessResponseInterface<TokenModel> = await get('/tokens');
  //     return response;
  // }

  static async storeToken(token: string, userId: number) {
    const response: SuccessResponseInterface<CreateToken> = await Post(
      '/emergency/tokens',
      { tokens: token, user_id: userId }
    );
    return response;
  }
}
