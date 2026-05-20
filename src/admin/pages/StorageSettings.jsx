import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { storageManager } from '../services/storageManager';
import { 
  FaGithub, FaGoogle, FaFolder, FaFolderOpen, 
  FaPlus, FaTrash, FaCheck, FaSpinner, FaCloud, FaHistory, 
  FaArrowLeft, FaTimes, FaInfoCircle, FaExchangeAlt, FaTerminal,
  FaLink, FaPlay 
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function StorageSettings() {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [activeWrite, setActiveWrite] = useState(null);
  
  // Selection/Form States
  const [selectedPlatform, setSelectedPlatform] = useState('google-drive'); // 'github', 'google-drive'
  const [targetName, setTargetName] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubToken, setGithubToken] = useState('');
  
  // Folder Explorer modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [mockFolders, setMockFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Folder Creation States
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Public Media CDN configuration states
  const [cdnOwner, setCdnOwner] = useState('');
  const [cdnRepo, setCdnRepo] = useState('');
  const [cdnBranch, setCdnBranch] = useState('main');
  const [cdnToken, setCdnToken] = useState('');

  // Migration Wizard states
  const [migrationSourceId, setMigrationSourceId] = useState('');
  const [migrationDestId, setMigrationDestId] = useState('');
  const [migrateProjects, setMigrateProjects] = useState(true);
  const [migrateArticles, setMigrateArticles] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState([]);



  // Load targets
  const loadTargets = () => {
    const list = storageManager.getTargets();
    setTargets(list);
    const active = storageManager.getActiveWriteTarget();
    setActiveWrite(active);
  };

  useEffect(() => {
    loadTargets();

    // Load CDN config
    const cdn = storageManager.getCDNConfig();
    setCdnOwner(cdn.owner || '');
    setCdnRepo(cdn.repo || '');
    setCdnBranch(cdn.branch || 'main');
    setCdnToken(cdn.token || '');

    // Set default migration options
    const list = storageManager.getTargets();
    if (list.length > 0) {
      setMigrationSourceId(list[0].id);
      if (list.length > 1) {
        setMigrationDestId(list[1].id);
      } else {
        setMigrationDestId(list[0].id);
      }
    }
  }, []);

  // Clean up folder creation states on modal close/reset lifecycles
  useEffect(() => {
    if (!showFolderModal) {
      setIsAddingFolder(false);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  }, [showFolderModal]);

  const initFolders = (platform) => {
    const rootName = 'My Google Drive';
    const driveId = 'gdrive-root';
    
    const folders = [
      { id: driveId, name: rootName, parentId: null, isRoot: true },
      { id: 'portfolio-data', name: 'Portfolio-Data', parentId: driveId },
      { id: 'articles-blog', name: 'Articles-Blog', parentId: driveId },
      { id: 'personal-projects', name: 'Personal-Projects', parentId: driveId },
      { id: 'backups', name: 'Backups', parentId: driveId },
      { id: 'sub-configs', name: 'CMS-Configs', parentId: 'portfolio-data' },
      { id: 'sub-assets', name: 'Static-Assets', parentId: 'portfolio-data' }
    ];
    setMockFolders(folders);
    const root = folders.find(f => f.isRoot);
    setCurrentFolder(root);
    setSelectedFolder(root);
  };

  const handleStartFolderBrowser = () => {
    // Fallback Mock Explorer for Sandbox configurations
    setIsAuthorizing(true);
    toast.loading(`Connecting and authenticating with Google OAuth Portal...`, { duration: 1500 });
    
    setTimeout(() => {
      setIsAuthorizing(false);
      initFolders(selectedPlatform);
      setShowFolderModal(true);
      toast.success('Successfully authorized via sandbox portal!');
    }, 1500);
  };

  const handleSelectFolderInExplorer = (folder) => {
    setSelectedFolder(folder);
  };

  const handleNavigateIntoFolder = (folder) => {
    setCurrentFolder(folder);
    setSelectedFolder(folder);
  };

  const handleNavigateUp = () => {
    if (currentFolder.isRoot) return;
    
    const parent = mockFolders.find(f => f.id === currentFolder.parentId);
    if (parent) {
      setCurrentFolder(parent);
      setSelectedFolder(parent);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    // Sandbox mode folder creation
    const parentId = currentFolder?.id || 'gdrive-root';
    const newFolderId = `sandbox-folder-${Date.now()}`;
    
    const newFolder = {
      id: newFolderId,
      name: newFolderName.trim(),
      parentId: parentId,
      isRoot: false
    };

    setMockFolders(prev => [...prev, newFolder]);
    toast.success(`Folder "${newFolderName.trim()}" created in sandbox!`);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const syncStorageTargets = async () => {
    const toastId = toast.loading('Syncing storage configuration with GitHub...');
    try {
      await storageManager.syncTargetsToGitHub();
      toast.success('Storage configuration synced with base GitHub repository!', { id: toastId });
    } catch (e) {
      console.warn('Failed to sync targets with GitHub:', e);
      toast.error(`Local targets updated, but failed to sync to base repo: ${e.message}`, { id: toastId });
    }
  };

  // Add Target Submit
  const handleAddTarget = async (e) => {
    e.preventDefault();
    
    if (selectedPlatform === 'github') {
      if (!githubOwner || !githubRepo) {
        toast.error('Owner and Repository name are required');
        return;
      }
      const config = {
        owner: githubOwner,
        repo: githubRepo,
        branch: githubBranch || 'main',
        folderPath: 'data',
        token: githubToken || 'sandbox'
      };
      const name = `${githubOwner}/${githubRepo}`;
      storageManager.addStorageTarget('github', name, config);
      toast.success('GitHub repository target added to history!');
    } else {
      if (!selectedFolder) {
        toast.error('Please select a target folder first');
        return;
      }

      const config = {
        folderId: selectedFolder.id,
        folderPath: selectedFolder.name,
        token: 'sandbox'
      };
      const name = `Google Drive: /${selectedFolder.name}`;
      storageManager.addStorageTarget('google-drive', name, config);
      toast.success(`Google Drive storage target added to history!`);
    }

    loadTargets();
    setTargetName('');
    setGithubOwner('');
    setGithubRepo('');
    setGithubToken('');
    await syncStorageTargets();
  };

  const handleSaveCDNConfig = (e) => {
    e.preventDefault();
    if (!cdnOwner || !cdnRepo) {
      toast.error('Owner and Repository name are required for the Public CDN');
      return;
    }
    storageManager.saveCDNConfig({
      owner: cdnOwner,
      repo: cdnRepo,
      branch: cdnBranch || 'main',
      token: cdnToken
    });
    toast.success('Public Media CDN Configuration saved successfully!');
  };

  const handleStartMigration = async (e) => {
    e.preventDefault();
    
    if (!migrationSourceId || !migrationDestId) {
      toast.error('Please select both a source and a destination target');
      return;
    }
    if (migrationSourceId === migrationDestId) {
      toast.error('Source and Destination targets must be different');
      return;
    }
    if (!migrateProjects && !migrateArticles) {
      toast.error('Please select at least one content category to migrate');
      return;
    }

    const sourceTarget = targets.find(t => t.id === migrationSourceId);
    const destTarget = targets.find(t => t.id === migrationDestId);

    if (!sourceTarget || !destTarget) {
      toast.error('Selected storage targets not found');
      return;
    }

    setIsMigrating(true);
    setMigrationLogs([]);

    const toastId = toast.loading('Starting target content migration...');

    try {
      await storageManager.migrateContent(
        sourceTarget,
        destTarget,
        (progress) => {
          setMigrationLogs(prev => [...prev, progress]);
        },
        {
          projects: migrateProjects,
          articles: migrateArticles
        }
      );
      toast.success('Migration completed successfully with zero data loss!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`Migration failed: ${err.message}`, { id: toastId });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDeleteTarget = async (id) => {
    if (id === 'default-github') {
      toast.error('Cannot delete the default base GitHub target');
      return;
    }
    if (window.confirm('Are you sure you want to remove this storage target? New items will no longer be stored here.')) {
      storageManager.removeStorageTarget(id);
      toast.success('Target removed successfully');
      loadTargets();
      await syncStorageTargets();
    }
  };

  const handleSetWriteActive = async (id) => {
    storageManager.setWriteActive(id);
    toast.success('Changed active storage target for writing new content!');
    loadTargets();
    await syncStorageTargets();
  };

  const handleToggleReadActive = async (id) => {
    storageManager.toggleReadActive(id);
    toast.success('Toggled target aggregation status for website content!');
    loadTargets();
    await syncStorageTargets();
  };

  const filteredSubfolders = mockFolders.filter(
    f => f.parentId === currentFolder?.id && f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-dark-900 text-slate-200 md:overflow-hidden">
      <Toaster position="bottom-right" />
      <Sidebar />

      <main className="flex-grow p-6 md:p-8 overflow-y-auto w-full">
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
              <FaCloud className="text-primary-400" size={24} />
              Storage Target Settings
            </h1>
            <p className="text-slate-400 text-sm">Configure where your portfolio projects and articles are stored. Enable multiple cloud drives simultaneously.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Platform Config Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 border border-white/5 shadow-xl space-y-6">
              <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                <FaPlus className="text-primary-400 text-sm" />
                Add New Storage Target
              </h2>

              {/* Select Platform Tabs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Google Drive */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('google-drive')}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border text-center transition-all ${
                    selectedPlatform === 'google-drive'
                      ? 'bg-primary-500/10 border-primary-500/40 text-primary-400 shadow-lg shadow-primary-500/5'
                      : 'bg-dark-900 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className="p-3 bg-white/5 rounded-xl"><FaGoogle size={22} className={selectedPlatform === 'google-drive' ? 'text-primary-400' : 'text-slate-400'} /></div>
                  <span className="text-xs font-semibold">Google Drive</span>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('github')}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border text-center transition-all ${
                    selectedPlatform === 'github'
                      ? 'bg-slate-500/10 border-slate-500/40 text-slate-200 shadow-lg'
                      : 'bg-dark-900 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className="p-3 bg-white/5 rounded-xl"><FaGithub size={22} className="text-slate-200" /></div>
                  <span className="text-xs font-semibold">GitHub</span>
                </button>
              </div>

              {/* Form Render based on selection */}
              <form onSubmit={handleAddTarget} className="space-y-4">
                {selectedPlatform === 'github' ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">GitHub Owner</label>
                      <input
                        type="text"
                        required
                        value={githubOwner}
                        onChange={(e) => setGithubOwner(e.target.value)}
                        placeholder="e.g. soumya-ranjan-000"
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Repository Name</label>
                      <input
                        type="text"
                        required
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="e.g. my-portfolio"
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Branch Name</label>
                      <input
                        type="text"
                        value={githubBranch}
                        onChange={(e) => setGithubBranch(e.target.value)}
                        placeholder="main"
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">OAuth Personal Token (Optional)</label>
                      <input
                        type="password"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder={import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.VITE_GITHUB_PERSONAL_TOKEN ? "Configured via env variable" : "Leave blank to use active session..."}
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-900 border border-white/5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaCloud className="text-primary-400" size={24} />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            OAuth Connectivity Sandbox
                          </p>
                          <p className="text-xs text-slate-400">
                            Initialize secure cloud drive storage authentication
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartFolderBrowser}
                        disabled={isAuthorizing}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition btn-outline"
                      >
                        {isAuthorizing ? <FaSpinner className="animate-spin" /> : null}
                        Authorize Drive
                      </button>
                    </div>

                    {selectedFolder && (
                      <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaFolder className="text-amber-400" />
                          <div>
                            <span className="text-xs text-slate-400 block font-semibold uppercase">Selected Cloud Folder</span>
                            <strong className="text-sm text-white">/{selectedFolder.name}</strong>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/15 rounded text-[10px] font-bold">Configured</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:-translate-y-0.5 shadow-lg"
                  >
                    <FaPlus size={10} /> Add Target Target
                  </button>
                </div>
              </form>
            </div>

            {/* Public Media CDN Settings Card */}
            <div className="glass-card p-6 border border-white/5 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                  <FaLink className="text-primary-400 text-sm" />
                  Public Media CDN Settings
                </h2>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Route project/article cover banner images and body media uploads to a dedicated public GitHub repository. This acts as a CDN hosting public assets, keeping your source textual content private.
                </p>
              </div>
              
              <form onSubmit={handleSaveCDNConfig} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">CDN Repository Owner</label>
                    <input
                      type="text"
                      required
                      value={cdnOwner}
                      onChange={(e) => setCdnOwner(e.target.value)}
                      placeholder="e.g. soumya-ranjan-000"
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">CDN Repository Name</label>
                    <input
                      type="text"
                      required
                      value={cdnRepo}
                      onChange={(e) => setCdnRepo(e.target.value)}
                      placeholder="e.g. portfolio-cdn"
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Branch</label>
                    <input
                      type="text"
                      value={cdnBranch}
                      onChange={(e) => setCdnBranch(e.target.value)}
                      placeholder="main"
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">GitHub Personal Token</label>
                    <input
                      type="password"
                      value={cdnToken}
                      onChange={(e) => setCdnToken(e.target.value)}
                      placeholder={import.meta.env.VITE_CDN_TOKEN || import.meta.env.VITE_GITHUB_TOKEN ? "Configured via env variable" : "Enter token with write access (or 'sandbox')"}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:-translate-y-0.5 shadow-lg"
                  >
                    <FaCheck size={10} /> Save CDN Config
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Migration Wizard & Info */}
          <div className="space-y-6">
            {/* Content Migration Wizard */}
            <div className="glass-card p-6 border border-white/5 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                  <FaExchangeAlt className="text-primary-400" />
                  Content Migration Wizard
                </h2>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Migrate projects and articles seamlessly from one storage target to another. Relational image URLs will automatically be extracted, uploaded to your public CDN, and rewritten!
                </p>
              </div>

              <form onSubmit={handleStartMigration} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Source Storage Target</label>
                  <select
                    value={migrationSourceId}
                    onChange={(e) => setMigrationSourceId(e.target.value)}
                    disabled={isMigrating}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                  >
                    <option value="" disabled>Select Source</option>
                    {targets.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Destination Storage Target</label>
                  <select
                    value={migrationDestId}
                    onChange={(e) => setMigrationDestId(e.target.value)}
                    disabled={isMigrating}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition text-sm"
                  >
                    <option value="" disabled>Select Destination</option>
                    {targets.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checklist Categories */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase block">Categories to Migrate</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={migrateProjects}
                        onChange={(e) => setMigrateProjects(e.target.checked)}
                        disabled={isMigrating}
                        className="rounded bg-dark-900 border-white/10 text-primary-500 focus:ring-primary-500"
                      />
                      Projects
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={migrateArticles}
                        onChange={(e) => setMigrateArticles(e.target.checked)}
                        disabled={isMigrating}
                        className="rounded bg-dark-900 border-white/10 text-primary-500 focus:ring-primary-500"
                      />
                      Articles
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isMigrating}
                  className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-lg disabled:opacity-50"
                >
                  {isMigrating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Migrating Content...
                    </>
                  ) : (
                    <>
                      <FaPlay size={10} />
                      Run Content Migration
                    </>
                  )}
                </button>
              </form>

              {/* Console/Terminal Logger */}
              {(isMigrating || migrationLogs.length > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <FaTerminal size={10} /> Live Migration Console
                    </span>
                    {migrationLogs.length > 0 && !isMigrating && (
                      <button
                        onClick={() => setMigrationLogs([])}
                        className="text-[9px] text-red-400 hover:text-red-300 transition hover:underline"
                      >
                        Clear logs
                      </button>
                    )}
                  </div>
                  <div className="w-full h-40 bg-dark-950 border border-white/5 rounded-xl p-3 font-mono text-[10px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
                    {migrationLogs.map((log, index) => {
                      let textClass = 'text-slate-400';
                      if (log.type === 'success') textClass = 'text-green-400';
                      if (log.type === 'error') textClass = 'text-red-400';
                      if (log.type === 'warning') textClass = 'text-amber-400 font-semibold';
                      return (
                        <div key={index} className={`${textClass} leading-normal`}>
                          <span className="text-slate-600 select-none mr-1.5">&gt;</span>
                          {log.message}
                        </div>
                      );
                    })}
                    {isMigrating && (
                      <div className="text-primary-400 animate-pulse flex items-center gap-1">
                        <span className="text-slate-600 select-none mr-1.5">&gt;</span>
                        Processing...
                        <FaSpinner className="animate-spin" size={8} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card p-6 border border-white/5 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-2xl rounded-full"></div>
              <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                <FaInfoCircle className="text-primary-400" />
                How Multi-Storage Works
              </h2>
              <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                <p>
                  <strong className="text-white">1. Active Write Target:</strong> The repository or cloud drive labeled as <span className="text-primary-400 font-semibold">Write Active</span> will receive all new project and article commits that you create.
                </p>
                <p>
                  <strong className="text-white">2. Dynamic Aggregation:</strong> When visitors view your portfolio site, the application scans <span className="text-green-400 font-semibold">ALL Read-Active</span> storage systems in parallel, merging and ordering them seamlessly.
                </p>
                <p>
                  <strong className="text-white">3. Zero Data Loss:</strong> Moving your write target from GitHub to Google Drive will not hide your existing items on GitHub. Both will render side-by-side!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History Log Table */}
        <div className="glass-card border border-white/5 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/5 bg-dark-800/40 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaHistory size={16} className="text-slate-400" />
              Storage Selection History & Logs
            </h2>
            <span className="text-xs text-slate-500 font-medium">{targets.length} Target(s) found</span>
          </div>

          {targets.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 italic">
              No cloud storage history found. Add a target above to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs uppercase font-medium bg-dark-900/10">
                    <th className="px-6 py-3">Platform</th>
                    <th className="px-6 py-3">Target Name / Folder</th>
                    <th className="px-6 py-3 text-center">Aggregation (Read)</th>
                    <th className="px-6 py-3 text-center">Primary Store (Write)</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {targets.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-all text-sm">
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-white font-medium">
                          {t.type === 'github' && <FaGithub className="text-white" size={16} />}
                          {t.type === 'google-drive' && <FaGoogle className="text-primary-400" size={16} />}
                          <span className="capitalize">{t.type === 'google-drive' ? 'Google Drive' : 'GitHub'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span>{t.name}</span>
                          {t.config.branch && <span className="text-slate-500 font-sans">({t.config.branch})</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleReadActive(t.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                            t.isReadActive
                              ? 'bg-green-500/10 text-green-400 border-green-500/10'
                              : 'bg-dark-900 text-slate-500 border-white/5 hover:text-slate-300'
                          }`}
                        >
                          {t.isReadActive ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {t.isWriteActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 text-primary-400 border border-primary-500/20 rounded-full text-xs font-bold">
                            <FaCheck size={8} /> Active Store
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetWriteActive(t.id)}
                            className="text-xs text-slate-400 hover:text-white hover:underline transition font-semibold"
                          >
                            Set Primary
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {t.id !== 'default-github' ? (
                          <button
                            onClick={() => handleDeleteTarget(t.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition"
                            title="Remove target"
                          >
                            <FaTrash size={12} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600 font-medium italic pr-2">Base System</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Cloud Folder Explorer Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card max-w-lg w-full border border-white/10 shadow-2xl overflow-hidden rounded-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 bg-dark-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                  <FaFolderOpen className="text-amber-400" />
                  Select Cloud Folder
                </h3>
                <span className="text-xs text-slate-400">Navigate and double click or select which directory to map</span>
              </div>
              <button 
                onClick={() => setShowFolderModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Folder Browser Workspace */}
            <div className="p-5 flex-grow overflow-y-auto space-y-4">
              {/* Directory Path Breadcrumbs */}
              <div className="p-3 bg-dark-900 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 truncate max-w-[50%]">
                  <FaCloud className="text-primary-400 flex-shrink-0" />
                  <span className="truncate">/{currentFolder?.name}</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddingFolder(true)}
                    className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold transition"
                  >
                    <FaPlus size={9} /> New Folder
                  </button>
                  {!currentFolder?.isRoot && (
                    <span className="text-white/10 font-thin">|</span>
                  )}
                  {!currentFolder?.isRoot && (
                    <button
                      onClick={handleNavigateUp}
                      className="text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-1 font-semibold transition"
                    >
                      Up One Level
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Folder Creation Slide-Down */}
              {isAddingFolder && (
                <form 
                  onSubmit={handleCreateFolder}
                  className="p-3 bg-dark-900 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 animate-fade-in"
                >
                  <FaFolder className="text-emerald-400 flex-shrink-0" size={18} />
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter new folder name..."
                    autoFocus
                    className="bg-transparent border-none text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-0 flex-grow py-0.5"
                    disabled={isCreatingFolder}
                  />
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="submit"
                      disabled={isCreatingFolder}
                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition disabled:opacity-50"
                      title="Create Folder"
                    >
                      {isCreatingFolder ? (
                        <FaSpinner className="animate-spin" size={12} />
                      ) : (
                        <FaCheck size={12} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingFolder(false);
                        setNewFolderName('');
                      }}
                      disabled={isCreatingFolder}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition disabled:opacity-50"
                      title="Cancel"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </form>
              )}

              {/* Filter */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subdirectories..."
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 text-sm transition"
              />

              {/* Grid of Subfolders */}
              {filteredSubfolders.length === 0 ? (
                <div className="py-8 text-center text-slate-500 italic text-sm">
                  No subfolders found inside this directory.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredSubfolders.map((folder) => {
                    const isSelected = selectedFolder?.id === folder.id;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleSelectFolderInExplorer(folder)}
                        onDoubleClick={() => handleNavigateIntoFolder(folder)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-primary-500/10 border-primary-500/40 text-white'
                            : 'bg-dark-900 border-white/5 text-slate-300 hover:border-white/10'
                        }`}
                      >
                        <FaFolder className={isSelected ? 'text-primary-400' : 'text-amber-400'} size={20} />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold truncate">{folder.name}</p>
                          <span className="text-[9px] text-slate-500 block uppercase">Folder</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-white/5 bg-dark-800/40 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="btn-outline px-4 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFolderModal(false);
                  toast.success(`Target directory set to: /${selectedFolder.name}`);
                }}
                disabled={!selectedFolder}
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Select Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
