import React, { useState, useRef } from 'react';
import { hc } from 'hono/client';
import type { App } from '../pages/api/[...path]';
import 'zenn-content-css';

const MarkdownEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [draft, setDraft] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [slug, setSlug] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hono client for typed API calls
  const client = hc<App>(typeof window !== 'undefined' ? window.location.origin : '');

  // Auto-generate slug from title
  React.useEffect(() => {
    if (title && !slug) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      setSlug(autoSlug);
    }
  }, [title, slug]);

  // Handle tag input
  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !description.trim()) {
      alert('Please enter title, content, and description');
      return;
    }

    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    try {
      const response = await client.api['admin']['posts'].$post({
        json: {
          title,
          content,
          description,
          slug: finalSlug,
          tags: tags.length > 0 ? tags : ['others'],
          draft,
          featured,
          pubDatetime: new Date().toISOString(),
        }
      });

      if (response.ok) {
        alert('Post saved successfully!');
        // Reset form
        setTitle('');
        setContent('');
        setDescription('');
        setTags([]);
        setSlug('');
        setDraft(true);
        setFeatured(false);
      } else {
        alert('Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    }
  };

  const handleTogglePreview = async () => {
    if (!isPreview) {
      // Switching to preview mode
      try {
        const response = await client.api['render-markdown'].$post({
          json: { markdown: content }
        });
        
        if (response.ok) {
          const result = await response.json();
          setPreviewHtml(result.html);
        }
      } catch (error) {
        console.error('Failed to render markdown:', error);
        // Fallback rendering
        const html = content
          .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
          .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
          .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-2">$1</h3>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
          .replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-1 rounded">$1</code>')
          .replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4">')
          .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" class="text-blue-600 underline">$1</a>')
          .replace(/\n/gim, '<br>');
        setPreviewHtml(html);
      }
    }
    setIsPreview(!isPreview);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.api['admin']['images'].$post({
        form: formData
      });

      if (response.ok) {
        const result = await response.json();
        const imageMarkdown = `![${file.name}](${result.url})\n`;
        setContent(prev => prev + imageMarkdown);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }

    if (event.target) {
      event.target.value = '';
    }
  };

  // Keyboard shortcut for save
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Toggle metadata with Ctrl+M
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        setShowMetadata(!showMetadata);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [title, content, description, tags, draft, featured, slug, showMetadata]);

  return (
    <div className="min-h-screen bg-skin-fill">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-skin-fill/95 backdrop-blur-sm border-b border-skin-line">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-skin-base">Blog Editor</h1>
            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${draft ? 'bg-skin-accent/60' : 'bg-skin-base/30'}`}></div>
              <span className="text-sm text-skin-base/60">
                {title || "Untitled"} • {content.length} chars • {draft ? 'Draft' : 'Published'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Save Button */}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-skin-accent text-skin-inverted rounded-lg hover:bg-skin-accent/90 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Save
            </button>
            
            {/* Mode Toggle */}
            <div className="flex items-center bg-skin-card rounded-lg p-1 border border-skin-line">
              <button
                onClick={handleTogglePreview}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isPreview 
                    ? 'bg-skin-accent text-skin-inverted shadow-sm' 
                    : 'text-skin-base hover:text-skin-accent'
                }`}
              >
                Edit
              </button>
              <button
                onClick={handleTogglePreview}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isPreview 
                    ? 'bg-skin-accent text-skin-inverted shadow-sm' 
                    : 'text-skin-base hover:text-skin-accent'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Metadata Sidebar/Modal */}
        {showMetadata && (
          <>
            {/* Mobile Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMetadata(false)}
            />
            
            {/* Sidebar/Modal */}
            <div className="w-full md:w-80 md:relative fixed inset-0 md:inset-auto z-50 md:z-auto bg-skin-card border-r border-skin-line md:border-r md:border-l-0 overflow-y-auto max-h-screen md:max-h-[calc(100vh-80px)]">
              <div className="p-6">
                {/* Header with close button for mobile */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-skin-base">Post Settings</h2>
                  <button
                    onClick={() => setShowMetadata(false)}
                    className="md:hidden w-8 h-8 flex items-center justify-center text-skin-base hover:text-skin-accent rounded-lg hover:bg-skin-fill transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
            
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-skin-base mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your post..."
                className="w-full h-20 px-3 py-2 text-sm text-skin-base placeholder-text-skin-base/40 bg-skin-fill border border-skin-line rounded-lg focus:outline-none focus:border-skin-accent resize-none"
              />
            </div>

            {/* Slug */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-skin-base mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-title"
                className="w-full px-3 py-2 text-sm text-skin-base placeholder-text-skin-base/40 bg-skin-fill border border-skin-line rounded-lg focus:outline-none focus:border-skin-accent"
              />
              <p className="text-xs text-skin-base/50 mt-1">Leave empty to auto-generate from title</p>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-skin-base mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-skin-accent/20 text-skin-accent text-xs rounded-md"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-skin-accent/80"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                placeholder="Type tag and press Enter"
                className="w-full px-3 py-2 text-sm text-skin-base placeholder-text-skin-base/40 bg-skin-fill border border-skin-line rounded-lg focus:outline-none focus:border-skin-accent"
              />
            </div>

            {/* Status Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-skin-base">Draft Mode</label>
                <button
                  onClick={() => setDraft(!draft)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 border ${
                    draft ? 'bg-skin-accent border-skin-accent' : 'bg-skin-base/20 border-skin-line'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 top-0.5 ${
                      draft ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-skin-base">Featured Post</label>
                <button
                  onClick={() => setFeatured(!featured)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 border ${
                    featured ? 'bg-skin-accent border-skin-accent' : 'bg-skin-base/20 border-skin-line'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 top-0.5 ${
                      featured ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Title Input */}
          <div className="border-b border-skin-line bg-skin-fill px-8 py-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your title..."
              className="w-full text-2xl sm:text-3xl font-bold text-skin-base placeholder-text-skin-base/30 border-none outline-none bg-transparent focus:outline-none transition-all duration-200 focus:placeholder-text-skin-base/50"
            />
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {isPreview ? (
              <div className="px-8 py-6 bg-skin-fill min-h-[calc(100vh-200px)]">
                <article className="znc mx-auto max-w-3xl">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </article>
              </div>
            ) : (
              <div className="relative h-full bg-skin-fill">
                {/* Editor Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 24px,
                    rgb(var(--color-text-primary)) 24px,
                    rgb(var(--color-text-primary)) 25px
                  )`
                }} />
                
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your story in markdown..."
                  className="relative w-full h-full min-h-[calc(100vh-200px)] px-8 py-6 text-skin-base placeholder-text-skin-base/25 border-none outline-none resize-none bg-transparent text-base leading-7 focus:outline-none font-mono selection:bg-skin-accent/20 selection:text-skin-base transition-all duration-200 focus:placeholder-text-skin-base/40"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    lineHeight: '25px'
                  }}
                  spellCheck="false"
                />
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className={`fixed bottom-8 right-8 flex flex-col gap-3 transition-all duration-200 ${
          showMetadata ? 'z-30 md:z-40' : 'z-40'
        }`}>
          {/* Settings Button */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`w-14 h-14 rounded-full border border-skin-line shadow-lg transition-all duration-200 flex items-center justify-center group ${
              showMetadata
                ? 'bg-skin-accent text-skin-inverted border-skin-accent'
                : 'bg-skin-card hover:bg-skin-accent text-skin-base hover:text-skin-inverted hover:border-skin-accent'
            }`}
            title="Post Settings"
          >
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>

          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 bg-skin-card hover:bg-skin-accent text-skin-base hover:text-skin-inverted rounded-full border border-skin-line hover:border-skin-accent shadow-lg transition-all duration-200 flex items-center justify-center group"
            title="Upload Image"
          >
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Back to Top Button (when scrolled) */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-14 h-14 bg-skin-card hover:bg-skin-accent text-skin-base hover:text-skin-inverted rounded-full border border-skin-line hover:border-skin-accent shadow-lg transition-all duration-200 flex items-center justify-center group opacity-0 hover:opacity-100"
            title="Back to Top"
            id="back-to-top-editor"
          >
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;