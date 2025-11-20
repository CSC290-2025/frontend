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
  categories?: Category[];
  owner_id: number;
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
    owner_id: ownerId,
  };
}

export interface PostsCategories {
  post_id: number;
  category_id: number;
}
