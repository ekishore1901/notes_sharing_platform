export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
  bio: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  thumbnail_url: string | null;
  author_id: string;
  subject_id: string | null;
  institution: string | null;
  is_premium: boolean;
  price: number;
  version: number;
  views: number;
  downloads: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  author?: Profile;
  subject?: Subject;
  tags?: Tag[];
  average_rating?: number;
  rating_count?: number;
  is_saved?: boolean;
  user_rating?: number;
}

export interface Rating {
  id: string;
  note_id: string;
  user_id: string;
  rating: number;
  created_at: string;
  user?: Profile;
}

export interface Comment {
  id: string;
  note_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
  replies?: Comment[];
}

export interface SavedNote {
  id: string;
  note_id: string;
  user_id: string;
  created_at: string;
  note?: Note;
}

export interface Purchase {
  id: string;
  note_id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

export interface SearchResult {
  notes: Note[];
  total: number;
}

export interface FilterOptions {
  subject?: string;
  tags?: string[];
  is_premium?: boolean;
  sort?: 'newest' | 'popular' | 'rating' | 'downloads';
  query?: string;
}
