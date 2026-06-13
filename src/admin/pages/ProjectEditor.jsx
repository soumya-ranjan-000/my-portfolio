import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MarkdownEditor from '../components/MarkdownEditor';
import NotebookFields from '../components/NotebookFields';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';
import { storageManager } from '../services/storageManager';
import { FaSave, FaTrash, FaSpinner, FaFolderOpen, FaArrowLeft, FaImage } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function ProjectEditor() {
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

  const [loading, setLoading] = useState(!!routeSlug);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [github, setGithub] = useState('');
  const [demo, setDemo] = useState('');
  const [status, setStatus] = useState('published'); // 'published' or 'draft'
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [notebooks, setNotebooks] = useState([]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && !routeSlug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title, isEdit, routeSlug]);

  const applyCMSData = (data) => {
    setTitle(data.title || '');
    setSlug(data.slug || '');
    setDescription(data.description || '');
    setImage(data.image || '');
    setGithub(data.github || '');
    setDemo(data.demo || '');
    setStatus(data.status || 'published');
    setTags(data.tags || '');
    setNotebooks(data.notebooks || []);
    setContent(data.content || '');
  };

  // Check for unsaved draft for NEW projects
  useEffect(() => {
    if (!routeSlug) {
      const draftKey = 'project-draft-new';
      const savedDraft = localStorage.getItem(draftKey);
      
      const emptyData = {
        title: '',
        slug: '',
        description: '',
        image: '',
        github: '',
        demo: '',
        status: 'published',
        tags: '',
        notebooks: [],
        content: ''
      };
      setOriginalData(emptyData);

      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || '');
          setSlug(draft.slug || '');
          setDescription(draft.description || '');
          setImage(draft.image || '');
          setGithub(draft.github || '');
          setDemo(draft.demo || '');
          setStatus(draft.status || 'published');
          setTags(draft.tags || '');
          setNotebooks(draft.notebooks || []);
          setContent(draft.content || '');
          setDraftSavedAt(draft.savedAt);
          setHasUnsavedDraft(true);
          toast.success('Restored unsaved draft from browser cache.');
        } catch (e) {
          console.error('Failed to parse draft:', e);
        }
      }
      setIsInitialized(true);
    }
  }, [routeSlug]);

  // Load existing data if in Edit Mode
  useEffect(() => {
    if (routeSlug && token) {
      const loadProject = async () => {
        setLoading(true);
        try {
          const jsonPath = `data/projects/${routeSlug}.json`;
          const mdPath = `data/projects/${routeSlug}.md`;

          const jsonFile = await cms.getFile(jsonPath);
          const mdFile = await cms.getFile(mdPath);

          let cmsData = {
            title: '',
            slug: '',
            description: '',
            image: '',
            github: '',
            demo: '',
            status: 'published',
            tags: '',
            notebooks: [],
            content: ''
          };

          if (jsonFile) {
            const data = JSON.parse(jsonFile.content);
            cmsData.title = data.title || '';
            cmsData.slug = data.slug || '';
            cmsData.description = data.description || '';
            cmsData.image = data.image || '';
            cmsData.github = data.github || '';
            cmsData.demo = data.demo || '';
            cmsData.status = data.status || 'published';
            cmsData.tags = data.tags ? data.tags.join(', ') : '';
            cmsData.notebooks = Array.isArray(data.notebooks) ? data.notebooks : [];
            setIsEdit(true);
          }

          if (mdFile) {
            cmsData.content = mdFile.content;
          }

          setOriginalData(cmsData);

          const draftKey = `project-draft-${routeSlug}`;
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            try {
              const draft = JSON.parse(savedDraft);
              setTitle(draft.title || '');
              setSlug(draft.slug || '');
              setDescription(draft.description || '');
              setImage(draft.image || '');
              setGithub(draft.github || '');
              setDemo(draft.demo || '');
              setStatus(draft.status || 'published');
              setTags(draft.tags || '');
              setNotebooks(draft.notebooks || []);
              setContent(draft.content || '');
              setDraftSavedAt(draft.savedAt);
              setHasUnsavedDraft(true);
              toast.success('Restored unsaved draft from browser cache.');
            } catch (e) {
              console.error('Failed to parse draft:', e);
              applyCMSData(cmsData);
            }
          } else {
            applyCMSData(cmsData);
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to load project details');
        } finally {
          setLoading(false);
          setIsInitialized(true);
        }
      };
      loadProject();
    }
  }, [routeSlug, token]);

  // Auto-save changes to localStorage
  useEffect(() => {
    if (loading || !isInitialized) return;

    const draftKey = routeSlug ? `project-draft-${routeSlug}` : 'project-draft-new';
    
    const isDirty = originalData && (
      title !== originalData.title ||
      slug !== originalData.slug ||
      description !== originalData.description ||
      image !== originalData.image ||
      github !== originalData.github ||
      demo !== originalData.demo ||
      status !== originalData.status ||
      tags !== originalData.tags ||
      content !== originalData.content ||
      JSON.stringify(notebooks) !== JSON.stringify(originalData.notebooks)
    );

    if (isDirty) {
      const draftData = {
        title,
        slug,
        description,
        image,
        github,
        demo,
        status,
        tags,
        notebooks,
        content,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setHasUnsavedDraft(true);
      setDraftSavedAt(draftData.savedAt);
    } else {
      localStorage.removeItem(draftKey);
      setHasUnsavedDraft(false);
    }
  }, [title, slug, description, image, github, demo, status, tags, notebooks, content, loading, isInitialized, routeSlug, originalData]);

  const handleRevertToSaved = () => {
    if (originalData) {
      applyCMSData(originalData);
      const draftKey = routeSlug ? `project-draft-${routeSlug}` : 'project-draft-new';
      localStorage.removeItem(draftKey);
      setHasUnsavedDraft(false);
      setDraftSavedAt(null);
      toast.success('Reverted to saved version');
    }
  };

  const handleDiscardDraft = () => {
    const draftKey = routeSlug ? `project-draft-${routeSlug}` : 'project-draft-new';
    localStorage.removeItem(draftKey);
    setHasUnsavedDraft(false);
    setDraftSavedAt(null);
    
    if (originalData) {
      applyCMSData(originalData);
    } else {
      setTitle('');
      setSlug('');
      setDescription('');
      setImage('');
      setGithub('');
      setDemo('');
      setStatus('published');
      setTags('');
      setNotebooks([]);
      setContent('');
    }
    toast.success('Unsaved draft discarded');
  };

  const formatDraftTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + date.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  // Upload primary banner
  const onImageDrop = async (files) => {
    if (files.length === 0) return;
    const file = files[0];
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    const loadingToast = toast.loading(`Uploading banner image to Public CDN...`);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const rawUrl = await storageManager.uploadMediaToCDN('projects', slug || 'temp', filename, base64, token);
        setImage(rawUrl);
        toast.success('Banner uploaded to Public CDN successfully!');
      };
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload banner');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onImageDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error('Title and Slug are required');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading(`Saving project to ${activeTarget.name}...`);

    try {
      const projectData = {
        id: slug,
        slug,
        title,
        description,
        image,
        github,
        demo,
        status,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        notebooks: notebooks
          .map(notebook => ({
            ...notebook,
            title: notebook.title?.trim() || 'Interactive Notebook',
            embedUrl: notebook.embedUrl?.trim() || '',
            sourceUrl: notebook.sourceUrl?.trim() || '',
            description: notebook.description?.trim() || ''
          }))
          .filter(notebook => notebook.embedUrl || notebook.sourceUrl),
        updatedAt: new Date().toISOString()
      };

      const jsonPath = `data/projects/${slug}.json`;
      const mdPath = `data/projects/${slug}.md`;

      // 1. Save metadata JSON
      await cms.upsertFile(jsonPath, JSON.stringify(projectData, null, 2), `CMS: Update metadata for project ${slug}`);
      
      // 2. Save full markdown details
      await cms.upsertFile(mdPath, content, `CMS: Update details for project ${slug}`);
      if (cms.syncDirectoryIndex) {
        await cms.syncDirectoryIndex('data/projects');
      }

      // Clear unsaved draft from localStorage
      const draftKey = routeSlug ? `project-draft-${routeSlug}` : 'project-draft-new';
      localStorage.removeItem(draftKey);
      if (!routeSlug) {
        localStorage.removeItem('project-draft-new');
      }

      toast.success('Project saved successfully!');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to save project to ${activeTarget.name}`);
    } finally {
      toast.dismiss(loadingToast);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-dark-900 text-slate-200 md:overflow-hidden">
      <Toaster position="bottom-right" />
      <Sidebar />

      <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-full w-full">
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
              <FaFolderOpen className="text-primary-400" size={24} />
              {isEdit ? `Edit Project: ${title}` : 'Create New Project'}
            </h1>
            <p className="text-slate-400 text-sm">Fill in the fields to generate files inside your storage target: {activeTarget.name}.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-medium">Fetching details from storage target...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {hasUnsavedDraft && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-5 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">⚠️ Draft Restored:</span>
                  <span>You have unsaved changes from browser cache (saved at {formatDraftTime(draftSavedAt)}).</span>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={handleRevertToSaved}
                    className="px-3 py-1.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-semibold transition-all duration-200"
                  >
                    Revert to Saved
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-transparent transition-all duration-200"
                  >
                    Discard Draft
                  </button>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="glass-card p-6 md:p-8 space-y-6 border border-white/5 shadow-xl">
              {/* Title & Slug */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Project Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition"
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
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition"
                  />
                </div>
              </div>

              {/* Tag inputs & Publish Status */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Tags / Languages (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="React, Playwright, Node.js..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Visibility Status</label>
                  <div className="flex items-center gap-3 bg-dark-900 border border-white/10 rounded-xl px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${status === 'published' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' : 'text-slate-500 hover:text-slate-300'}`}
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

              {/* Links */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">GitHub URL</label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Live Demo URL</label>
                  <input
                    type="url"
                    value={demo}
                    onChange={(e) => setDemo(e.target.value)}
                    placeholder="https://my-app.vercel.app..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Short Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the core features of the project in 1-2 sentences..."
                  className="w-full h-24 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition resize-none"
                />
              </div>

              {/* Drag and Drop Banner Image card */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Project Card Banner Image</label>
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div {...getRootProps()} className="md:col-span-2 border-2 border-dashed border-white/10 hover:border-primary-500/50 bg-dark-900/50 rounded-2xl p-6 text-center cursor-pointer transition">
                    <input {...getInputProps()} />
                    <FaImage className="mx-auto text-slate-500 mb-2" size={30} />
                    <p className="text-white text-sm font-medium">Drag banner image here, or click to browse</p>
                    <p className="text-xs text-slate-500 mt-1">Recommended dimension: 800x450 (16:9)</p>
                  </div>
                  {image ? (
                    <div className="border border-white/10 rounded-xl overflow-hidden shadow-lg relative aspect-video bg-dark-900">
                      <img src={image} alt="Upload Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute bottom-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg p-2 transition-all"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-white/5 rounded-xl aspect-video bg-dark-900 flex items-center justify-center text-slate-700 italic text-sm">
                      No banner selected
                    </div>
                  )}
                </div>
              </div>

              {/* Rich Markdown Details */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Project Details (Markdown Content)</label>
                <MarkdownEditor 
                  value={content} 
                  onChange={setContent} 
                  editorType="project"
                  editorSlug={slug}
                  githubToken={token}
                  cms={cms}
                />
              </div>

              <NotebookFields notebooks={notebooks} onChange={setNotebooks} accent="primary" />
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
                {isEdit ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
