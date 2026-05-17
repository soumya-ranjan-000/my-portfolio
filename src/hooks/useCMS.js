import { useState, useEffect } from 'react';
import { projectsList } from '../data/projects';

const OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
const REPO = import.meta.env.VITE_GITHUB_REPO_NAME;
const BRANCH = import.meta.env.VITE_GITHUB_REPO_BRANCH || 'main';

const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

export function useCMS() {
  const [projects, setProjects] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Fetch projects list (merged with static projectsList + Vite compiled local data)
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        // 1. Scan and resolve all local JSON projects compiled at build time by Vite
        const localModules = import.meta.glob('../../data/projects/*.json', { eager: true });
        const localList = Object.values(localModules).map(module => module.default || module);

        // 2. Fetch live CMS list from GitHub REST API
        const res = await fetch(`${API_BASE}/contents/data/projects?ref=${BRANCH}&nocache=${Date.now()}`);
        if (!res.ok) throw new Error('CMS API rate limited or offline');

        const files = await res.json();
        const jsonFiles = files.filter(f => f.name.endsWith('.json'));

        const cmsProjects = await Promise.all(
          jsonFiles.map(async (file) => {
            const rawRes = await fetch(`${RAW_BASE}/${file.path}?t=${Date.now()}`);
            return rawRes.json();
          })
        );

        // Filter out drafts
        const publishedCMS = cmsProjects.filter(p => p.status !== 'draft');

        // Merge: Dynamic CMS fetches override/extend local build-time modules
        const merged = [...publishedCMS];
        localList.forEach(localProj => {
          if (!merged.some(p => p.slug === localProj.slug)) {
            merged.push(localProj);
          }
        });

        // Dedup & static fallback
        projectsList.forEach(staticProj => {
          if (!merged.some(p => p.slug === staticProj.slug)) {
            merged.push({ ...staticProj, status: 'published' });
          }
        });

        setProjects(merged.filter(p => p.status !== 'draft'));
      } catch (err) {
        console.warn('Projects CMS Hybrid Fetch Notice:', err.message);
        
        // Fail-safe: Fall back entirely to local Vite compiled list + static fallback
        try {
          const localModules = import.meta.glob('../../data/projects/*.json', { eager: true });
          const localList = Object.values(localModules).map(module => module.default || module);
          
          const merged = [...localList];
          projectsList.forEach(staticProj => {
            if (!merged.some(p => p.slug === staticProj.slug)) {
              merged.push({ ...staticProj, status: 'published' });
            }
          });

          setProjects(merged.filter(p => p.status !== 'draft'));
        } catch (innerErr) {
          setProjects(projectsList.map(p => ({ ...p, status: 'published' })));
        }
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch articles list (merged with Vite compiled local data)
  useEffect(() => {
    const fetchArticles = async () => {
      setLoadingArticles(true);
      try {
        // 1. Scan and resolve all local JSON articles compiled at build time by Vite
        const localModules = import.meta.glob('../../data/articles/*.json', { eager: true });
        const localList = Object.values(localModules).map(module => module.default || module);

        // 2. Fetch live CMS list from GitHub REST API
        const res = await fetch(`${API_BASE}/contents/data/articles?ref=${BRANCH}&nocache=${Date.now()}`);
        if (!res.ok) throw new Error('CMS API rate limited or offline');

        const files = await res.json();
        const jsonFiles = files.filter(f => f.name.endsWith('.json'));

        const cmsArticles = await Promise.all(
          jsonFiles.map(async (file) => {
            const rawRes = await fetch(`${RAW_BASE}/${file.path}?t=${Date.now()}`);
            return rawRes.json();
          })
        );

        // Filter out drafts
        const publishedCMS = cmsArticles.filter(a => a.status !== 'draft');

        // Merge: Dynamic CMS fetches override/extend local build-time modules
        const merged = [...publishedCMS];
        localList.forEach(localArt => {
          if (!merged.some(a => a.slug === localArt.slug)) {
            merged.push(localArt);
          }
        });

        // Sort by publish date (newest first)
        const activeArticles = merged.filter(a => a.status !== 'draft');
        activeArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

        setArticles(activeArticles);
      } catch (err) {
        console.warn('Articles CMS Hybrid Fetch Notice:', err.message);
        
        // Fail-safe: Fall back entirely to local Vite compiled list
        try {
          const localModules = import.meta.glob('../../data/articles/*.json', { eager: true });
          const localList = Object.values(localModules).map(module => module.default || module);
          
          const activeArticles = localList.filter(a => a.status !== 'draft');
          activeArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
          setArticles(activeArticles);
        } catch (innerErr) {
          setArticles([]);
        }
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchArticles();
  }, []);

  return { projects, articles, loadingProjects, loadingArticles };
}

// Fetch markdown content of a project or article
export async function fetchCMSContent(slug, type = 'projects') {
  try {
    const response = await fetch(`${RAW_BASE}/data/${type}/${slug}.md?t=${Date.now()}`);
    if (!response.ok) throw new Error('Not found in CMS');
    return await response.text();
  } catch (err) {
    // Secondary fallback: check local workspace via Vite dev server
    try {
      const localResponse = await fetch(`/data/${type}/${slug}.md`);
      if (localResponse.ok) {
        return await localResponse.text();
      }
    } catch (innerErr) {
      console.warn('Local dev file fetch failed:', innerErr);
    }
    
    // Legacy public folder path backup
    if (type === 'projects') {
      const fallbackResponse = await fetch(`/projects/${slug}.md`);
      if (fallbackResponse.ok) {
        return await fallbackResponse.text();
      }
    }
    throw err;
  }
}
