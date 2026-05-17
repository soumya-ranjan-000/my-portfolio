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

  // Fetch projects list (merged with static projectsList)
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        // Fetch files list in data/projects
        const res = await fetch(`${API_BASE}/contents/data/projects?ref=${BRANCH}&nocache=${Date.now()}`);
        if (!res.ok) throw new Error('CMS path not initialized yet');

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

        // Merge and deduplicate by slug (CMS projects override hardcoded if slugs match)
        const merged = [...publishedCMS];
        projectsList.forEach(staticProj => {
          if (!merged.some(p => p.slug === staticProj.slug)) {
            merged.push({ ...staticProj, status: 'published' });
          }
        });

        setProjects(merged);
      } catch (err) {
        console.warn('CMS Fetch Notice:', err.message);
        // Fallback to static list if CMS folder doesn't exist yet
        setProjects(projectsList.map(p => ({ ...p, status: 'published' })));
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch articles list from GitHub CMS
  useEffect(() => {
    const fetchArticles = async () => {
      setLoadingArticles(true);
      try {
        const res = await fetch(`${API_BASE}/contents/data/articles?ref=${BRANCH}&nocache=${Date.now()}`);
        if (!res.ok) throw new Error('CMS path not initialized yet');

        const files = await res.json();
        const jsonFiles = files.filter(f => f.name.endsWith('.json'));

        const cmsArticles = await Promise.all(
          jsonFiles.map(async (file) => {
            const rawRes = await fetch(`${RAW_BASE}/${file.path}?t=${Date.now()}`);
            return rawRes.json();
          })
        );

        // Filter out drafts
        const publishedArticles = cmsArticles.filter(a => a.status !== 'draft');
        
        // Sort by publish date (newest first)
        publishedArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

        setArticles(publishedArticles);
      } catch (err) {
        console.warn('Articles Fetch Notice:', err.message);
        setArticles([]);
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
    // If not found in CMS and it is a project, try fetching from the local public path
    if (type === 'projects') {
      const fallbackResponse = await fetch(`/projects/${slug}.md`);
      if (fallbackResponse.ok) {
        return await fallbackResponse.text();
      }
    }
    throw err;
  }
}
