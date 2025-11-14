
import React from 'react';
import { Post } from '../types';

interface TagsPageProps {
  posts: Post[];
  onSelectTag: (tag: string) => void;
}

const TagsPage: React.FC<TagsPageProps> = ({ posts, onSelectTag }) => {
  const tagCounts = posts.reduce((acc, post) => {
    post.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const sortedTags = Object.entries(tagCounts).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="prose prose-lg max-w-none">
      <div className="text-center">
        <h1 className="text-4xl font-bold !mb-2">Tags</h1>
        <div className="w-24 h-px bg-border mx-auto my-4"></div>
      </div>

      <ul>
        {sortedTags.map(([tag, count]) => (
          <li key={tag}>
            <a onClick={() => onSelectTag(tag)} className="cursor-pointer">
              {tag}
            </a>
            <span className="text-textSecondary ml-1">({count})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagsPage;
