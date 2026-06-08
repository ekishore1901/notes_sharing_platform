import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Download,
  Bookmark,
  Share2,
  Calendar,
  Eye,
  FileText,
  User,
  ArrowLeft,
  Crown,
  Send,
  ThumbsUp,
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Note, Comment, Rating } from '../types';
import { Modal, LoadingState } from '../components/ui';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [note, setNote] = useState<Note | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [ratingHover, setRatingHover] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNote();
      incrementViews();
    }
  }, [id]);

  const fetchNote = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('notes')
      .select(
        `*, author:profiles(*), subject:subjects(*), tags:note_tags(tag:tags(*))`
      )
      .eq('id', id)
      .single();

    if (fetchError || !data) {
      setError('Note not found');
      setLoading(false);
      return;
    }

    const processedNote = {
      ...data,
      tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    };
    setNote(processedNote);

    if (user) {
      const [ratingResult, savedResult] = await Promise.all([
        supabase
          .from('ratings')
          .select('rating')
          .eq('note_id', id)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('saved_notes')
          .select('id')
          .eq('note_id', id)
          .eq('user_id', user.id)
          .single(),
      ]);

      if (ratingResult.data) {
        setUserRating(ratingResult.data.rating);
      }
      setIsSaved(!!savedResult.data);
    }

    const { data: commentsData } = await supabase
      .from('comments')
      .select(`*, user:profiles(*)`)
      .eq('note_id', id)
      .order('created_at', { ascending: true });

    if (commentsData) {
      const organizedComments = organizeComments(commentsData);
      setComments(organizedComments);
    }

    setLoading(false);
  };

  const organizeComments = (flatComments: any[]): Comment[] => {
    const map = new Map<string, Comment>();
    const roots: Comment[] = [];

    flatComments.forEach((c) => {
      map.set(c.id, { ...c, replies: [] });
    });

    flatComments.forEach((c) => {
      const comment = map.get(c.id)!;
      if (c.parent_id && map.has(c.parent_id)) {
        const parent = map.get(c.parent_id)!;
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    return roots;
  };

  const incrementViews = async () => {
    await supabase.rpc('increment_note_views', { note_id: id });
  };

  const handleRating = async (rating: number) => {
    if (!user || !note) return;

    setUserRating(rating);

    await supabase.from('ratings').upsert(
      {
        note_id: note.id,
        user_id: user.id,
        rating,
      },
      {
        onConflict: 'note_id,user_id',
      }
    );
  };

  const handleSave = async () => {
    if (!user || !note) return;

    if (isSaved) {
      await supabase
        .from('saved_notes')
        .delete()
        .match({ note_id: note.id, user_id: user.id });
      setIsSaved(false);
    } else {
      await supabase.from('saved_notes').insert({
        note_id: note.id,
        user_id: user.id,
      });
      setIsSaved(true);
    }
  };

  const handleDownload = async () => {
    if (!note || !note.file_url) return;

    if (note.is_premium && note.price > 0) {
      if (!user) {
        navigate('/signin');
        return;
      }

      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('note_id', note.id)
        .eq('user_id', user.id)
        .single();

      if (!purchase) {
        setError('Please purchase this note before downloading');
        return;
      }
    }

    const { data: urlData } = supabase.storage
      .from('notes')
      .getPublicUrl(note.file_url);

    if (urlData?.publicUrl) {
      window.open(urlData.publicUrl, '_blank');

      await supabase.rpc('increment_note_downloads', { note_id: note.id });
    }
  };

  const handleComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!user || !note || !commentText.trim()) return;

    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({
        note_id: note.id,
        user_id: user.id,
        content: commentText.trim(),
        parent_id: parentId || null,
      })
      .select(`*, user:profiles(*)`)
      .single();

    if (!error && newComment) {
      setCommentText('');
      setReplyingTo(null);
      fetchNote();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    await supabase.from('comments').delete().eq('id', commentId);
    fetchNote();
  };

  const handleDeleteNote = async () => {
    if (!user || !note || note.author_id !== user.id) return;

    await supabase.from('notes').delete().eq('id', note.id);
    navigate('/profile/' + user.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-16">
        <LoadingState message="Loading note..." />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            {error || 'Note not found'}
          </h2>
          <Link to="/browse" className="btn-primary mt-4">
            Browse Notes
          </Link>
        </div>
      </div>
    );
  }

  const authorName = note.author?.full_name || 'Anonymous';
  const isAuthor = user?.id === note.author_id;

  return (
    <div className="min-h-screen bg-secondary-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost text-secondary-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {note.subject && (
                      <span className="badge-primary">{note.subject.name}</span>
                    )}
                    {note.is_premium && (
                      <span className="badge-accent flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900 mb-3">
                    {note.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-500">
                    <div className="flex items-center gap-2">
                      {note.author?.avatar_url ? (
                        <img
                          src={note.author.avatar_url}
                          alt={authorName}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                          <User className="w-3 h-3" />
                        </div>
                      )}
                      <Link
                        to={`/profile/${note.author_id}`}
                        className="hover:text-primary-600"
                      >
                        {authorName}
                      </Link>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(note.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {note.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {note.downloads.toLocaleString()} downloads
                    </span>
                  </div>
                </div>

                {isAuthor && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 rounded-lg hover:bg-secondary-100"
                    >
                      <MoreVertical className="w-5 h-5 text-secondary-500" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1">
                        <Link
                          to={`/edit/${note.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowDeleteModal(true);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {note.description && (
                <div className="prose prose-secondary max-w-none mb-6">
                  <p className="text-secondary-600 leading-relaxed">
                    {note.description}
                  </p>
                </div>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {note.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/browse?tags=${tag.name}`}
                      className="badge-secondary hover:bg-secondary-200"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {note.institution && (
                <p className="text-sm text-secondary-500">
                  Institution: {note.institution}
                </p>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Document Preview
                </h2>
                {note.file_type === 'pdf' && (
                  <span className="badge-primary">PDF</span>
                )}
              </div>

              <div className="bg-secondary-100 rounded-xl aspect-[4/3] flex items-center justify-center">
                {note.file_url ? (
                  <div className="text-center p-8">
                    <FileText className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-600 mb-4">
                      Preview not available
                    </p>
                    <button
                      onClick={handleDownload}
                      className="btn-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download to View
                    </button>
                  </div>
                ) : (
                  <p className="text-secondary-400">No file attached</p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({comments.length})
              </h2>

              {user ? (
                <form
                  onSubmit={(e) => handleComment(e)}
                  className="flex gap-3 mb-6"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="input flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="btn-primary"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-secondary-50 rounded-lg text-center">
                  <p className="text-secondary-600">
                    <Link to="/signin" className="text-primary-600 hover:underline">
                      Sign in
                    </Link>{' '}
                    to leave a comment
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    userId={user?.id}
                    onReply={(id) => setReplyingTo(id)}
                    onDelete={handleDeleteComment}
                    replyingTo={replyingTo}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    onSubmit={handleComment}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Rating
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
                  <span className="font-semibold">
                    {note.average_rating?.toFixed(1) || 'N/A'}
                  </span>
                  {note.rating_count && (
                    <span className="text-sm text-secondary-500">
                      ({note.rating_count})
                    </span>
                  )}
                </div>
              </div>

              {user ? (
                <div className="mb-6">
                  <p className="text-sm text-secondary-600 mb-2">
                    {userRating > 0
                      ? `You rated: ${userRating}/5`
                      : 'Rate this note'}
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            (ratingHover || userRating) >= star
                              ? 'text-accent-500 fill-accent-500'
                              : 'text-secondary-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-secondary-600 mb-6">
                  <Link to="/signin" className="text-primary-600 hover:underline">
                    Sign in
                  </Link>{' '}
                  to rate this note
                </p>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="btn-primary w-full btn-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {note.is_premium && note.price > 0
                    ? `$${note.price.toFixed(2)} - Download`
                    : 'Download'}
                </button>

                <button
                  onClick={handleSave}
                  className={`btn w-full btn-lg ${
                    isSaved
                      ? 'bg-primary-50 text-primary-600 border-2 border-primary-600'
                      : 'btn-secondary'
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current' : ''}`}
                  />
                  {isSaved ? 'Saved' : 'Save Note'}
                </button>

                <button className="btn-secondary w-full">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </button>
              </div>

              {note.is_premium && note.price > 0 && (
                <div className="mt-6 p-4 bg-accent-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-accent-600" />
                    <span className="font-medium text-accent-900">
                      Premium Note
                    </span>
                  </div>
                  <p className="text-sm text-accent-700">
                    Purchase to download and access full content. Creator
                    receives 70% of the sale.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h4 className="text-sm font-medium text-secondary-900 mb-3">
                  Uploaded by
                </h4>
                <Link
                  to={`/profile/${note.author_id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  {note.author?.avatar_url ? (
                    <img
                      src={note.author.avatar_url}
                      alt={authorName}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-secondary-900">
                      {authorName}
                    </p>
                    {note.author?.institution && (
                      <p className="text-sm text-secondary-500">
                        {note.author.institution}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Note"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Are you sure you want to delete this note? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteNote}
              className="btn flex-1 bg-error-600 text-white hover:bg-error-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CommentItem({
  comment,
  userId,
  onReply,
  onDelete,
  replyingTo,
  commentText,
  setCommentText,
  onSubmit,
  depth = 0,
}: {
  comment: Comment;
  userId?: string;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  replyingTo: string | null;
  commentText: string;
  setCommentText: (text: string) => void;
  onSubmit: (e: React.FormEvent, parentId?: string) => void;
  depth?: number;
}) {
  const [showReplies, setShowReplies] = useState(true);
  const isAuthor = userId === comment.user_id;
  const userName = comment.user?.full_name || 'Anonymous';
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        {comment.user?.avatar_url ? (
          <img
            src={comment.user.avatar_url}
            alt={userName}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-500 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-secondary-900">{userName}</span>
            <span className="text-xs text-secondary-400">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-secondary-600 text-sm">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            {userId && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-xs text-secondary-500 hover:text-primary-600"
              >
                Reply
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-secondary-500 hover:text-error-600"
              >
                Delete
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <form
              onSubmit={(e) => onSubmit(e, comment.id)}
              className="flex gap-2 mt-3"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a reply..."
                className="input flex-1 text-sm py-2"
              />
              <button type="submit" className="btn-primary btn-sm">
                Reply
              </button>
            </form>
          )}

          {hasReplies && showReplies && (
            <div className="mt-3">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  userId={userId}
                  onReply={onReply}
                  onDelete={onDelete}
                  replyingTo={replyingTo}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  onSubmit={onSubmit}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
