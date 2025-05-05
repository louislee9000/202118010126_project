export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  enrolled_courses?: number;
  join_date?: string;
  bio?: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
} 