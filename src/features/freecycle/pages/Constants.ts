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
