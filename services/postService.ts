
import { Post } from '../types';
import { postManifest } from '../posts';

/**
 * Parses a raw markdown file string that includes a YAML frontmatter block.
 * @param fileContent The raw string content of the .md file.
 * @param id The identifier for the post (e.g., the filename).
 * @returns A Post object.
 */
const parsePost = (fileContent: string, id: string): Post => {
  const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  
  const frontmatter: { [key: string]: any } = {};
  let content = fileContent;

  if (match) {
    const frontmatterBlock = match[1];
    content = fileContent.substring(match[0].length).trim();
    
    frontmatterBlock.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim();

        // Handle string values that might be quoted
        let parsedValue: any = value.replace(/^['"]|['"]$/g, '');

        // Handle arrays for tags
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          parsedValue = value.substring(1, value.length - 1).split(',').map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
        }
        
        frontmatter[key] = parsedValue;
      }
    });
  }

  const date = frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString();

  return {
    id: id,
    title: frontmatter.title || 'Untitled Post',
    content: content,
    category: frontmatter.category || 'Uncategorized',
    tags: frontmatter.tags || [],
    createdAt: date,
    updatedAt: date, // For a static system, createdAt and updatedAt are the same
    comments: [], // Comments are not supported in this simple file-based system
  };
};


export const getPosts = async (): Promise<Post[]> => {
  const postPromises = postManifest.map(async ({ id, path }) => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.error(`Failed to fetch post: ${path}. Status: ${response.status}`);
        return null;
      }
      const content = await response.text();
      return parsePost(content, id);
    } catch (error) {
      console.error(`Error fetching or parsing post at ${path}:`, error);
      return null;
    }
  });

  const postsOrNull = await Promise.all(postPromises);
  let posts = postsOrNull.filter((post): post is Post => post !== null);
  
  // Sort posts by creation date, newest first
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};