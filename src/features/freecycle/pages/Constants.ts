// Constants for Freecycle feature can be added here in the future

// ItemPost represents the structure of an item post in the Freecycle feature
export interface ItemPost {
  id: number;
  item_name: string;
  item_weight: number | null;
  photo_url: string | null;
  description: string;
  donater_id: number;
  donate_to_department_id: number | null;
  is_given: boolean;
  is_reserved: boolean;
  isMine: boolean;
  category_id: number;
  category_name: string;
}

export interface ItemFormData {
  item_name: string;
  category_name: string;
  item_weight: string | number | null;
  photo_url: string | null;
  description: string;
  donater_contact_phone: string;
  donater_contact_email: string;
}

export const ALL_CATEGORIES: string[] = [
  'All Categories',
  'Clothing & Accessories',
  'Electronics',
  'Toys & Kids Items',
  'Books & Media',
  'Tools & Garden',
  'Pet Supplies',
  'Vehicles & Travel',
  'Others',
];

// Default form data for creating or editing an item post - state initialization
export const DEFAULT_ITEM_FORM_DATA: ItemFormData = {
  item_name: '',
  category_name: ALL_CATEGORIES[1],
  item_weight: '',
  photo_url: null,
  description: '',
  donater_contact_phone: '',
  donater_contact_email: '',
};
