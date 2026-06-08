import React from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Download,
  Eye,
  Bookmark,
  Crown,
  FileText,
  BookOpen,
} from 'lucide-react';
import type { Note } from '../../types';

interface NoteCardProps {
  note: Note;
  showActions?: boolean;
  onSave?: () => void;
}

const subjectIcons: Record<string, React.ReactNode> = {
  calculator: <BookOpen className="w-5 h-5" />,
  default: <FileText className="w-5 h-5" />,
};

export function NoteCard({ note, showActions = true, onSave }: NoteCardProps) {
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'PDF';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const authorName = note.author?.full_name || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <Link to={`/note/${note.id}`} className="block group">
      <article className="card-interactive overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {note.subject && (
                  <span className="badge-primary">
                    {note.subject.name}
                  </span>
                )}
                {note.is_premium && (
                  <span className="badge-accent flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                {note.title}
              </h3>

              {note.description && (
                <p className="text-sm text-secondary-600 line-clamp-2 mb-3">
                  {note.description}
                </p>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="badge-secondary text-xs"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="badge-secondary text-xs">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-secondary-500">
                {note.average_rating !== undefined && note.average_rating !== null && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent-500 fill-accent-500" />
                    {note.average_rating.toFixed(1)}
                    {note.rating_count && (
                      <span className="text-secondary-400">
                        ({note.rating_count})
                      </span>
                    )}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {note.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {note.downloads.toLocaleString()}
                </span>
                {note.file_size && (
                  <span className="text-secondary-400">
                    {formatFileSize(note.file_size)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {note.thumbnail_url ? (
                <img
                  src={note.thumbnail_url}
                  alt={note.title}
                  className="w-24 h-24 object-cover rounded-lg border border-secondary-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border border-primary-200">
                  {subjectIcons[note.subject?.icon || ''] || subjectIcons.default}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-100">
            <div className="flex items-center gap-3">
              {note.author?.avatar_url ? (
                <img
                  src={note.author.avatar_url}
                  alt={authorName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-sm">
                  {authorInitial}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-secondary-900">
                  {authorName}
                </p>
                <p className="text-xs text-secondary-500">
                  {formatDate(note.created_at)}
                </p>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {note.is_premium && note.price > 0 && (
                  <span className="text-sm font-semibold text-accent-600">
                    ${note.price.toFixed(2)}
                  </span>
                )}
                {onSave && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSave();
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      note.is_saved
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600'
                    }`}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${note.is_saved ? 'fill-current' : ''}`}
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
