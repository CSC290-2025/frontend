export interface Category {
  category_id: number;
  category_name: string;
  created_at: string;
  updated_at: string;
}

export interface PostItem {
  item_id: number;
  item_name: string;
  user_id?: string;
  photo?: string;
  description?: string;
  phone?: string;
  email?: string;
  is_given: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category[];
}

export interface PostEvent {
  event_id: number;
  user_id?: string;
  event_name: string;
  event_description?: string;
  event_photo?: string;
  start_date?: string;
  end_date?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  more_location_detail?: string;
  volunteer_required: boolean;
  volunteer_amount?: number;
  volunteer_speciality?: string;
  volunteer_description?: string;
  volunteer_register_deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface RequestItem {
  request_id: number;
  item_id?: number;
  user_id?: string;
  status: 'pending' | 'accepted' | 'denied' | 'completed';
  created_at: string;
  updated_at: string;
  post_item?: PostItem;
}

export const banners = [
  {
    gradient: 'from-red-100 to-pink-300',
    title: 'Share & Care',
    subtitle: 'Give items a second life',
  },
  {
    gradient: 'from-purple-100 to-indigo-300',
    title: 'Connect & Share',
    subtitle: 'Come to our Giveaway event – see items and take what you like!',
  },
  {
    gradient: 'from-white-100 to-purple-300',
    title: 'Join Our Team',
    subtitle:
      'We are looking for experts from various fields to join our event!',
  },
  {
    gradient: 'from-teal-100 to-cyan-300',
    title: 'Recycle & Reuse',
    subtitle: 'Build a sustainable community',
  },
  {
    gradient: 'from-green-100 to-yellow-300',
    title: 'Ready for Rehoming',
    subtitle:
      'Plenty of great items are waiting for you to discover and take home.',
  },
];
