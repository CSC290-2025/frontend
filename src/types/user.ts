export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}
