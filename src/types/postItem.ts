export interface Category {
  id: number;
  category_name: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface PostsCategories {
  post_id: number;
  category_id: number;
}
