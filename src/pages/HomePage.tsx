import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Upload,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  ArrowRight,
  Crown,
  FileText,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Code,
  Cog,
  Scale,
  Briefcase,
  Brain,
  Lightbulb,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Note, Subject } from '../types';
import { NoteCard, CardSkeleton } from '../components/ui';

const subjectIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  calculator: Calculator,
  atom: Atom,
  'flask-conical': FlaskConical,
  leaf: Leaf,
  code: Code,
  cog: Cog,
  scale: Scale,
  briefcase: Briefcase,
  brain: Brain,
  'book-open': Lightbulb,
};

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredNotes, setFeaturedNotes] = useState<Note[]>([]);
  const [popularSubjects, setPopularSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [notesResult, subjectsResult] = await Promise.all([
        supabase
          .from('notes')
          .select(
            `*, author:profiles(*), subject:subjects(*), tags:note_tags(tag:tags(*))`
          )
          .eq('status', 'published')
          .order('views', { ascending: false })
          .limit(6),
        supabase.from('subjects').select('*').limit(8),
      ]);

      if (notesResult.data) {
        const processedNotes = notesResult.data.map((note: any) => ({
          ...note,
          tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
        }));
        setFeaturedNotes(processedNotes);
      }

      if (subjectsResult.data) {
        setPopularSubjects(subjectsResult.data);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const stats = [
    { value: '10,000+', label: 'Notes Shared', icon: FileText },
    { value: '5,000+', label: 'Active Learners', icon: Users },
    { value: '50+', label: 'Subjects Covered', icon: BookOpen },
    { value: '4.8', label: 'Average Rating', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
          <img
            src="https://images.pexels.com/photos/256476/pexels-photo-256476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight animate-fade-in">
              Share Knowledge,{' '}
              <span className="text-primary-200">Learn Together</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8 leading-relaxed animate-slide-up">
              Discover and share quality notes with students and professionals
              worldwide. Find study materials for any subject, rate your
              favorites, and build your knowledge library.
            </p>

            <form
              onSubmit={handleSearch}
              className="relative max-w-2xl animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="relative flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes, subjects, topics..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-secondary-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-4 rounded-xl bg-accent-500 text-white font-medium hover:bg-accent-600 transition-colors shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-3 mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span className="text-primary-200 text-sm">Popular:</span>
              {['Calculus', 'Organic Chemistry', 'Python', 'Statistics'].map(
                (term) => (
                  <Link
                    key={term}
                    to={`/browse?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    {term}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-secondary-900">
                  {stat.value}
                </p>
                <p className="text-sm text-secondary-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-secondary-900">
                Browse by Subject
              </h2>
              <p className="text-secondary-600 mt-1">
                Explore notes organized by academic discipline
              </p>
            </div>
            <Link
              to="/subjects"
              className="btn-secondary btn-sm hidden sm:inline-flex"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularSubjects.map((subject, index) => {
              const IconComponent =
                subjectIcons[subject.icon || ''] || BookOpen;
              return (
                <Link
                  key={subject.id}
                  to={`/browse?subject=${encodeURIComponent(subject.name)}`}
                  className="card-interactive p-6 text-center group animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 mb-3 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                    {subject.name}
                  </h3>
                </Link>
              );
            })}
          </div>

          <Link
            to="/subjects"
            className="btn-secondary w-full mt-6 sm:hidden"
          >
            View All Subjects
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-accent-50 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-accent-600" />
                <h2 className="text-2xl font-heading font-bold text-secondary-900">
                  Featured Notes
                </h2>
              </div>
              <p className="text-secondary-600">
                Top-rated notes from our community
              </p>
            </div>
            <Link
              to="/browse?sort=rating"
              className="btn-accent btn-sm hidden sm:inline-flex"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : featuredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNotes.map((note, index) => (
                <div
                  key={note.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <NoteCard note={note} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-600">
                No notes available yet. Be the first to share!
              </p>
              <Link to="/upload" className="btn-primary mt-4">
                Upload Note
              </Link>
            </div>
          )}

          <Link
            to="/browse?sort=rating"
            className="btn-accent w-full mt-6 sm:hidden"
          >
            View All Featured
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold text-secondary-900 mb-4">
                Share Your Knowledge
              </h2>
              <p className="text-secondary-600 mb-6">
                Help others learn by uploading your notes. Whether it's lecture
                summaries, study guides, or research materials, your notes can
                make a difference in someone's learning journey.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  { icon: Upload, text: 'Upload PDFs or text notes easily' },
                  { icon: Star, text: 'Get ratings and feedback from learners' },
                  { icon: TrendingUp, text: 'Track views and downloads' },
                  { icon: Crown, text: 'Premium option to sell your notes' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-success-100 text-success-600 flex items-center justify-center">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-secondary-700">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/upload" className="btn-primary btn-lg">
                Start Uploading
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/4792282/pexels-photo-4792282.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Students studying"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success-100 text-success-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">
                      Popular Notes
                    </p>
                    <p className="text-xs text-secondary-500">
                      2,500+ downloads
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-secondary-400 mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who trust NoteHub for
            their study materials. Create your free account today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary btn-lg">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/browse"
              className="btn-secondary btn-lg bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Browse Notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
