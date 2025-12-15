import type {
  ContactRequestFrom,
  ContactResponseFrom,
  ContactUpdateFrom,
} from '@/features/emergency/types/contact.ts';
import ContactApi from '@/features/emergency/api/contact.ts';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type ContactFormProviderProps = {
  children: ReactNode;
};

type ContactFormState = {
  contact: ContactResponseFrom[];
  createContact: (data: ContactRequestFrom) => Promise<void>;
  updateContact: (data: ContactUpdateFrom) => Promise<void>;
  findContactByUserId: (userId: string) => Promise<void>;
  isLoading: boolean;
};

const ContactFormContext = createContext<ContactFormState | null>(null);

export function ContactFormProvider({ children }: ContactFormProviderProps) {
  const [contact, setContact] = useState<ContactResponseFrom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findContactByUserId = async (userId: string) => {
    const res = await ContactApi.getContactByUserId(userId);
    setContact(res.contact);
  };

  const createContact = async (data: ContactRequestFrom) => {
    setIsLoading(true);
    try {
      await ContactApi.postContact(data);
      await findContactByUserId('1');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = async (data: ContactUpdateFrom) => {
    setIsLoading(true);
    try {
      const res = await ContactApi.updateContactById(data);

      setContact((prev) =>
        prev.map((c) => (c.id === data.id ? res.data.data : c))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    try {
      findContactByUserId('1');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ContactFormContext.Provider
      value={{
        contact,
        isLoading,
        createContact,
        updateContact,
        findContactByUserId,
      }}
    >
      {children}
    </ContactFormContext.Provider>
  );
}

export const useContactForm = () => {
  const context = useContext(ContactFormContext);
  if (!context) {
    throw new Error('useContactForm must be used within ContactFormProvider');
  }
  return context;
};
