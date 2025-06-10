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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Blog Admin Login
            </h2>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={authenticate}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog Administration</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'images'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Images
            </button>
          </nav>
        </div>

        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Post Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? 'Edit Post' : 'Create New Post'}
              </h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={currentPost.title || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder="Slug"
                  value={currentPost.slug || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder="Tags (JSON array, e.g., [&quot;tag1&quot;, &quot;tag2&quot;])"
                  value={currentPost.tags || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={currentPost.published || false}
                    onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Published
                  </label>
                </div>

                <div data-color-mode="light">
                  <MDEditor
                    value={currentPost.content || ''}
                    onChange={(val) => setCurrentPost({ ...currentPost, content: val || '' })}
                    height={400}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={savePost}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingId ? 'Update' : 'Create'} Post
                  </button>
                  
                  {editingId && (
                    <button
                      onClick={() => {
                        setCurrentPost({ title: '', content: '', slug: '', tags: '', published: false });
                        setEditingId(null);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Posts</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{post.title}</h3>
                        <p className="text-sm text-gray-500">/{post.slug}</p>
                        <p className="text-xs text-gray-400">
                          {post.published ? 'Published' : 'Draft'} • {post.createdAt}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editPost(post)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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