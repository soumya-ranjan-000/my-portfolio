import { Octokit } from '@octokit/rest';

// LocalStorage Keys
const TARGETS_KEY = 'portfolio_cms_storage_targets';
const SANDBOX_STORAGE_KEY = 'portfolio_cms_sandbox_db';
const CDN_CONFIG_KEY = 'portfolio_cms_cdn_config';

// Fallback Default GitHub Config from Env
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER || '';
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO_NAME || '';
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_REPO_BRANCH || 'main';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.VITE_GITHUB_PERSONAL_TOKEN || '';

// Helper to initialize default targets
function initDefaultTargets() {
  const existing = localStorage.getItem(TARGETS_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed.length > 0) {
        // If default target token is empty but GITHUB_TOKEN is set, merge it
        const defaultTarget = parsed.find(t => t.id === 'default-github');
        if (defaultTarget && defaultTarget.config && !defaultTarget.config.token && GITHUB_TOKEN) {
          defaultTarget.config.token = GITHUB_TOKEN;
          localStorage.setItem(TARGETS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse storage targets', e);
    }
  }

  // Create default GitHub target from Env variables
  const defaultGithub = {
    id: 'default-github',
    type: 'github',
    name: GITHUB_REPO ? `${GITHUB_OWNER}/${GITHUB_REPO}` : 'GitHub (Unconfigured)',
    config: {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      folderPath: 'data',
      token: GITHUB_TOKEN || '' // Will use githubAuth hook token dynamically if empty
    },
    isWriteActive: true,
    isReadActive: true,
    createdAt: new Date().toISOString()
  };

  const initial = [defaultGithub];
  localStorage.setItem(TARGETS_KEY, JSON.stringify(initial));
  return initial;
}

// Helper to get all sandboxed files
function getSandboxStore() {
  const data = localStorage.getItem(SANDBOX_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return {};
}

// Helper to save sandbox files
function saveSandboxStore(store) {
  localStorage.setItem(SANDBOX_STORAGE_KEY, JSON.stringify(store));
}

// Initialize mock data in sandbox if empty
function seedSandboxMockData() {
  const store = getSandboxStore();
  
  // Seed sample project and article on Google Drive sandbox if empty
  const gdrivePrefix = 'gdrive-sandbox/data';

  const sampleProject = {
    id: "cloud-adventure",
    slug: "cloud-adventure",
    title: "Cloud Adventure Simulation",
    description: "An advanced cloud migration sandbox developed in collaboration with global cloud platforms.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600",
    github: "https://github.com",
    demo: "https://google.com",
    status: "published",
    tags: ["React", "Cloud Architecture", "Sandbox"],
    updatedAt: new Date().toISOString()
  };

  const sampleArticle = {
    id: "future-of-serverless",
    slug: "future-of-serverless",
    title: "The Future of Serverless Architectures",
    excerpt: "Exploring edge computing, micro-vms, and cold-start mitigations in modern multi-cloud paradigms.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600",
    status: "published",
    tags: ["Serverless", "Edge Computing", "Cloud"],
    readTime: "6 min read",
    publishDate: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Seed GDrive
  if (!store[`${gdrivePrefix}/projects/cloud-adventure.json`]) {
    store[`${gdrivePrefix}/projects/cloud-adventure.json`] = JSON.stringify(sampleProject);
    store[`${gdrivePrefix}/projects/cloud-adventure.md`] = `# Cloud Adventure\n\nThis is a sample project stored inside your **Google Drive** folder target!\n\nIt was dynamically fetched and rendered side-by-side with your existing GitHub files.`;
  }
  if (!store[`${gdrivePrefix}/articles/future-of-serverless.json`]) {
    store[`${gdrivePrefix}/articles/future-of-serverless.json`] = JSON.stringify(sampleArticle);
    store[`${gdrivePrefix}/articles/future-of-serverless.md`] = `# The Future of Serverless Architectures\n\nThis article is stored inside your **Google Drive** storage target!`;
  }

  saveSandboxStore(store);
}

// Seed the sandbox immediately on module load
seedSandboxMockData();

export const storageManager = {
  getCDNConfig() {
    let config = {
      owner: import.meta.env.VITE_CDN_OWNER || GITHUB_OWNER || '',
      repo: import.meta.env.VITE_CDN_REPO || (GITHUB_REPO ? `${GITHUB_REPO}-cdn` : 'portfolio-cdn'),
      branch: import.meta.env.VITE_CDN_BRANCH || 'main',
      token: import.meta.env.VITE_CDN_TOKEN || GITHUB_TOKEN || ''
    };

    const existing = localStorage.getItem(CDN_CONFIG_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        config = {
          owner: parsed.owner || config.owner,
          repo: parsed.repo || config.repo,
          branch: parsed.branch || config.branch,
          token: parsed.token || config.token
        };
      } catch (e) {
        console.error('Failed to parse CDN config', e);
      }
    }
    return config;
  },

  saveCDNConfig(config) {
    localStorage.setItem(CDN_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('portfolio_storage_targets_changed'));
  },

  async uploadMediaToCDN(type, slug, filename, base64Content, activeGithubToken = null) {
    const cdn = this.getCDNConfig();
    let token = cdn.token || activeGithubToken || '';

    // If sandbox / no token, simulate URL
    if (!token || token === 'sandbox') {
      console.warn('No valid GitHub token for CDN upload. Falling back to sandbox/mock data URL.');
      return `data:image/png;base64,${base64Content}`;
    }

    const owner = cdn.owner || GITHUB_OWNER;
    const repo = cdn.repo || 'portfolio-cdn';
    const branch = cdn.branch || 'main';
    const cleanPath = `${type}/${slug}/${filename}`;
    const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;

    const octokit = new Octokit({ auth: token });
    let sha = null;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: cleanPath, ref: branch });
      if (data && !Array.isArray(data)) {
        sha = data.sha;
      }
    } catch (e) {
      // 404 is expected for new uploads
    }

    const params = {
      owner,
      repo,
      path: cleanPath,
      message: `Upload media to CDN: ${cleanPath}`,
      content: base64Content,
      branch
    };
    if (sha) params.sha = sha;

    await octokit.repos.createOrUpdateFileContents(params);
    return `${rawBase}/${cleanPath}`;
  },

  async migrateContent(sourceTarget, destinationTarget, onProgress, options = { projects: true, articles: true }) {
    const log = (msg, type = 'info') => {
      if (onProgress) onProgress({ message: msg, type });
    };

    try {
      log(`Initiating migration from [${sourceTarget.name}] to [${destinationTarget.name}]...`, 'info');
      
      const sourceCMS = this.getStorageCMS(sourceTarget);
      const destCMS = this.getStorageCMS(destinationTarget);
      
      if (!sourceCMS || !destCMS) {
        throw new Error('Failed to initialize source or destination CMS driver');
      }

      // Step 1: Scan projects
      let projectJsonFiles = [];
      if (options.projects) {
        log('Scanning projects inside source target...', 'info');
        let projectFiles = [];
        try {
          projectFiles = await sourceCMS.listFiles('data/projects');
        } catch (err) {
          log(`Warning: Failed to list projects from source: ${err.message}`, 'warning');
        }
        projectJsonFiles = projectFiles.filter(f => f.name.endsWith('.json'));
        log(`Found ${projectJsonFiles.length} projects to migrate.`, 'info');
      }

      // Step 2: Scan articles
      let articleJsonFiles = [];
      if (options.articles) {
        log('Scanning articles inside source target...', 'info');
        let articleFiles = [];
        try {
          articleFiles = await sourceCMS.listFiles('data/articles');
        } catch (err) {
          log(`Warning: Failed to list articles from source: ${err.message}`, 'warning');
        }
        articleJsonFiles = articleFiles.filter(f => f.name.endsWith('.json'));
        log(`Found ${articleJsonFiles.length} articles to migrate.`, 'info');
      }

      const cdnConfig = this.getCDNConfig();
      const defaultToken = localStorage.getItem('portfolio_admin_token') || '';
      const activeGithubToken = cdnConfig.token || defaultToken;

      const isLocalOrOldRepoImage = (url) => {
        if (!url) return false;
        if (url.startsWith('/') || url.startsWith('.') || url.startsWith('public/')) {
          return true;
        }
        if (sourceTarget.type === 'github') {
          const owner = sourceTarget.config.owner;
          const repo = sourceTarget.config.repo;
          if (url.includes(`raw.githubusercontent.com/${owner}/${repo}`)) {
            return true;
          }
        }
        return false;
      };

      const getDownloadUrl = (url) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        let cleanPath = url;
        if (cleanPath.startsWith('.')) {
          cleanPath = cleanPath.replace(/^(\.\.\/)+/, '');
        }
        if (!cleanPath.startsWith('/') && !cleanPath.startsWith('public/')) {
          cleanPath = '/' + cleanPath;
        }
        if (cleanPath.startsWith('/public/')) {
          cleanPath = cleanPath.substring(7);
        }
        if (cleanPath.startsWith('public/')) {
          cleanPath = cleanPath.substring(6);
        }
        if (!cleanPath.startsWith('/')) {
          cleanPath = '/' + cleanPath;
        }
        
        if (sourceTarget.type === 'github') {
          const owner = sourceTarget.config.owner;
          const repo = sourceTarget.config.repo;
          const branch = sourceTarget.config.branch || 'main';
          return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public${cleanPath}`;
        }
        
        return cleanPath;
      };

      const migrateImageToCDN = async (type, slug, originalUrl) => {
        try {
          const cleanUrl = getDownloadUrl(originalUrl);
          log(`Fetching local asset: ${originalUrl}...`, 'info');
          
          const res = await fetch(cleanUrl);
          if (!res.ok) {
            throw new Error(`Failed to fetch media from URL: ${cleanUrl}`);
          }
          const blob = await res.blob();
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          const filename = originalUrl.split('/').pop() || `migrated-asset-${Date.now()}`;
          log(`Uploading ${filename} to Public CDN...`, 'info');
          const newUrl = await this.uploadMediaToCDN(type, slug, filename, base64, activeGithubToken);
          log(`CDN Uploaded: ${newUrl}`, 'success');
          return newUrl;
        } catch (err) {
          log(`Failed to migrate image "${originalUrl}": ${err.message}. Retaining original link.`, 'warning');
          return originalUrl;
        }
      };

      // Step 4: Migrate Projects
      if (options.projects) {
        for (let i = 0; i < projectJsonFiles.length; i++) {
          const file = projectJsonFiles[i];
          const slug = file.name.replace('.json', '');
          log(`[${i + 1}/${projectJsonFiles.length}] Migrating project: ${slug}...`, 'info');
          
          try {
            const jsonFileObj = await sourceCMS.getFile(file.path);
            const mdFileObj = await sourceCMS.getFile(`data/projects/${slug}.md`);

            if (!jsonFileObj) {
              log(`Warning: Project json file empty: ${file.path}`, 'warning');
              continue;
            }

            let projectData = JSON.parse(jsonFileObj.content);
            
            if (projectData.image && isLocalOrOldRepoImage(projectData.image)) {
              const newBannerUrl = await migrateImageToCDN('projects', slug, projectData.image);
              projectData.image = newBannerUrl;
            }

            let mdContent = mdFileObj ? mdFileObj.content : '';
            if (mdContent) {
              const mdImgRegex = /!\[(.*?)\]\((.*?)\)/g;
              let match;
              const matches = [];
              while ((match = mdImgRegex.exec(mdContent)) !== null) {
                matches.push({ full: match[0], alt: match[1], url: match[2] });
              }

              for (const imgMatch of matches) {
                if (isLocalOrOldRepoImage(imgMatch.url)) {
                  const newImgUrl = await migrateImageToCDN('projects', slug, imgMatch.url);
                  mdContent = mdContent.replace(imgMatch.full, `![${imgMatch.alt}](${newImgUrl})`);
                }
              }
            }

            log(`Saving ${slug}.json and ${slug}.md to destination target...`, 'info');
            await destCMS.upsertFile(`data/projects/${slug}.json`, JSON.stringify(projectData, null, 2), `Migrated project ${slug} metadata`);
            if (mdContent) {
              await destCMS.upsertFile(`data/projects/${slug}.md`, mdContent, `Migrated project ${slug} markdown details`);
            }
            log(`Successfully migrated project: ${slug}!`, 'success');
          } catch (err) {
            log(`Failed migrating project ${slug}: ${err.message}`, 'error');
          }
        }
      }

      // Step 5: Migrate Articles
      if (options.articles) {
        for (let i = 0; i < articleJsonFiles.length; i++) {
          const file = articleJsonFiles[i];
          const slug = file.name.replace('.json', '');
          log(`[${i + 1}/${articleJsonFiles.length}] Migrating article: ${slug}...`, 'info');
          
          try {
            const jsonFileObj = await sourceCMS.getFile(file.path);
            const mdFileObj = await sourceCMS.getFile(`data/articles/${slug}.md`);

            if (!jsonFileObj) {
              log(`Warning: Article json file empty: ${file.path}`, 'warning');
              continue;
            }

            let articleData = JSON.parse(jsonFileObj.content);
            
            if (articleData.coverImage && isLocalOrOldRepoImage(articleData.coverImage)) {
              const newCoverUrl = await migrateImageToCDN('articles', slug, articleData.coverImage);
              articleData.coverImage = newCoverUrl;
            }

            let mdContent = mdFileObj ? mdFileObj.content : '';
            if (mdContent) {
              const mdImgRegex = /!\[(.*?)\]\((.*?)\)/g;
              let match;
              const matches = [];
              while ((match = mdImgRegex.exec(mdContent)) !== null) {
                matches.push({ full: match[0], alt: match[1], url: match[2] });
              }

              for (const imgMatch of matches) {
                if (isLocalOrOldRepoImage(imgMatch.url)) {
                  const newImgUrl = await migrateImageToCDN('articles', slug, imgMatch.url);
                  mdContent = mdContent.replace(imgMatch.full, `![${imgMatch.alt}](${newImgUrl})`);
                }
              }
            }

            log(`Saving ${slug}.json and ${slug}.md to destination target...`, 'info');
            await destCMS.upsertFile(`data/articles/${slug}.json`, JSON.stringify(articleData, null, 2), `Migrated article ${slug} metadata`);
            if (mdContent) {
              await destCMS.upsertFile(`data/articles/${slug}.md`, mdContent, `Migrated article ${slug} markdown details`);
            }
            log(`Successfully migrated article: ${slug}!`, 'success');
          } catch (err) {
            log(`Failed migrating article ${slug}: ${err.message}`, 'error');
          }
        }
      }

      log('Migration completed successfully!', 'success');
      return true;
    } catch (err) {
      log(`Migration halted: ${err.message}`, 'error');
      throw err;
    }
  },

  getTargets() {
    return initDefaultTargets();
  },

  saveTargets(targets) {
    localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
    // Dispatch custom event to notify useCMS or other pages
    window.dispatchEvent(new Event('portfolio_storage_targets_changed'));
  },

  addStorageTarget(type, name, config) {
    const targets = this.getTargets();
    
    // Deactivate write on all others if this is set to write active (or if it's the only one)
    const isFirst = targets.length === 0;
    
    const newTarget = {
      id: `${type}-${Date.now()}`,
      type,
      name,
      config,
      isWriteActive: isFirst,
      isReadActive: true,
      createdAt: new Date().toISOString()
    };

    targets.push(newTarget);
    this.saveTargets(targets);
    return newTarget;
  },

  removeStorageTarget(id) {
    if (id === 'default-github') return; // Cannot delete base target
    let targets = this.getTargets();
    const wasWriteActive = targets.find(t => t.id === id)?.isWriteActive;
    
    targets = targets.filter(t => t.id !== id);

    // If we removed the write active target, set default github as write active
    if (wasWriteActive && targets.length > 0) {
      targets[0].isWriteActive = true;
    }

    this.saveTargets(targets);
  },

  setWriteActive(id) {
    const targets = this.getTargets().map(t => ({
      ...t,
      isWriteActive: t.id === id
    }));
    this.saveTargets(targets);
  },

  toggleReadActive(id) {
    const targets = this.getTargets().map(t => {
      if (t.id === id) {
        // Cannot deactivate read on the write active target
        const nextRead = t.isWriteActive ? true : !t.isReadActive;
        return { ...t, isReadActive: nextRead };
      }
      return t;
    });
    this.saveTargets(targets);
  },

  getActiveWriteTarget() {
    const targets = this.getTargets();
    return targets.find(t => t.isWriteActive) || targets[0];
  },

  getAllReadTargets() {
    const targets = this.getTargets();
    return targets.filter(t => t.isReadActive);
  },

  async fetchRemoteTargets() {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/data/storage-targets.json`);
      if (response.ok) {
        const remoteTargets = await response.json();
        if (Array.isArray(remoteTargets)) {
          return remoteTargets;
        }
      }
    } catch (e) {
      console.warn('[StorageManager] Failed to fetch remote storage targets config, using local storage instead:', e);
    }
    return null;
  },

  async syncTargetsToGitHub() {
    const targets = this.getTargets();
    const defaultTarget = targets.find(t => t.id === 'default-github');
    if (!defaultTarget) {
      throw new Error('Default base GitHub target not found. Cannot sync configuration.');
    }

    const token = localStorage.getItem('portfolio_admin_token');
    if (!token || token === 'sandbox') {
      throw new Error('No valid authenticated admin GitHub token found for syncing.');
    }

    // Sanitize targets to avoid committing private OAuth tokens or credentials
    const sanitizedTargets = targets.map(t => {
      const sanitized = { ...t };
      if (sanitized.config) {
        sanitized.config = { ...sanitized.config };
        if ('token' in sanitized.config) {
          sanitized.config.token = ''; // Keep field but strip sensitive data
        }
      }
      return sanitized;
    });

    const cms = this.getStorageCMS(defaultTarget, token);
    await cms.upsertFile(
      'data/storage-targets.json',
      JSON.stringify(sanitizedTargets, null, 2),
      'Sync storage targets configuration'
    );
    console.log('[StorageManager] Storage targets synchronized to base GitHub repository.');
  },

  // Instantiate the CMS client for a target
  getStorageCMS(target, githubTokenOverride = null) {
    const type = target.type;
    const config = target.config;
    let token = type === 'github' ? (githubTokenOverride || config.token) : config.token;

    // Fall back to environment variable token if no token is stored/passed
    const envToken = import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.VITE_GITHUB_PERSONAL_TOKEN || '';
    if (type === 'github' && (!token || token === 'sandbox') && envToken) {
      token = envToken;
    }

    // Determine if we have a fully configured GitHub target (has owner and repo)
    const isGithubConfigured = type === 'github' && (config.owner || GITHUB_OWNER) && (config.repo || GITHUB_REPO);

    // Sandbox (Simulated) CMS Implementation
    if (!isGithubConfigured && (token === 'sandbox' || !token)) {
      const sandboxPrefix = target.id;
      
      return {
        async getFile(path) {
          const store = getSandboxStore();
          const key = `${sandboxPrefix}/${path}`;
          const content = store[key];
          if (content === undefined) return null;
          return {
            content,
            sha: `sandbox-sha-${key}`,
            downloadUrl: `sandbox-download-${key}`
          };
        },

        async upsertFile(path, content, message) {
          const store = getSandboxStore();
          const key = `${sandboxPrefix}/${path}`;
          store[key] = content;
          saveSandboxStore(store);
          return { success: true };
        },

        async deleteFile(path, message) {
          const store = getSandboxStore();
          const key = `${sandboxPrefix}/${path}`;
          delete store[key];
          saveSandboxStore(store);
          return { success: true };
        },

        async listFiles(path) {
          const store = getSandboxStore();
          const folderPrefix = `${sandboxPrefix}/${path}`;
          
          const files = Object.keys(store)
            .filter(key => key.startsWith(folderPrefix))
            .map(key => {
              const filename = key.substring(folderPrefix.length + 1);
              // Avoid listing nested levels as flat
              if (filename.includes('/')) return null;
              return {
                name: filename,
                path: `${path}/${filename}`,
                type: 'file'
              };
            })
            .filter(Boolean);

          return files;
        },

        async uploadImage(repoPath, base64Content, message) {
          const store = getSandboxStore();
          const key = `${sandboxPrefix}/${repoPath}`;
          const dataUrl = `data:image/png;base64,${base64Content}`;
          store[key] = dataUrl;
          saveSandboxStore(store);
          return dataUrl;
        }
      };
    }

    // GitHub Client Driver
    if (type === 'github') {
      const owner = config.owner || GITHUB_OWNER;
      const repo = config.repo || GITHUB_REPO;
      const branch = config.branch || GITHUB_BRANCH;
      const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
      const octokit = (token && token !== 'sandbox')
        ? new Octokit({ auth: token })
        : new Octokit();

      async function getFile(path) {
        try {
          const { data } = await octokit.repos.getContent({ owner, repo, path, ref: branch });
          return {
            content: decodeURIComponent(escape(atob(data.content.replace(/\n/g, '')))),
            sha: data.sha,
            downloadUrl: data.download_url,
          };
        } catch (err) {
          if (err.status === 404) return null;
          throw err;
        }
      }

      return {
        getFile,
        async upsertFile(path, content, message) {
          const existing = await getFile(path);
          const params = {
            owner, repo, path,
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            branch,
          };
          if (existing) params.sha = existing.sha;
          return octokit.repos.createOrUpdateFileContents(params);
        },

        async deleteFile(path, message) {
          const existing = await getFile(path);
          if (!existing) return;
          return octokit.repos.deleteFile({
            owner, repo, path,
            message, sha: existing.sha, branch,
          });
        },

        async listFiles(path) {
          try {
            const { data } = await octokit.repos.getContent({ owner, repo, path, ref: branch });
            return Array.isArray(data) ? data : [];
          } catch { return []; }
        },

        async uploadImage(repoPath, base64Content, message) {
          const existing = await getFile(repoPath);
          const params = {
            owner, repo, path: repoPath,
            message, content: base64Content, branch,
          };
          if (existing) params.sha = existing.sha;
          await octokit.repos.createOrUpdateFileContents(params);
          return `${rawBase}/${repoPath}`;
        }
      };
    }

    // Google Drive Client Driver
    if (type === 'google-drive') {
      const folderId = config.folderId;
      const headers = { Authorization: `Bearer ${token}` };

      // Helper to find file by name in the active folder
      async function findFileId(path) {
        const query = `name = '${path}' and '${folderId}' in parents and trashed = false`;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, { headers });
        if (!res.ok) return null;
        const data = await res.json();
        return data.files?.[0]?.id || null;
      }

      return {
        async getFile(path) {
          const fileId = await findFileId(path);
          if (!fileId) return null;
          
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers });
          if (!res.ok) return null;
          const text = await res.text();
          return {
            content: text,
            sha: fileId,
            downloadUrl: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
          };
        },

        async upsertFile(path, content, message) {
          const fileId = await findFileId(path);
          if (fileId) {
            // Update
            const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
              method: 'PATCH',
              headers: { ...headers, 'Content-Type': 'text/plain' },
              body: content
            });
            return res.json();
          } else {
            // Create metadata first
            const metaRes = await fetch('https://www.googleapis.com/drive/v3/files', {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: path,
                parents: [folderId]
              })
            });
            const meta = await metaRes.json();
            
            // Upload content
            const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${meta.id}?uploadType=media`, {
              method: 'PATCH',
              headers: { ...headers, 'Content-Type': 'text/plain' },
              body: content
            });
            return res.json();
          }
        },

        async deleteFile(path, message) {
          const fileId = await findFileId(path);
          if (!fileId) return;
          await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE',
            headers
          });
        },

        async listFiles(path) {
          // List files in Google Drive nested. In GDrive we flatten it or search with path prefix
          // e.g. path is "data/projects" which is a folder
          // For GDrive, we can structure it so that we list files in a subfolder or matching path name
          const query = `'${folderId}' in parents and name contains '${path}' and trashed = false`;
          const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=100`, { headers });
          if (!res.ok) return [];
          const data = await res.json();
          return (data.files || []).map(f => ({
            name: f.name.split('/').pop(),
            path: f.name,
            type: 'file'
          }));
        },

        async uploadImage(repoPath, base64Content, message) {
          // Upload binary file
          const byteCharacters = atob(base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });

          const metaRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: repoPath,
              parents: [folderId]
            })
          });
          const meta = await metaRes.json();

          await fetch(`https://www.googleapis.com/upload/drive/v3/files/${meta.id}?uploadType=media`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'image/png' },
            body: blob
          });

          // Return a web view link or download link
          return `https://www.googleapis.com/drive/v3/files/${meta.id}?alt=media&key=sandbox`;
        }
      };
    }



    return null;
  }
};
