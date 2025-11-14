import React from 'react';
import { Post } from '../types';

type Filter = { type: 'category' | 'tag'; value: string } | null;

interface PostListProps {
  posts: Post[];
  filter: Filter;
  onSelectPost: (post: Post) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, filter, onSelectPost }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.createdAt).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {} as Record<string, Post[]>);

  const sortedYears = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="bg-white p-6 md:p-8 shadow-md rounded-lg">
      {posts.length > 0 ? (
        sortedYears.map(year => (
          <section key={year} className="mb-12 last:mb-0">
            <h2 className="text-4xl font-bold text-dark border-b-2 border-border pb-4 mb-6">{year}</h2>
            <ul className="space-y-4">
              {postsByYear[year].map(post => (
                <li key={post.id} className="flex items-baseline flex-wrap">
                  <span className="text-textSecondary mr-4 tabular-nums">{formatDate(post.createdAt)}</span>
                  <a
                    onClick={() => onSelectPost(post)}
                    className="text-lg text-textPrimary hover:text-accent cursor-pointer transition-colors"
                  >
                    {post.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <div className="text-center p-12">
          <h3 className="text-xl font-medium text-textPrimary">No posts found</h3>
          <p className="text-textSecondary mt-2">
            {filter ? `There are no posts for "${filter.value}".` : 'There are no posts to display.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostList;
