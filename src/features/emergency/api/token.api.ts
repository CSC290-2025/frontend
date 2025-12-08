import { post } from '.';
import type { SuccessResponseInterface } from '../interfaces/api';
import type { TokenModel } from '../interfaces/fcm.ts';

export default class TokenApi {
  // static async getTokens() {
  //     const response: SuccessResponseInterface<TokenModel> = await get('/tokens');
  //     return response;
  // }

  static async storeToken(token: string) {
    const response: SuccessResponseInterface<TokenModel> = await post(
      '/tokens',
      { tokens: token }
    );
    return response;
  }
}
