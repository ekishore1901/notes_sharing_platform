import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  X,
  BookOpen,
  Star,
  Clock,
  TrendingUp,
  Download,
  Crown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Note, Subject, Tag } from '../types';
import { NoteCard, CardSkeleton } from '../components/ui';

type SortOption = 'newest' | 'popular' | 'rating' | 'downloads';
type ViewMode = 'grid' | 'list';

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'newest', label: 'Newest', icon: <Clock className="w-4 h-4" /> },
  { value: 'popular', label: 'Most Viewed', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'rating', label: 'Top Rated', icon: <Star className="w-4 h-4" /> },
  { value: 'downloads', label: 'Most Downloads', icon: <Download className="w-4 h-4" /> },
];

export function BrowsePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const [filters, setFilters] = useState<{
    query: string;
    subject: string | null;
    tags: string[];
    premium: boolean | null;
    sort: SortOption;
  }>({
    query: searchParams.get('q') || '',
    subject: searchParams.get('subject'),
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    premium: searchParams.get('premium') === 'true' ? true : null,
    sort: (searchParams.get('sort') as SortOption) || 'newest',
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [subjectsResult, tagsResult] = await Promise.all([
        supabase.from('subjects').select('*').order('name'),
        supabase.from('tags').select('*').order('name').limit(50),
      ]);

      if (subjectsResult.data) setSubjects(subjectsResult.data);
      if (tagsResult.data) setTags(tagsResult.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const count =
      (filters.subject ? 1 : 0) +
      filters.tags.length +
      (filters.premium !== null ? 1 : 0);
    setActiveFiltersCount(count);
  }, [filters]);

  useEffect(() => {
    setPage(0);
    setNotes([]);
    fetchNotes(true);
  }, [filters]);

  useEffect(() => {
    if (page > 0) {
      fetchNotes(false, page);
    }
  }, [page]);

  const fetchNotes = async (reset: boolean = false, currentPage: number = 0) => {
    setLoading(true);

    let query = supabase
      .from('notes')
      .select(
        `*, author:profiles(*), subject:subjects(*), tags:note_tags(tag:tags(*))`,
        { count: 'exact' }
      )
      .eq('status', 'published');

    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    if (filters.subject) {
      const subject = subjects.find((s) => s.name === filters.subject);
      if (subject) {
        query = query.eq('subject_id', subject.id);
      }
    }

    if (filters.premium !== null) {
      query = query.eq('is_premium', filters.premium);
    }

    switch (filters.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('views', { ascending: false });
        break;
      case 'rating':
        query = query.order('created_at', { ascending: false });
        break;
      case 'downloads':
        query = query.order('downloads', { ascending: false });
        break;
    }

    const start = currentPage * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data, error, count } = await query;

    if (!error && data) {
      const processedNotes = data.map((note: any) => ({
        ...note,
        tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
      }));

      if (reset) {
        setNotes(processedNotes);
      } else {
        setNotes((prev) => [...prev, ...processedNotes]);
      }

      setTotalCount(count || 0);
      setHasMore(start + pageSize < (count || 0));
    }

    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    updateFilters({ query });
  };

  const updateFilters = (updates: Partial<typeof filters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.subject) params.set('subject', newFilters.subject);
    if (newFilters.tags.length) params.set('tags', newFilters.tags.join(','));
    if (newFilters.premium !== null) params.set('premium', String(newFilters.premium));
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      subject: null,
      tags: [],
      premium: null,
      sort: 'newest',
    });
    setSearchParams(new URLSearchParams());
  };

  const toggleTag = (tagName: string) => {
    const newTags = filters.tags.includes(tagName)
      ? filters.tags.filter((t) => t !== tagName)
      : [...filters.tags, tagName];
    updateFilters({ tags: newTags });
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 pt-16">
      <div className="bg-white border-b border-secondary-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="search"
                  name="search"
                  defaultValue={filters.query}
                  placeholder="Search notes..."
                  className="input pl-11 pr-4"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary btn-sm"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary btn-sm ${
                  activeFiltersCount > 0 ? 'bg-primary-50 border-primary-200 text-primary-700' : ''
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value as SortOption })}
                  className="appearance-none bg-white border border-secondary-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-secondary-200 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Subject</label>
                  <select
                    value={filters.subject || ''}
                    onChange={(e) =>
                      updateFilters({ subject: e.target.value || null })
                    }
                    className="input"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Premium Status</label>
                  <select
                    value={
                      filters.premium === null
                        ? 'all'
                        : filters.premium
                        ? 'premium'
                        : 'free'
                    }
                    onChange={(e) =>
                      updateFilters({
                        premium:
                          e.target.value === 'all'
                            ? null
                            : e.target.value === 'premium',
                      })
                    }
                    className="input"
                  >
                    <option value="all">All Notes</option>
                    <option value="free">Free Notes</option>
                    <option value="premium">Premium Notes</option>
                  </select>
                </div>

                <div>
                  <label className="label">Tags</label>
                  <div className="flex flex-wrap gap-2 p-2 bg-white border border-secondary-300 rounded-lg max-h-24 overflow-y-auto">
                    {tags.slice(0, 20).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.name)}
                        className={`badge ${
                          filters.tags.includes(tag.name)
                            ? 'badge-primary'
                            : 'badge-secondary'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex items-center">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-error-600 hover:text-error-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-secondary-600">
            {totalCount.toLocaleString()} notes found
          </p>
        </div>

        {(filters.subject || filters.tags.length > 0 || filters.premium !== null) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.subject && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm">
                <BookOpen className="w-3.5 h-3.5" />
                {filters.subject}
                <button
                  onClick={() => updateFilters({ subject: null })}
                  className="ml-1 hover:text-primary-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary-100 text-secondary-700 text-sm"
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-secondary-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {filters.premium !== null && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent-100 text-accent-700 text-sm">
                <Crown className="w-3.5 h-3.5" />
                {filters.premium ? 'Premium' : 'Free'}
                <button
                  onClick={() => updateFilters({ premium: null })}
                  className="ml-1 hover:text-accent-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {loading && notes.length === 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : notes.length > 0 ? (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No notes found
            </h3>
            <p className="text-secondary-600 mb-6">
              Try adjusting your filters or search query
            </p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
