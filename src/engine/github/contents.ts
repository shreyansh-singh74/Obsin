import { fetchGitHubApi } from './api';

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch = 'main',
  token?: string
): Promise<{ content: string; sha: string }> {
  // Use raw accept header or contents API
  const endpoint = `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const { data } = await fetchGitHubApi(endpoint, token);

  if (Array.isArray(data)) {
    throw new Error(`Path '${path}' is a directory, not a file.`);
  }

  // GitHub returns base64 encoded content for files in the Contents API
  let content = '';
  if (data.encoding === 'base64' && data.content) {
    // Decode UTF-8 base64 safely in browser
    const cleanBase64 = data.content.replace(/\n/g, '');
    const binaryStr = atob(cleanBase64);
    const bytes = Uint8Array.from(binaryStr, (m) => m.charCodeAt(0));
    content = new TextDecoder().decode(bytes);
  } else if (data.content) {
    content = data.content;
  }

  return {
    content,
    sha: data.sha,
  };
}
