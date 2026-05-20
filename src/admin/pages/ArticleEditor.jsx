import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MarkdownEditor from '../components/MarkdownEditor';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';
import { storageManager } from '../services/storageManager';
import { FaSave, FaTrash, FaSpinner, FaFileAlt, FaArrowLeft, FaImage } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function ArticleEditor() {
  const { slug: routeSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('target');
  const { token } = useGitHubAuth();

  // Resolve storage target: if editing and target query param exists, use it. Otherwise, use active write target.
  const activeTarget = targetId 
    ? (storageManager.getTargets().find(t => t.id === targetId) || storageManager.getActiveWriteTarget())
    : storageManager.getActiveWriteTarget();

  const cms = storageManager.getStorageCMS(activeTarget, token);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('published'); // 'published' or 'draft'
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && !routeSlug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title, isEdit, routeSlug]);

  // Load existing data if in Edit Mode
  useEffect(() => {
    if (routeSlug && token) {
      const loadArticle = async () => {
        setLoading(true);
        try {
          const jsonPath = `data/articles/${routeSlug}.json`;
          const mdPath = `data/articles/${routeSlug}.md`;

          const jsonFile = await cms.getFile(jsonPath);
          const mdFile = await cms.getFile(mdPath);

          if (jsonFile) {
            const data = JSON.parse(jsonFile.content);
            setTitle(data.title || '');
            setSlug(data.slug || '');
            setExcerpt(data.excerpt || '');
            setCoverImage(data.coverImage || '');
            setStatus(data.status || 'published');
            setTags(data.tags ? data.tags.join(', ') : '');
            setPublishDate(data.publishDate ? data.publishDate.split('T')[0] : new Date().toISOString().split('T')[0]);
            setIsEdit(true);
          }

          if (mdFile) {
            setContent(mdFile.content);
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to load article details');
        } finally {
          setLoading(false);
        }
      };
      loadArticle();
    }
  }, [routeSlug, token]);

  // Upload primary article cover image
  // Upload primary article cover image
  const onImageDrop = async (files) => {
    if (files.length === 0) return;
    const file = files[0];
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    const loadingToast = toast.loading(`Uploading cover image to Public CDN...`);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const rawUrl = await storageManager.uploadMediaToCDN('articles', slug || 'temp', filename, base64, token);
        setCoverImage(rawUrl);
        toast.success('Cover image uploaded to Public CDN successfully!');
      };
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload cover image');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onImageDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  // Calculate read time based on word count
  const calculateReadTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error('Title and Slug are required');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading(`Saving article to ${activeTarget.name}...`);

    try {
      const articleData = {
        id: slug,
        slug,
        title,
        excerpt,
        coverImage,
        status,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: calculateReadTime(content),
        publishDate: new Date(publishDate).toISOString(),
        updatedAt: new Date().toISOString()
      };

      const jsonPath = `data/articles/${slug}.json`;
      const mdPath = `data/articles/${slug}.md`;

      // 1. Save metadata JSON
      await cms.upsertFile(jsonPath, JSON.stringify(articleData, null, 2), `CMS: Update metadata for article ${slug}`);
      
      // 2. Save full markdown details
      await cms.upsertFile(mdPath, content, `CMS: Update details for article ${slug}`);

      toast.success('Article saved successfully!');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to save article to ${activeTarget.name}`);
    } finally {
      toast.dismiss(loadingToast);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-dark-900 text-slate-200 md:overflow-hidden">
      <Toaster position="bottom-right" />
      <Sidebar />

      <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="p-3 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/5 transition"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-2.5">
              <FaFileAlt className="text-secondary-400" size={24} />
              {isEdit ? `Edit Article: ${title}` : 'Create New Article'}
            </h1>
            <p className="text-slate-400 text-sm">Draft a new deep-dive tutorial or blog post saved straight to your storage target: {activeTarget.name}.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-medium">Fetching article from storage target...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Form Card */}
            <div className="glass-card p-6 md:p-8 space-y-6 border border-white/5 shadow-xl">
              {/* Title & Slug */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Article Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article headline..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-secondary-500 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Custom Kebab Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsEdit(true);
                    }}
                    placeholder="kebab-case-slug..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-secondary-500 transition"
                  />
                </div>
              </div>

              {/* Tag inputs & Date / Publish Status */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-300">Publish Date</label>
                  <input
                    type="date"
                    required
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-secondary-500 transition"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-300">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Python, Backend, Tutorial..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-secondary-500 transition"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-300">Visibility Status</label>
                  <div className="flex items-center gap-3 bg-dark-900 border border-white/10 rounded-xl px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${status === 'published' ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('draft')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${status === 'draft' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Article Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Give a quick, high-level summary of the article..."
                  className="w-full h-20 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-secondary-500 transition resize-none"
                />
              </div>

              {/* Drag and Drop Cover Image card */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Cover Image</label>
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div {...getRootProps()} className="md:col-span-2 border-2 border-dashed border-white/10 hover:border-secondary-500/50 bg-dark-900/50 rounded-2xl p-6 text-center cursor-pointer transition">
                    <input {...getInputProps()} />
                    <FaImage className="mx-auto text-slate-500 mb-2" size={30} />
                    <p className="text-white text-sm font-medium">Drag cover image here, or click to browse</p>
                    <p className="text-xs text-slate-500 mt-1">Recommended: 1200x630 (Social Banner style)</p>
                  </div>
                  {coverImage ? (
                    <div className="border border-white/10 rounded-xl overflow-hidden shadow-lg relative aspect-video bg-dark-900">
                      <img src={coverImage} alt="Upload Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="absolute bottom-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg p-2 transition-all"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-white/5 rounded-xl aspect-video bg-dark-900 flex items-center justify-center text-slate-700 italic text-sm">
                      No cover selected
                    </div>
                  )}
                </div>
              </div>

              {/* Rich Markdown Details */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Article Markdown Body</label>
                <MarkdownEditor 
                  value={content} 
                  onChange={setContent} 
                  editorType="article"
                  editorSlug={slug}
                  githubToken={token}
                  cms={cms}
                />
              </div>
            </div>

            {/* Actions Submit */}
            <div className="flex justify-end gap-4 py-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {isEdit ? 'Save Changes' : 'Create Article'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
