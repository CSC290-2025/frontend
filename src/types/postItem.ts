export interface Category {
  id: number;
  category_name: string;
  // created_at: string;
  // updated_at: string;
}

// export interface PostItem {
//     item_id: number;
//     item_name: string;
//     user_id?: string;
//     photo?: string;
//     description?: string;
//     phone?: string;
//     email?: string;
//     is_given: boolean;
//     created_at: string;
//     updated_at: string;
//     categories?: Category[];
// }

export interface PostItem {
  id: number;
  item_name: string;
  item_weight?: number;
  photo_url?: string;
  description?: string;
  is_given: boolean;
}

export interface ApiPost {
  id: number;
  item_name: string;
  item_weight: string | number;
  photo_url: string | null;
  description: string | null;
  is_given: boolean;
  created_at: string;
  updated_at: string;
}

// Helper: map ApiPost -> PostItem (same mapping used in DiscoverPage)
// Api = parameter name similar to data from API/backend
export function mapApiPostToItem(api: ApiPost): PostItem {
  return {
    id: api.id,
    item_name: api.item_name,
    item_weight:
      typeof api.item_weight === 'string'
        ? parseFloat(api.item_weight)
        : (api.item_weight ?? undefined),
    photo_url: api.photo_url ?? undefined,
    description: api.description ?? undefined,
    is_given: api.is_given,
  };
}

// export interface PostEvent {
//     event_id: number;
//     user_id?: string;
//     event_name: string;
//     event_description?: string;
//     event_photo?: string;
//     start_date?: string;
//     end_date?: string;
//     province?: string;
//     district?: string;
//     subdistrict?: string;
//     more_location_detail?: string;
//     volunteer_required: boolean;
//     volunteer_amount?: number;
//     volunteer_speciality?: string;
//     volunteer_description?: string;
//     volunteer_register_deadline?: string;
//     created_at: string;
//     updated_at: string;
// }

// export interface RequestItem {
//     request_id: number;
//     item_id?: number;
//     user_id?: string;
//     status: 'pending' | 'accepted' | 'denied' | 'completed';
//     created_at: string;
//     updated_at: string;
//     post_item?: PostItem;
// }
