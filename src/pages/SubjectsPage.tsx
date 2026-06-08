import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Code,
  Cog,
  Stethoscope,
  Scale,
  Briefcase,
  TrendingUp,
  Brain,
  BookOpenCheck,
  BookText,
  Palette,
  Music,
  Lightbulb,
  FileText,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Subject } from '../types';
import { LoadingState } from '../components/ui';

const subjectIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  calculator: Calculator,
  atom: Atom,
  'flask-conical': FlaskConical,
  leaf: Leaf,
  code: Code,
  cog: Cog,
  stethoscope: Stethoscope,
  scale: Scale,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  brain: Brain,
  'book-open': BookOpenCheck,
  book: BookText,
  palette: Palette,
  music: Music,
  lightbulb: Lightbulb,
};

interface SubjectWithCount extends Subject {
  note_count: number;
}

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);

    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (subjectsData) {
      const subjectsWithCounts = await Promise.all(
        subjectsData.map(async (subject) => {
          const { count } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id)
            .eq('status', 'published');

          return {
            ...subject,
            note_count: count || 0,
          };
        })
      );

      setSubjects(subjectsWithCounts);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-16">
        <LoadingState message="Loading subjects..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 pt-16">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Browse by Subject
          </h1>
          <p className="text-primary-100 max-w-2xl mx-auto">
            Explore notes organized by academic discipline. Find materials for
            your courses and discover new areas of study.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => {
            const IconComponent = subjectIcons[subject.icon || ''] || BookOpen;

            return (
              <Link
                key={subject.id}
                to={`/browse?subject=${encodeURIComponent(subject.name)}`}
                className="card-interactive p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-secondary-500 mt-1">
                      {subject.note_count.toLocaleString()} notes
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600">No subjects available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
