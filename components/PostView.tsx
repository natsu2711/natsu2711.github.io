
import React from 'react';
import { Post } from '../types';
import { parseAndSanitizeMarkdown } from '../utils/markdown';
import { CalendarIcon, FolderIcon, TagIcon, LeftArrowIcon } from './Icons';

interface PostViewProps {
  post: Post;
  onSelectFilter: (type: 'category' | 'tag', value: string) => void;
  onBack: () => void;
}

const PostView: React.FC<PostViewProps> = ({ post, onSelectFilter, onBack }) => {
  const htmlContent = parseAndSanitizeMarkdown(post.content);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <LeftArrowIcon />
          All Posts
        </button>
      </div>

      <article className="pt-2 pb-8 sm:pb-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-textPrimary leading-tight mb-4">{post.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm text-textSecondary">
            <div className="flex items-center gap-2">
              <CalendarIcon />
              <span>Published on {formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderIcon />
              <button onClick={() => onSelectFilter('category', post.category)} className="font-medium hover:underline hover:text-primary transition-colors">{post.category}</button>
            </div>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <TagIcon />
              {post.tags.map(tag => (
                <button key={tag} onClick={() => onSelectFilter('tag', tag)} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full hover:bg-slate-300 transition-colors">{tag}</button>
              ))}
            </div>
          )}
        </header>
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </>
  );
};

export default PostView;
