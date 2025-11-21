import type { SuccessResponseInterface } from '@/features/emergency/interfaces/api.ts';
import { get, patch, post } from '.';
import type {
  ContactRequestFrom,
  ContactResponseFrom,
  ContactUpdateFrom,
} from '@/features/emergency/interfaces/contact.ts';

export default class ContactApi {
  static async postContact(data: ContactRequestFrom) {
    const response: SuccessResponseInterface<ContactResponseFrom> = await post(
      'emergency/contacts',
      data
    );
    return response;
  }

  static async getContactByUserId(userId: string) {
    const response = await get(`emergency/contacts/${userId}`, {});
    return response.data.data;
  }

  static async updateContactById(data: ContactUpdateFrom) {
    return await patch('emergency/contacts', {
      data,
    });
  }
}
