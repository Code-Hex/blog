import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  tags: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Image {
  id: number;
  filename: string;
  url: string;
  postId: number | null;
  createdAt: string;
}

const AdminApp: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({
    title: '',
    content: '',
    slug: '',
    tags: '',
    published: false
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState<'posts' | 'images'>('posts');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
      fetchImages();
    }
  }, [isAuthenticated]);

  const authenticate = async () => {
    try {
      const response = await fetch('/api/admin/posts', {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Authentication failed');
    }
  };

  const getAuthHeaders = () => ({
    'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
    'Content-Type': 'application/json'
  });

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/admin/images', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const savePost = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/posts/${editingId}` : '/api/admin/posts';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...currentPost,
          tags: currentPost.tags ? JSON.parse(currentPost.tags) : []
        })
      });

      if (response.ok) {
        fetchPosts();
        setCurrentPost({ title: '', content: '', slug: '', tags: '', published: false });
        setEditingId(null);
      } else {
        alert('Failed to save post');
      }
    } catch (error) {
      alert('Error saving post');
    }
  };

  const editPost = (post: Post) => {
    setCurrentPost({
      ...post,
      tags: typeof post.tags === 'string' ? post.tags : JSON.stringify(post.tags)
    });
    setEditingId(post.id);
  };

  const deletePost = async (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`/api/admin/posts/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          fetchPosts();
        } else {
          alert('Failed to delete post');
        }
      } catch (error) {
        alert('Error deleting post');
      }
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        },
        body: formData
      });

      if (response.ok) {
        fetchImages();
        alert('Image uploaded successfully');
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      alert('Error uploading image');
    }
  };

  const deleteImage = async (id: number) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await fetch(`/api/admin/images/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          fetchImages();
        } else {
          alert('Failed to delete image');
        }
      } catch (error) {
        alert('Error deleting image');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Blog Admin
              </h2>
              <p className="text-white/70 mt-2">Sign in to manage your content</p>
            </div>
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <button
                onClick={authenticate}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Blog Admin
                </h1>
                <p className="text-sm text-slate-500">Content Management System</p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-slate-200/60 inline-flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'posts'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Posts</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'images'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Images</span>
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Post Editor */}
            <div className="xl:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {editingId ? 'Edit Post' : 'Create New Post'}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      {editingId ? 'Make changes to your existing post' : 'Write something amazing'}
                    </p>
                  </div>
                  {editingId && (
                    <button
                      onClick={() => {
                        setCurrentPost({ title: '', content: '', slug: '', tags: '', published: false });
                        setEditingId(null);
                      }}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                      <input
                        type="text"
                        placeholder="Enter post title..."
                        value={currentPost.title || ''}
                        onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                      <input
                        type="text"
                        placeholder="url-friendly-slug"
                        value={currentPost.slug || ''}
                        onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                    <input
                      type="text"
                      placeholder="[&quot;javascript&quot;, &quot;react&quot;, &quot;tutorial&quot;]"
                      value={currentPost.tags || ''}
                      onChange={(e) => setCurrentPost({ ...currentPost, tags: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">JSON array format</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="published"
                        checked={currentPost.published || false}
                        onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-md"
                      />
                    </div>
                    <label htmlFor="published" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Publish immediately
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Content</label>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <div data-color-mode="light">
                        <MDEditor
                          value={currentPost.content || ''}
                          onChange={(val) => setCurrentPost({ ...currentPost, content: val || '' })}
                          height={500}
                          data-color-mode="light"
                          visibleDragBar={false}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6 border-t border-slate-200">
                    <button
                      onClick={savePost}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {editingId ? 'Update Post' : 'Create Post'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setCurrentPost({ title: '', content: '', slug: '', tags: '', published: false });
                        setEditingId(null);
                      }}
                      className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">All Posts</h2>
                  <p className="text-sm text-slate-500 mt-1">{posts.length} total posts</p>
                </div>
                <div className="text-xs text-slate-400">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 mr-2">
                    ● {posts.filter(p => p.published).length} Published
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    ● {posts.filter(p => !p.published).length} Drafts
                  </span>
                </div>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {posts.map((post) => (
                  <div key={post.id} className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-slate-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-slate-900 truncate">{post.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            post.published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-mono">/{post.slug}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Created {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => editPost(post)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit post"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-500">No posts yet</p>
                    <p className="text-slate-400 text-sm">Create your first post to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Image Management</h2>
            
            {/* Image Upload */}
            <div className="mb-6">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-2">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 truncate">{image.filename}</p>
                    <p className="text-xs text-gray-400">{image.createdAt}</p>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="mt-1 text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApp;