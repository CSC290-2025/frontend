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
  updateContact: (data: ContactUpdateFrom, id: string) => Promise<void>;
  findContactByUserId: (userId: string) => Promise<void>;
  deleteContactById: (id: string) => Promise<void>;
  isLoading: boolean;
  setCurrentUserId: (id: string) => void;
};

const ContactFormContext = createContext<ContactFormState | null>(null);

export function ContactFormProvider({ children }: ContactFormProviderProps) {
  const [contact, setContact] = useState<ContactResponseFrom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const setCurrentUserId = (id: string) => {
    setUserId(id);
    findContactByUserId(id);
  };

  const findContactByUserId = async (userId: string) => {
    const res = await ContactApi.getContactByUserId(userId);
    setContact(res.contact);
  };

  const createContact = async (data: ContactRequestFrom) => {
    setIsLoading(true);
    if (!userId) return;
    try {
      await ContactApi.postContact(data);
      await findContactByUserId(userId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = async (data: ContactUpdateFrom, id: string) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      await ContactApi.updateContactById(data, id);
      await findContactByUserId(userId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContactById = async (id: string) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      await ContactApi.deleteContactById(id);
      await findContactByUserId(userId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    try {
      findContactByUserId(userId);
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
        setCurrentUserId,
        deleteContactById,
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
