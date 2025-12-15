import type { SuccessResponseInterface } from '@/features/emergency/interfaces/api.ts';
import { Get, Patch, Post, Delete } from '.';
import type {
  ContactRequestFrom,
  ContactResponseFrom,
  ContactUpdateFrom,
} from '@/features/emergency/interfaces/contact.ts';

export default class ContactApi {
  static async postContact(data: ContactRequestFrom) {
    const response: SuccessResponseInterface<ContactResponseFrom> = await Post(
      'emergency/contacts',
      data
    );
    return response;
  }

  static async getContactByUserId(userId: string) {
    const response = await Get(`emergency/contacts/${userId}`, {});
    return response.data.data;
  }

  static async updateContactById(data: ContactUpdateFrom) {
    return await Patch('emergency/contacts', {
      data,
    });
  }

  static async deleteContactById(id: string) {
    return await Delete(`emergency/contacts/${id}`);
  }
}
