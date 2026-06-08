-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    institution TEXT,
    bio TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects/Categories
CREATE TABLE public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE public.tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    thumbnail_url TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    institution TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    version INTEGER DEFAULT 1,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note tags junction table
CREATE TABLE public.note_tags (
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

-- Ratings
CREATE TABLE public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- Comments
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved notes (bookmarks)
CREATE TABLE public.saved_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- Purchases (for premium notes)
CREATE TABLE public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Subjects policies (public read)
CREATE POLICY "subjects_select" ON public.subjects FOR SELECT USING (true);

-- Tags policies (public read)
CREATE POLICY "tags_select" ON public.tags FOR SELECT USING (true);

-- Notes policies
CREATE POLICY "notes_select" ON public.notes FOR SELECT USING (status = 'published' OR auth.uid() = author_id);
CREATE POLICY "notes_insert" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "notes_update" ON public.notes FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "notes_delete" ON public.notes FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Note tags policies
CREATE POLICY "note_tags_select" ON public.note_tags FOR SELECT USING (true);

-- Ratings policies
CREATE POLICY "ratings_select" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "ratings_insert" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Saved notes policies
CREATE POLICY "saved_notes_select" ON public.saved_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "saved_notes_insert" ON public.saved_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_notes_delete" ON public.saved_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Purchases policies
CREATE POLICY "purchases_select" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "purchases_insert" ON public.purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Insert default subjects
INSERT INTO public.subjects (name, icon) VALUES
    ('Mathematics', 'calculator'),
    ('Physics', 'atom'),
    ('Chemistry', 'flask-conical'),
    ('Biology', 'leaf'),
    ('Computer Science', 'code'),
    ('Engineering', 'cog'),
    ('Medicine', 'stethoscope'),
    ('Law', 'scale'),
    ('Business', 'briefcase'),
    ('Economics', 'trending-up'),
    ('Psychology', 'brain'),
    ('History', 'book-open'),
    ('Literature', 'book'),
    ('Art', 'palette'),
    ('Music', 'music'),
    ('Philosophy', 'lightbulb');

-- Create indexes for performance
CREATE INDEX idx_notes_author ON public.notes(author_id);
CREATE INDEX idx_notes_subject ON public.notes(subject_id);
CREATE INDEX idx_notes_status ON public.notes(status);
CREATE INDEX idx_ratings_note ON public.ratings(note_id);
CREATE INDEX idx_comments_note ON public.comments(note_id);
CREATE INDEX idx_saved_notes_user ON public.saved_notes(user_id);