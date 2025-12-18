export interface Category {
  id: number;
  category_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithName {
  category_id: number;
  category_name: string;
}

export interface PostItem {
  id: number;
  item_name: string;
  item_weight?: number;
  photo_url?: string;
  description?: string;
  is_given: boolean;
  request_count: number;
  categories?: Category[];
  owner_id: number;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
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
  categories?: Category[];
  donater_id: number | null;
  donate_to_department_id: number | null;

  users?: {
    username: string;
    email: string;
    phone: string | null;
  };

  receiver_requests?: any[];
}

// Helper: map ApiPost -> PostItem
export function mapApiPostToItem(api: ApiPost): PostItem {
  const ownerId = api.donater_id ?? 1;

  // if (ownerId === 0) {
  //     console.warn(`Post ID ${api.id} is missing donater_id. Using Mock ID 0.`);
  // }

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

    request_count: Array.isArray(api.receiver_requests)
      ? api.receiver_requests.length
      : 0,
    owner_id: ownerId,

    owner_name: api.users?.username || 'Unknown User',
    owner_email: api.users?.email || '',
    owner_phone: api.users?.phone || '',
  };
}

export interface PostsCategories {
  post_id: number;
  category_id: number;
}
