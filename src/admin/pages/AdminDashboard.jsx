import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';
import { createGitHubCMS } from '../services/githubCMS';
import { FaFolderOpen, FaFileAlt, FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const { token } = useGitHubAuth();
  const navigate = useNavigate();
  const cms = createGitHubCMS(token);

  const [projects, setProjects] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projectFiles = await cms.listFiles('data/projects');
      const articleFiles = await cms.listFiles('data/articles');

      // Filter only JSON files
      const jsonProjects = projectFiles.filter(f => f.name.endsWith('.json'));
      const jsonArticles = articleFiles.filter(f => f.name.endsWith('.json'));

      // Fetch content for each project JSON to get its metadata
      const loadedProjects = await Promise.all(
        jsonProjects.map(async (file) => {
          const contentObj = await cms.getFile(file.path);
          try {
            const data = JSON.parse(contentObj.content);
            return { ...data, sha: contentObj.sha, path: file.path };
          } catch {
            return { title: file.name.replace('.json', ''), slug: file.name.replace('.json', ''), path: file.path };
          }
        })
      );

      // Fetch content for each article JSON to get its metadata
      const loadedArticles = await Promise.all(
        jsonArticles.map(async (file) => {
          const contentObj = await cms.getFile(file.path);
          try {
            const data = JSON.parse(contentObj.content);
            return { ...data, sha: contentObj.sha, path: file.path };
          } catch {
            return { title: file.name.replace('.json', ''), slug: file.name.replace('.json', ''), path: file.path };
          }
        })
      );

      setProjects(loadedProjects);
      setArticles(loadedArticles);
    } catch (err) {
      console.error('Failed to load portfolio items:', err);
      toast.error('Failed to load assets from repository');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleDelete = async (slug, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action commits directly to GitHub.`)) return;
    
    const loadingToast = toast.loading(`Deleting ${type}...`);
    try {
      const jsonPath = `data/${type}s/${slug}.json`;
      const mdPath = `data/${type}s/${slug}.md`;
      
      await cms.deleteFile(jsonPath, `Delete ${type} config: ${slug}`);
      await cms.deleteFile(mdPath, `Delete ${type} details: ${slug}`);
      
      toast.success(`${type} deleted successfully!`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete ${type}`);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-dark-900 text-slate-200 md:overflow-hidden">
      <Toaster position="bottom-right" />
      <Sidebar />

      <main className="flex-grow p-6 md:p-8 overflow-y-auto w-full">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">Portfolio Overview</h1>
            <p className="text-slate-400">Manage all your projects, research works, and articles securely stored on GitHub.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/projects/new"
              className="btn-primary py-2.5 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:-translate-y-0.5"
            >
              <FaPlus size={12} /> New Project
            </Link>
            <Link
              to="/admin/articles/new"
              className="btn-outline py-2.5 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:-translate-y-0.5"
            >
              <FaPlus size={12} /> New Article
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 border border-white/5 shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-2xl rounded-full"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 font-medium text-sm uppercase tracking-wider">CMS Projects</span>
              <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl"><FaFolderOpen size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? <FaSpinner className="animate-spin text-sm" /> : projects.length}</p>
            <p className="text-xs text-slate-500 mt-2">Saved directly inside repository</p>
          </div>

          <div className="glass-card p-6 border border-white/5 shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-500/5 blur-2xl rounded-full"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 font-medium text-sm uppercase tracking-wider">CMS Articles</span>
              <div className="p-3 bg-secondary-500/10 text-secondary-400 rounded-xl"><FaFileAlt size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? <FaSpinner className="animate-spin text-sm" /> : articles.length}</p>
            <p className="text-xs text-slate-500 mt-2">Draft and published blog items</p>
          </div>

          <div className="glass-card p-6 border border-white/5 shadow relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl rounded-full"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 font-medium text-sm uppercase tracking-wider">Storage Target</span>
              <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/15">Active</span>
            </div>
            <p className="text-lg font-bold text-white truncate">{import.meta.env.VITE_GITHUB_REPO_NAME}</p>
            <p className="text-xs text-slate-500 mt-2 truncate">Branch: {import.meta.env.VITE_GITHUB_REPO_BRANCH || 'main'}</p>
          </div>
        </div>

        {/* Content Lists */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">Fetching dynamic CMS entries...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Projects Table */}
            <div className="glass-card border border-white/5 overflow-hidden shadow">
              <div className="px-6 py-4 border-b border-white/5 bg-dark-800/40 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Dynamic Projects</h2>
                <span className="text-xs text-slate-500 font-medium">{projects.length} Entries found</span>
              </div>
              {projects.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500">
                  No dynamic projects added yet. Click "New Project" to create one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 text-xs uppercase font-medium bg-dark-900/10">
                        <th className="px-6 py-3">Project Title</th>
                        <th className="px-6 py-3">Slug</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {projects.map((proj) => (
                        <tr key={proj.slug} className="hover:bg-white/5 transition-all">
                          <td className="px-6 py-4 font-medium text-white">{proj.title}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">{proj.slug}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${proj.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' : 'bg-primary-500/10 text-primary-400 border-primary-500/10'}`}>
                              {proj.status === 'draft' ? 'Draft' : 'Published'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                            <Link to={`/admin/projects/${proj.slug}`} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg transition" title="Edit"><FaEdit size={14} /></Link>
                            <button onClick={() => handleDelete(proj.slug, 'project')} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition" title="Delete"><FaTrash size={14} /></button>
                            <a href={`/projects/${proj.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg transition" title="Preview Live"><FaExternalLinkAlt size={12} /></a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Articles Table */}
            <div className="glass-card border border-white/5 overflow-hidden shadow">
              <div className="px-6 py-4 border-b border-white/5 bg-dark-800/40 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Dynamic Articles</h2>
                <span className="text-xs text-slate-500 font-medium">{articles.length} Entries found</span>
              </div>
              {articles.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500">
                  No dynamic articles added yet. Click "New Article" to create one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 text-xs uppercase font-medium bg-dark-900/10">
                        <th className="px-6 py-3">Article Title</th>
                        <th className="px-6 py-3">Slug</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {articles.map((art) => (
                        <tr key={art.slug} className="hover:bg-white/5 transition-all">
                          <td className="px-6 py-4 font-medium text-white">{art.title}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">{art.slug}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${art.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' : 'bg-primary-500/10 text-primary-400 border-primary-500/10'}`}>
                              {art.status === 'draft' ? 'Draft' : 'Published'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                            <Link to={`/admin/articles/${art.slug}`} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg transition" title="Edit"><FaEdit size={14} /></Link>
                            <button onClick={() => handleDelete(art.slug, 'article')} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition" title="Delete"><FaTrash size={14} /></button>
                            <a href={`/articles`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg transition" title="Preview Live"><FaExternalLinkAlt size={12} /></a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
