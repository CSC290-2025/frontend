import { Post, Get } from '.';
import type { SuccessResponseInterface } from '@/features/emergency/types/api';
import type {
  CreateToken,
  TokenResponse,
} from '@/features/emergency/types/fcm.ts';

export default class TokenApi {
  static async getTokensById(
    userId: string
  ): Promise<SuccessResponseInterface> {
    const response: SuccessResponseInterface<TokenResponse> = await Get(
      `/emergency/tokens/${userId}`
    );
    return response;
  }

  static async storeToken(token: string, userId: number) {
    const response: SuccessResponseInterface<CreateToken> = await Post(
      '/emergency/tokens',
      { tokens: token, user_id: userId }
    );
    return response;
  }
}
