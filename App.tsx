
import React from 'react';
import { useState, useEffect } from 'react';
import { Post } from './types';
import { getPosts } from './services/postService';
import PostList from './components/PostList';
import PostView from './components/PostView';
import Header from './components/Header';
import Navbar from './components/Navbar';
import RightSidebar from './components/RightSidebar';
import AboutPage from './components/AboutPage';
import FAQPage from './components/FAQPage';

type View = 'list' | 'viewing' | 'about' | 'faq';
type Filter = { type: 'category' | 'tag'; value: string } | null;

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filter, setFilter] = useState<Filter>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const loadedPosts = await getPosts();
        setPosts(loadedPosts);
      } catch (error) {
        console.error("Failed to load posts:", error);
      }
    };
    loadPosts();
  }, []);

  useEffect(() => {
    // When viewing a post, ensure syntax highlighting is applied
    if (currentView === 'viewing') {
      setTimeout(() => {
        if (typeof (window as any).hljs !== 'undefined') {
          (window as any).hljs.highlightAll();
        }
      }, 0);
    }
  }, [selectedPost, currentView]);

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setCurrentView('viewing');
    window.scrollTo(0, 0);
  };
  
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPost(null);
    setFilter(null);
  };
  
  const handleSetFilter = (type: 'category' | 'tag', value: string) => {
    setFilter({ type, value });
    setCurrentView('list');
    setSelectedPost(null);
  };
  
  const handleSelectView = (view: 'about' | 'faq') => {
    setCurrentView(view);
    setSelectedPost(null);
    setFilter(null);
  }

  const renderContent = () => {
    switch(currentView) {
      case 'viewing':
        return selectedPost ? <PostView 
          post={selectedPost} 
          onSelectFilter={handleSetFilter}
          onBack={handleBackToList}
        /> : null;
      case 'about':
        return <div className="bg-white p-6 md:p-8 shadow-md rounded-lg"><AboutPage /></div>;
      case 'faq':
        return <div className="bg-white p-6 md:p-8 shadow-md rounded-lg"><FAQPage /></div>;
      case 'list':
      default:
        const filteredPosts = filter
        ? posts.filter(post => {
            if (filter.type === 'category') {
              return post.category === filter.value;
            }
            if (filter.type === 'tag') {
              return post.tags.includes(filter.value);
            }
            return false;
          })
        : posts;
        return (
          <PostList 
            posts={filteredPosts}
            filter={filter}
            onSelectPost={handleSelectPost}
          />
        );
    }
  };

  return (
    <div className="font-sans">
      <Header onTitleClick={handleBackToList} />
      <Navbar onSelectFilter={handleSetFilter} onSelectView={handleSelectView} />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <main className="lg:col-span-2">
          {renderContent()}
        </main>
        <aside className="lg:col-span-1 lg:sticky lg:top-8">
          <RightSidebar 
            posts={posts}
            onSelectFilter={handleSetFilter}
          />
        </aside>
      </div>
    </div>
  );
};

export default App;
