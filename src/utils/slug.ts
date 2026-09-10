/**
 * Converts a wiki-link target or file name into a normalized lowercase slug.
 * Example: "Docker" -> "docker", "Web/React.md" -> "react", "My-Cool Note" -> "my-cool note"
 */
export function slugifyWikiLink(linkText: string): string {
  // Strip optional anchor (e.g. "Docker#Containers" -> "Docker")
  const withoutAnchor = linkText.split('#')[0].trim();
  // Strip directory paths if full path passed (e.g. "Programming/Docker.md" -> "Docker.md")
  const basename = withoutAnchor.split('/').pop() || withoutAnchor;
  // Strip supported document extensions if present
  const cleanName = basename.replace(/\.(?:md|html?)$/i, '');
  return cleanName.toLowerCase().trim();
}

/**
 * Extracts folder path and file basename from a relative repo path.
 * Example: "Programming/Web/React.md" -> { folder: "Programming/Web", name: "React" }
 * Example: "RootNote.md" -> { folder: "", name: "RootNote" }
 * Example: "pages/Dashboard.html" -> { folder: "pages", name: "Dashboard" }
 */
export function parseFilePath(fullPath: string): { folder: string; name: string } {
  const parts = fullPath.split('/');
  const fileName = parts.pop() || fullPath;
  const name = fileName.replace(/\.(?:md|html?)$/i, '');
  const folder = parts.join('/');
  return { folder, name };
}
