import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload as UploadIcon,
  FileText,
  X,
  Plus,
  Crown,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Subject, Tag } from '../types';

export function UploadPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'details' | 'success'>('upload');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    tags: [] as string[],
    institution: '',
    is_premium: false,
    price: '0.00',
  });
  const [newTag, setNewTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const [subjectsResult, tagsResult] = await Promise.all([
        supabase.from('subjects').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
      ]);

      if (subjectsResult.data) setSubjects(subjectsResult.data);
      if (tagsResult.data) setTags(tagsResult.data);
    };

    fetchData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.md')) {
        setError('Please upload a PDF or text file');
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
      if (!validTypes.includes(droppedFile.type) && !droppedFile.name.endsWith('.md')) {
        setError('Please upload a PDF or text file');
        return;
      }

      setFile(droppedFile);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFormData({
      title: '',
      description: '',
      subject_id: '',
      tags: [],
      institution: '',
      is_premium: false,
      price: '0.00',
    });
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
      setStep('details');
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      setUploadProgress(20);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      const fileUrl = uploadData.path;
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'text';

      const noteData = {
        title: formData.title,
        description: formData.description || null,
        file_url: fileUrl,
        file_type: fileType,
        file_size: file.size,
        author_id: user.id,
        subject_id: formData.subject_id || null,
        institution: formData.institution || null,
        is_premium: formData.is_premium,
        price: formData.is_premium ? parseFloat(formData.price) : 0,
        status: 'published',
      };

      const { data: noteResult, error: noteError } = await supabase
        .from('notes')
        .insert(noteData)
        .select()
        .single();

      if (noteError) throw noteError;

      setUploadProgress(80);

      if (formData.tags.length > 0 && noteResult) {
        const tagInserts = [];

        for (const tagName of formData.tags) {
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

          let tagId: string;

          if (existingTag) {
            tagId = existingTag.id;
          } else {
            const { data: newTagData, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tagName })
              .select()
              .single();

            if (tagError) throw tagError;
            tagId = newTagData.id;
          }

          tagInserts.push({
            note_id: noteResult.id,
            tag_id: tagId,
          });
        }

        if (tagInserts.length > 0) {
          await supabase.from('note_tags').insert(tagInserts);
        }
      }

      setUploadProgress(100);
      setStep('success');

      setTimeout(() => {
        navigate(`/note/${noteResult.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-900">
            Upload Note
          </h1>
          <p className="text-secondary-600 mt-2">
            Share your knowledge with the community
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8">
          {['upload', 'details', 'success'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 ${
                  step === s
                    ? 'text-primary-600'
                    : ['upload', 'details', 'success'].indexOf(step) > i
                    ? 'text-success-600'
                    : 'text-secondary-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === s
                      ? 'bg-primary-100 border-2 border-primary-600'
                      : ['upload', 'details', 'success'].indexOf(step) > i
                      ? 'bg-success-100'
                      : 'bg-secondary-100'
                  }`}
                >
                  {['upload', 'details', 'success'].indexOf(step) > i ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm font-medium capitalize hidden sm:inline">
                  {s === 'upload' ? 'Upload File' : s === 'details' ? 'Add Details' : 'Done'}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 ${
                    ['upload', 'details', 'success'].indexOf(step) > i
                      ? 'bg-success-200'
                      : 'bg-secondary-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error-700">{error}</p>
          </div>
        )}

        {step === 'upload' && (
          <div className="card p-8">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-secondary-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!file ? (
                <>
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                    <UploadIcon className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-lg font-medium text-secondary-900 mb-2">
                    Drop your file here
                  </p>
                  <p className="text-secondary-500 mb-4">
                    or click to browse from your device
                  </p>
                  <p className="text-xs text-secondary-400">
                    Supports PDF and text files (max 50MB)
                  </p>
                </>
              ) : (
                <div className="text-left">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-secondary-200">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="p-2 text-secondary-400 hover:text-error-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleContinue}
                disabled={!file}
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="label">
                    Title <span className="text-error-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="input"
                    placeholder="e.g., Calculus I - Derivatives and Integrals"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="input resize-none"
                    placeholder="Describe what this note covers..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="subject" className="label">
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={formData.subject_id}
                      onChange={(e) =>
                        setFormData({ ...formData, subject_id: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="institution" className="label">
                      Institution
                    </label>
                    <input
                      id="institution"
                      type="text"
                      value={formData.institution}
                      onChange={(e) =>
                        setFormData({ ...formData, institution: e.target.value })
                      }
                      className="input"
                      placeholder="e.g., MIT, Stanford"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Tags
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="input flex-1"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary-100 text-secondary-700 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-secondary-500 hover:text-secondary-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-secondary-500 mb-2">
                    Suggested tags:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            tags: prev.tags.includes(tag.name)
                              ? prev.tags
                              : [...prev.tags, tag.name],
                          }))
                        }
                        disabled={formData.tags.includes(tag.name)}
                        className={`badge ${
                          formData.tags.includes(tag.name)
                            ? 'badge-primary'
                            : 'badge-secondary hover:bg-secondary-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Pricing
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary-50 border border-secondary-200">
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={formData.is_premium}
                    onChange={(e) =>
                      setFormData({ ...formData, is_premium: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="is_premium"
                      className="font-medium text-secondary-900 cursor-pointer"
                    >
                      Set as Premium Note
                    </label>
                    <p className="text-sm text-secondary-500">
                      Earn money when others purchase your note
                    </p>
                  </div>
                  <Crown className="w-5 h-5 text-accent-500" />
                </div>

                {formData.is_premium && (
                  <div>
                    <label htmlFor="price" className="label">
                      Price (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        id="price"
                        type="number"
                        min="0.99"
                        step="0.99"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="input pl-10"
                      />
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">
                      You'll receive 70% of each sale
                    </p>
                  </div>
                )}
              </div>
            </div>

            {loading && uploadProgress > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <Loader className="w-5 h-5 text-primary-600 animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">
                      Uploading...
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-secondary-200 overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-secondary-500">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title}
                className="btn-primary flex-1"
              >
                {loading ? 'Uploading...' : 'Publish Note'}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-success-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-secondary-900 mb-2">
              Note Published!
            </h2>
            <p className="text-secondary-600 mb-6">
              Your note has been successfully uploaded and is now available to the
              community.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-secondary-500">
                Redirecting to your note...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
