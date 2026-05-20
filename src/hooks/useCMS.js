import { useState, useEffect } from 'react';
import { projectsList } from '../data/projects';
import { storageManager } from '../admin/services/storageManager';

const OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
const REPO = import.meta.env.VITE_GITHUB_REPO_NAME;
const BRANCH = import.meta.env.VITE_GITHUB_REPO_BRANCH || 'main';

const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

export function useCMS() {
  const [projects, setProjects] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchAllData = async () => {
      if (!active) return;
      setLoadingProjects(true);
      setLoadingArticles(true);

      try {
        // 1. Scan and resolve all local JSON projects compiled at build time by Vite
        let localProjects = [];
        let localArticles = [];
        try {
          const localProjModules = import.meta.glob('../../data/projects/*.json', { eager: true });
          localProjects = Object.values(localProjModules).map(module => module.default || module);
        } catch (e) {
          console.warn('Local projects glob warning:', e);
        }

        try {
          const localArtModules = import.meta.glob('../../data/articles/*.json', { eager: true });
          localArticles = Object.values(localArtModules).map(module => module.default || module);
        } catch (e) {
          console.warn('Local articles glob warning:', e);
        }

        // 2. Fetch live data from ALL active read storage targets (preferring remote targets config if available)
        let readTargets = [];
        try {
          const remoteTargets = await storageManager.fetchRemoteTargets();
          if (remoteTargets && remoteTargets.length > 0) {
            readTargets = remoteTargets.filter(t => t.isReadActive);
          } else {
            readTargets = storageManager.getAllReadTargets();
          }
        } catch (e) {
          readTargets = storageManager.getAllReadTargets();
        }
        const cmsProjects = [];
        const cmsArticles = [];

        await Promise.all(
          readTargets.map(async (target) => {
            try {
              const cms = storageManager.getStorageCMS(target);
              
              // Load projects for this target
              try {
                const files = await cms.listFiles('data/projects');
                const jsonFiles = files.filter(f => f.name.endsWith('.json'));
                const loadedProjects = await Promise.all(
                  jsonFiles.map(async (file) => {
                    try {
                      const fileObj = await cms.getFile(file.path);
                      if (!fileObj) return null;
                      const parsed = JSON.parse(fileObj.content);
                      return {
                        ...parsed,
                        storageSource: target.type,
                        storageTargetId: target.id,
                        storageTargetName: target.name
                      };
                    } catch (e) {
                      return null;
                    }
                  })
                );
                cmsProjects.push(...loadedProjects.filter(Boolean));
              } catch (e) {
                console.warn(`Failed to list projects from target: ${target.name}`, e);
              }

              // Load articles for this target
              try {
                const files = await cms.listFiles('data/articles');
                const jsonFiles = files.filter(f => f.name.endsWith('.json'));
                const loadedArticles = await Promise.all(
                  jsonFiles.map(async (file) => {
                    try {
                      const fileObj = await cms.getFile(file.path);
                      if (!fileObj) return null;
                      const parsed = JSON.parse(fileObj.content);
                      return {
                        ...parsed,
                        storageSource: target.type,
                        storageTargetId: target.id,
                        storageTargetName: target.name
                      };
                    } catch (e) {
                      return null;
                    }
                  })
                );
                cmsArticles.push(...loadedArticles.filter(Boolean));
              } catch (e) {
                console.warn(`Failed to list articles from target: ${target.name}`, e);
              }
            } catch (err) {
              console.error(`Failed loading target ${target.name}:`, err);
            }
          })
        );

        if (!active) return;

        // 3. Merge projects: dynamic CMS fetches override/extend local build-time modules
        const mergedProjects = [...cmsProjects];
        localProjects.forEach(localProj => {
          if (!mergedProjects.some(p => p.slug === localProj.slug)) {
            mergedProjects.push({ ...localProj, storageSource: 'local' });
          }
        });

        // Dedup & static fallback
        projectsList.forEach(staticProj => {
          if (!mergedProjects.some(p => p.slug === staticProj.slug)) {
            mergedProjects.push({ ...staticProj, status: 'published', storageSource: 'static' });
          }
        });

        // Filter out drafts for public viewing
        const publishedProjects = mergedProjects.filter(p => p.status !== 'draft');
        setProjects(publishedProjects);

        // 4. Merge articles: dynamic CMS fetches override/extend local build-time modules
        const mergedArticles = [...cmsArticles];
        localArticles.forEach(localArt => {
          if (!mergedArticles.some(a => a.slug === localArt.slug)) {
            mergedArticles.push({ ...localArt, storageSource: 'local' });
          }
        });

        const activeArticles = mergedArticles.filter(a => a.status !== 'draft');
        activeArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        setArticles(activeArticles);

      } catch (err) {
        console.error('CMS Multi-Target hybrid fetch error:', err);
        // Fail-safe fallbacks
        setProjects(projectsList.map(p => ({ ...p, status: 'published', storageSource: 'static' })));
        setArticles([]);
      } finally {
        if (active) {
          setLoadingProjects(false);
          setLoadingArticles(false);
        }
      }
    };

    fetchAllData();

    // Listen for storage targets changed event to reload automatically
    const handleReload = () => {
      fetchAllData();
    };
    window.addEventListener('portfolio_storage_targets_changed', handleReload);

    return () => {
      active = false;
      window.removeEventListener('portfolio_storage_targets_changed', handleReload);
    };
  }, []);

  return { projects, articles, loadingProjects, loadingArticles };
}

// Fetch markdown content of a project or article, dynamically resolving it across all targets
export async function fetchCMSContent(slug, type = 'projects', targetId = null) {
  // If targetId is provided, fetch specifically from it
  if (targetId) {
    const target = storageManager.getTargets().find(t => t.id === targetId);
    if (target) {
      try {
        const cms = storageManager.getStorageCMS(target);
        const fileObj = await cms.getFile(`data/${type}/${slug}.md`);
        if (fileObj) return fileObj.content;
      } catch (err) {
        console.warn(`Failed to fetch file from target ${targetId}:`, err);
      }
    }
  }

  // Otherwise, automatically scan all read active targets
  let readTargets = [];
  try {
    const remoteTargets = await storageManager.fetchRemoteTargets();
    if (remoteTargets && remoteTargets.length > 0) {
      readTargets = remoteTargets.filter(t => t.isReadActive);
    } else {
      readTargets = storageManager.getAllReadTargets();
    }
  } catch (e) {
    readTargets = storageManager.getAllReadTargets();
  }
  for (const target of readTargets) {
    try {
      const cms = storageManager.getStorageCMS(target);
      const fileObj = await cms.getFile(`data/${type}/${slug}.md`);
      if (fileObj) return fileObj.content;
    } catch (e) {
      // Keep searching next target
    }
  }

  // Fallback to local files
  try {
    const localResponse = await fetch(`/data/${type}/${slug}.md`);
    if (localResponse.ok) {
      return await localResponse.text();
    }
  } catch (innerErr) {
    // Ignore
  }

  // Legacy public folder path backup
  if (type === 'projects') {
    try {
      const fallbackResponse = await fetch(`/projects/${slug}.md`);
      if (fallbackResponse.ok) {
        return await fallbackResponse.text();
      }
    } catch (e) {
      // Ignore
    }
  }

  throw new Error(`Content not found for slug ${slug} in any storage target`);
}
