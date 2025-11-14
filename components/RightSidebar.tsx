
import React from 'react';
import { Post } from '../types';

interface RightSidebarProps {
  posts: Post[];
  onSelectFilter: (type: 'category' | 'tag', value: string) => void;
}

const SidebarWidget: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-4 shadow-md rounded-lg">
    <h3 className="text-lg font-bold text-dark border-b-2 border-accent pb-2 mb-4 uppercase">
      {title}
    </h3>
    {children}
  </div>
);

const RightSidebar: React.FC<RightSidebarProps> = ({ posts, onSelectFilter }) => {

  const categories = [...new Set(posts.map(post => post.category))].sort();

  return (
    <div className="space-y-6">
      <SidebarWidget title="Categories">
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category}>
              <span 
                onClick={() => onSelectFilter('category', category)}
                className="text-textPrimary hover:text-accent cursor-pointer transition-colors"
              >
                {category}
              </span>
            </li>
          ))}
        </ul>
      </SidebarWidget>
    </div>
  );
};

export default RightSidebar;