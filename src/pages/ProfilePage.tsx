import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Calendar,
  BookOpen,
  Star,
  Bookmark,
  Eye,
  Download,
  Edit,
  Settings,
  Crown,
  FileText,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Profile, Note, SavedNote } from '../types';
import { NoteCard, CardSkeleton, LoadingState } from '../components/ui';

type Tab = 'notes' | 'saved' | 'about';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile: currentUser } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('notes');
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalViews: 0,
    totalDownloads: 0,
    averageRating: 0,
  });

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: notesData } = await supabase
      .from('notes')
      .select(
        `*, author:profiles(*), subject:subjects(*), tags:note_tags(tag:tags(*))`
      )
      .eq('author_id', userId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (notesData) {
      const processedNotes = notesData.map((note: any) => ({
        ...note,
        tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
      }));
      setNotes(processedNotes);

      const totalViews = processedNotes.reduce(
        (sum: number, note: Note) => sum + note.views,
        0
      );
      const totalDownloads = processedNotes.reduce(
        (sum: number, note: Note) => sum + note.downloads,
        0
      );

      setStats({
        totalNotes: processedNotes.length,
        totalViews,
        totalDownloads,
        averageRating: 0,
      });
    }

    if (isOwnProfile) {
      const { data: savedData } = await supabase
        .from('saved_notes')
        .select(
          `*, note:notes(*, author:profiles(*), subject:subjects(*), tags:note_tags(tag:tags(*)))`
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (savedData) {
        const processedSaved = savedData.map((item: any) => ({
          ...item,
          note: {
            ...item.note,
            tags: item.note?.tags?.map((t: any) => t.tag).filter(Boolean) || [],
          },
        }));
        setSavedNotes(processedSaved);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-16">
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            User not found
          </h2>
          <Link to="/browse" className="btn-primary mt-4">
            Browse Notes
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || 'Anonymous User';

  return (
    <div className="min-h-screen bg-secondary-50 pt-16">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-28 h-28 rounded-full border-4 border-white/30 shadow-xl object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white/20 text-white flex items-center justify-center border-4 border-white/30">
                  <User className="w-12 h-12" />
                </div>
              )}
              {profile.is_premium && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center border-2 border-white shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left text-white">
              <h1 className="text-2xl font-heading font-bold">{displayName}</h1>
              {profile.institution && (
                <p className="text-primary-100 mt-1">{profile.institution}</p>
              )}
              <p className="text-primary-200 text-sm mt-2 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>

            {isOwnProfile && (
              <div className="sm:ml-auto flex gap-3">
                <Link
                  to="/settings"
                  className="btn bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Notes', value: stats.totalNotes, icon: FileText },
            { label: 'Views', value: stats.totalViews.toLocaleString(), icon: Eye },
            { label: 'Downloads', value: stats.totalDownloads.toLocaleString(), icon: Download },
            { label: 'Avg Rating', value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A', icon: Star },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card p-4 text-center bg-white shadow-sm"
            >
              <stat.icon className="w-5 h-5 text-primary-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-secondary-900">{stat.value}</p>
              <p className="text-xs text-secondary-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex border-b border-secondary-200 mb-6">
          {[
            { id: 'notes' as Tab, label: 'Notes', count: notes.length },
            ...(isOwnProfile
              ? [{ id: 'saved' as Tab, label: 'Saved', count: savedNotes.length }]
              : []),
            { id: 'about' as Tab, label: 'About', count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              {tab.id === 'notes' && <BookOpen className="w-4 h-4" />}
              {tab.id === 'saved' && <Bookmark className="w-4 h-4" />}
              {tab.id === 'about' && <User className="w-4 h-4" />}
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'notes' && (
          <div>
            {notes.length > 0 ? (
              <div className="grid gap-6">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-600 mb-4">
                  {isOwnProfile ? "You haven't uploaded any notes yet." : 'No notes uploaded yet.'}
                </p>
                {isOwnProfile && (
                  <Link to="/upload" className="btn-primary">
                    Upload Your First Note
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && isOwnProfile && (
          <div>
            {savedNotes.length > 0 ? (
              <div className="grid gap-6">
                {savedNotes.map((saved) => (
                  saved.note && (
                    <NoteCard key={saved.id} note={saved.note} />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-600 mb-4">No saved notes yet.</p>
                <Link to="/browse" className="btn-primary">
                  Browse Notes
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="card p-6">
            {profile.bio ? (
              <div className="prose prose-secondary max-w-none">
                <p className="text-secondary-600">{profile.bio}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-600">
                  {isOwnProfile
                    ? 'Add a bio to let others know more about you.'
                    : 'No bio provided.'}
                </p>
                {isOwnProfile && (
                  <Link to="/settings" className="btn-primary mt-4">
                    Edit Profile
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
