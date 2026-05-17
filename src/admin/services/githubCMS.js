import { Octokit } from '@octokit/rest';

const OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
const REPO = import.meta.env.VITE_GITHUB_REPO_NAME;
const BRANCH = import.meta.env.VITE_GITHUB_REPO_BRANCH || 'main';

export const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

/** Encode a UTF-8 string to base64 safely */
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

export function createGitHubCMS(token) {
  const octokit = new Octokit({ auth: token });

  async function getFile(path) {
    try {
      const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH });
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

  async function upsertFile(path, content, message) {
    const existing = await getFile(path);
    const params = {
      owner: OWNER, repo: REPO, path,
      message,
      content: toBase64(content),
      branch: BRANCH,
    };
    if (existing) params.sha = existing.sha;
    return octokit.repos.createOrUpdateFileContents(params);
  }

  async function deleteFile(path, message) {
    const existing = await getFile(path);
    if (!existing) return;
    return octokit.repos.deleteFile({
      owner: OWNER, repo: REPO, path,
      message, sha: existing.sha, branch: BRANCH,
    });
  }

  async function listFiles(path) {
    try {
      const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH });
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }

  /** Upload binary image (base64 string, no data: prefix) to repo, returns raw URL */
  async function uploadImage(repoPath, base64Content, message) {
    const existing = await getFile(repoPath);
    const params = {
      owner: OWNER, repo: REPO, path: repoPath,
      message, content: base64Content, branch: BRANCH,
    };
    if (existing) params.sha = existing.sha;
    await octokit.repos.createOrUpdateFileContents(params);
    return `${RAW_BASE}/${repoPath}`;
  }

  return { getFile, upsertFile, deleteFile, listFiles, uploadImage };
}
