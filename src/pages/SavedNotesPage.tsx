import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { SavedNote } from '../types';
import { NoteCard, CardSkeleton } from '../components/ui';

export function SavedNotesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchSavedNotes();
  }, [user, navigate]);

  const fetchSavedNotes = async () => {
    if (!user) return;

    setLoading(true);

    const { data } = await supabase
      .from('saved_notes')
      .select(
        `*, note:notes(*, author:profiles(*), subject:subjects(*), tags:note_tags(tag:tags(*)))`
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const processedData = data.map((item: any) => ({
        ...item,
        note: {
          ...item.note,
          tags: item.note?.tags?.map((t: any) => t.tag).filter(Boolean) || [],
        },
      }));
      setSavedNotes(processedData);
    }

    setLoading(false);
  };

  const handleUnsave = async (savedId: string) => {
    await supabase.from('saved_notes').delete().eq('id', savedId);
    setSavedNotes((prev) => prev.filter((s) => s.id !== savedId));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-secondary-900">
            Saved Notes
          </h1>
          <p className="text-secondary-600 mt-1">
            Notes you've bookmarked for later
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : savedNotes.length > 0 ? (
          <div className="grid gap-6">
            {savedNotes.map((saved) => (
              saved.note && (
                <div key={saved.id} className="relative">
                  <NoteCard note={saved.note} />
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              No saved notes yet
            </h2>
            <p className="text-secondary-600 mb-6">
              Start exploring and save notes you find interesting
            </p>
            <Link to="/browse" className="btn-primary">
              Browse Notes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
