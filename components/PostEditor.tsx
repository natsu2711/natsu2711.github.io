
import React from 'react';
import { useState, useEffect } from 'react';
import { Post } from '../types';
import { parseAndSanitizeMarkdown } from '../utils/markdown';
import { SaveIcon } from './Icons';

interface PostEditorProps {
  postToEdit?: Post | null;
  onSave: (post: Post) => void;
  onCancel: () => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ postToEdit, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState(''); // Stored as a comma-separated string in state

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setCategory(postToEdit.category || 'Uncategorized');
      setTags(postToEdit.tags?.join(', ') || '');
    } else {
      // Reset form for a new post
      setTitle('');
      setContent('');
      setCategory('Uncategorized');
      setTags('');
    }
  }, [postToEdit]);

  useEffect(() => {
    // Re-highlight code blocks when content changes
    setTimeout(() => {
        if (typeof (window as any).hljs !== 'undefined') {
            (window as any).hljs.highlightAll();
        }
    }, 0);
  }, [content]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Title cannot be empty.');
      return;
    }
    const postData: Post = {
      id: postToEdit?.id || `post_${Date.now()}`,
      title: title.trim(),
      content: content,
      category: category.trim() || 'Uncategorized',
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: postToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: postToEdit?.comments || [],
    };
    onSave(postData);
  };
  
  const htmlPreview = parseAndSanitizeMarkdown(content || '> The preview of your post will appear here. Start writing!');

  return (
    <div className="py-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="post-title" className="block text-sm font-medium text-textSecondary mb-1">Post Title</label>
          <input 
            type="text"
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your Awesome Post Title"
            className="block w-full text-2xl font-bold p-2 border-b-2 border-slate-200 focus:border-primary focus:ring-0 outline-none transition bg-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="post-category" className="block text-sm font-medium text-textSecondary mb-1">Category</label>
            <input 
              type="text"
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Tech, Travel"
              className="block w-full p-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>
          <div>
            <label htmlFor="post-tags" className="block text-sm font-medium text-textSecondary mb-1">Tags</label>
            <input 
              type="text"
              id="post-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., react, javascript, css"
              className="block w-full p-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition text-sm"
            />
            <p className="text-xs text-textSecondary mt-1">Separate tags with commas.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[60vh]">
          <div className="flex flex-col">
            <label htmlFor="post-content" className="block text-sm font-medium text-textSecondary mb-2">Markdown Editor</label>
            <textarea 
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story in Markdown..."
              className="flex-grow w-full p-4 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition font-mono text-sm leading-relaxed"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-textSecondary mb-2">Live Preview</label>
            <div className="flex-grow w-full p-4 border border-slate-300 rounded-lg bg-white overflow-y-auto">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-200">
          <button 
            onClick={onCancel}
            className="font-semibold text-secondary px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <SaveIcon />
            {postToEdit ? 'Save Changes' : 'Publish Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
