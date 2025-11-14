export interface Comment {
  id: string;
  author: string; // "Anonymous" if empty
  content: string;
  createdAt: string; // ISO 8601 date string
}

export interface Post {
  id: string;
  title: string;
  content: string; // Markdown content
  category: string;
  tags: string[];
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  comments: Comment[];
}
