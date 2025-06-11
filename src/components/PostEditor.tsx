import React, { useState, useRef, useEffect } from "react";
import { hc } from "hono/client";
import type { App } from "../pages/api/[...path]";
import "zenn-content-css";

interface PostEditorProps {
  postId: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  description: string;
  slug: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  ogImage?: string;
  canonicalURL?: string;
}

const PostEditor: React.FC<PostEditorProps> = ({ postId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [draft, setDraft] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [slug, setSlug] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hono client for typed API calls
  const client = hc<App>(
    typeof window !== "undefined" ? window.location.origin : ""
  );

  // Load existing post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await client.api.posts[":id"].$get({
          param: { id: postId },
        });

        if (response.ok) {
          const post: Post = await response.json();
          setTitle(post.title);
          setContent(post.content);
          setDescription(post.description);
          setSlug(post.slug);
          setTags(post.tags || []);
          setDraft(post.draft);
          setFeatured(post.featured);
        } else {
          alert("Failed to load post");
        }
      } catch (error) {
        console.error("Error loading post:", error);
        alert("Error loading post");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  // Handle tag input
  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !description.trim()) {
      alert("Please enter title, content, and description");
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title,
        content,
        description,
        slug,
        tags: tags.length > 0 ? tags : ["others"],
        draft,
        featured,
      };

      const response = await client.api.admin.posts[":id"].$put({
        param: { id: postId },
        json: postData,
      });

      if (response.ok) {
        alert("Post updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to update post: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePreview = async () => {
    if (!isPreview) {
      // Switching to preview mode
      try {
        const response = await client.api["render-markdown"].$post({
          json: { markdown: content },
        });

        if (response.ok) {
          const result = await response.json();
          setPreviewHtml(result.html);
        }
      } catch (error) {
        console.error("Failed to render markdown:", error);
        // Fallback rendering
        const html = content
          .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
          .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
          .replace(
            /^### (.*$)/gim,
            '<h3 class="text-lg font-bold mb-2">$1</h3>'
          )
          .replace(
            /\*\*(.*?)\*\*/gim,
            '<strong class="font-semibold">$1</strong>'
          )
          .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
          .replace(
            /`(.*?)`/gim,
            '<code class="bg-gray-100 px-1 rounded">$1</code>'
          )
          .replace(
            /!\[([^\]]*)\]\(([^\)]+)\)/gim,
            '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4">'
          )
          .replace(
            /\[([^\]]+)\]\(([^\)]+)\)/gim,
            '<a href="$2" class="text-blue-600 underline">$1</a>'
          )
          .replace(/\n/gim, "<br>");
        setPreviewHtml(html);
      }
    }
    setIsPreview(!isPreview);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("postId", postId);

      const response = await client.api["admin"]["images"].$post({
        form: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const imageMarkdown = `![${file.name}](${result.url})\n`;
        setContent(prev => prev + imageMarkdown);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    }

    if (event.target) {
      event.target.value = "";
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Toggle metadata with Ctrl+M
      if (e.ctrlKey && e.key === "m") {
        e.preventDefault();
        setShowMetadata(!showMetadata);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [title, content, description, tags, draft, featured, slug, showMetadata]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-skin-fill">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-skin-accent border-t-transparent"></div>
          <p className="mt-4 text-skin-base">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-skin-fill">
      {/* Header Bar */}
      <div className="bg-skin-fill/95 sticky top-0 z-50 border-b border-skin-line backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="flex items-center gap-2 text-skin-base hover:text-skin-accent"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm">Back to Dashboard</span>
            </a>
            <div className="h-4 w-px bg-skin-line"></div>
            <h1 className="text-lg font-semibold text-skin-base">Edit Post</h1>
            <div className="hidden items-center gap-2 sm:flex">
              <div
                className={`h-2 w-2 rounded-full ${draft ? "bg-skin-accent/60" : "bg-green-500"}`}
              ></div>
              <span className="text-skin-base/60 text-sm">
                {draft ? "Draft" : "Published"}
              </span>
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
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setShowMetadata(false)}
            />

            {/* Sidebar/Modal */}
            <div className="fixed inset-0 z-50 max-h-screen w-full overflow-y-auto border-r border-skin-line bg-skin-card md:relative md:inset-auto md:z-auto md:max-h-[calc(100vh-80px)] md:w-80 md:border-r md:border-l-0">
              <div className="p-6">
                {/* Header with close button for mobile */}
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-skin-base">
                    Post Settings
                  </h2>
                  <button
                    onClick={() => setShowMetadata(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-skin-base transition-colors hover:bg-skin-fill hover:text-skin-accent md:hidden"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-skin-base">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief description of your post..."
                    className="placeholder-text-skin-base/40 focus:border-skin-accent h-20 w-full resize-none rounded-lg border border-skin-line bg-skin-fill px-3 py-2 text-sm text-skin-base focus:outline-none"
                  />
                </div>

                {/* Slug */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-skin-base">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="url-slug"
                    className="placeholder-text-skin-base/40 focus:border-skin-accent w-full rounded-lg border border-skin-line bg-skin-fill px-3 py-2 text-sm text-skin-base focus:outline-none"
                  />
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-skin-base">
                    Tags
                  </label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-skin-accent/20 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-skin-accent"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-skin-accent/80"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagAdd}
                    placeholder="Type tag and press Enter"
                    className="placeholder-text-skin-base/40 focus:border-skin-accent w-full rounded-lg border border-skin-line bg-skin-fill px-3 py-2 text-sm text-skin-base focus:outline-none"
                  />
                </div>

                {/* Status Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-skin-base">
                      Draft Mode
                    </label>
                    <button
                      onClick={() => setDraft(!draft)}
                      className={`relative h-6 w-12 rounded-full border transition-colors duration-200 ${
                        draft
                          ? "border-skin-accent bg-skin-accent"
                          : "bg-green-500 border-green-500"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          draft ? "left-6" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-skin-base">
                      Featured Post
                    </label>
                    <button
                      onClick={() => setFeatured(!featured)}
                      className={`relative h-6 w-12 rounded-full border transition-colors duration-200 ${
                        featured
                          ? "border-skin-accent bg-skin-accent"
                          : "bg-skin-base/20 border-skin-line"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          featured ? "left-6" : "left-0.5"
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
        <div className="flex flex-1 flex-col">
          {/* Title Input */}
          <div className="border-b border-skin-line bg-skin-fill px-8 py-6">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter your title..."
              className="placeholder-text-skin-base/30 focus:placeholder-text-skin-base/50 w-full border-none bg-transparent text-2xl font-bold text-skin-base transition-all duration-200 outline-none focus:outline-none sm:text-3xl"
            />
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {isPreview ? (
              <div className="min-h-[calc(100vh-200px)] bg-skin-fill px-8 py-6">
                <article className="znc mx-auto max-w-3xl">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </article>
              </div>
            ) : (
              <div className="relative h-full bg-skin-fill">
                {/* Editor Background Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 24px,
                    rgb(var(--color-text-primary)) 24px,
                    rgb(var(--color-text-primary)) 25px
                  )`,
                  }}
                />

                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your story in markdown..."
                  className="placeholder-text-skin-base/25 selection:bg-skin-accent/20 focus:placeholder-text-skin-base/40 relative h-full min-h-[calc(100vh-200px)] w-full resize-none border-none bg-transparent px-8 py-6 font-mono text-base leading-7 text-skin-base transition-all duration-200 outline-none selection:text-skin-base focus:outline-none"
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    lineHeight: "25px",
                  }}
                  spellCheck="false"
                />
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div
          className={`fixed right-8 bottom-8 flex flex-col gap-3 transition-all duration-200 ${
            showMetadata ? "z-30 md:z-40" : "z-40"
          }`}
        >
          {/* Edit/Preview Toggle */}
          <div className="flex items-center rounded-full border border-skin-line bg-white p-1 shadow-lg">
            <button
              onClick={() => setIsPreview(false)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                !isPreview ? "bg-skin-accent text-white" : "text-gray-600"
              }`}
              aria-label="編集モード"
              title="編集モード"
            >
              <svg
                viewBox="0 0 27 27"
                height="16"
                width="16"
                className="h-5 w-5 fill-current"
              >
                <path d="M23.46,6.35,21.37,4.27a2.57,2.57,0,0,0-3.66,0L5.08,16.9,4.6,21.19a1.76,1.76,0,0,0,1.94,1.93l4.28-.47L23.46,10A2.59,2.59,0,0,0,23.46,6.35ZM10,20.89l-3.54.39.4-3.54,9-9L19,11.86ZM22.16,8.71l-1.85,1.85L17.16,7.42,19,5.57a.74.74,0,0,1,1.06,0l2.09,2.08a.75.75,0,0,1,0,1.06Z" />
              </svg>
            </button>
            <button
              onClick={() => !isPreview && handleTogglePreview()}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                isPreview ? "bg-skin-accent text-white" : "text-gray-600"
              }`}
              aria-label="プレビュー"
              title="プレビュー"
            >
              <svg
                viewBox="0 0 27 27"
                height="15"
                width="15"
                className="h-4 w-4 fill-current"
              >
                <path d="M7.75,26a3.17,3.17,0,0,1-1.6-.4,3.24,3.24,0,0,1-1.7-2.9V4.23a3.45,3.45,0,0,1,1.7-2.9,3.44,3.44,0,0,1,3.4.2l14.5,9.3a3.11,3.11,0,0,1,1.5,2.8,3.32,3.32,0,0,1-1.5,2.8l-14.5,9.1A2.9,2.9,0,0,1,7.75,26Zm0-22.1h-.1c-.1.1-.2.2-.2.3v18.5c0,.2.1.3.2.3A.19.19,0,0,0,8,23l14.5-9.3c.1-.1.1-.1.1-.2s0-.2-.1-.2L8,4C7.85,4,7.85,3.93,7.75,3.93Z" />
              </svg>
            </button>
          </div>

          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition-all duration-200 hover:text-gray-800"
            aria-label="画像を貼る"
            title="画像を貼る"
          >
            <svg
              x="0px"
              y="0px"
              viewBox="0 0 27 27"
              height="22"
              width="22"
              className="fill-current"
            >
              <g>
                <path d="M21,5.5H6c-1.2,0-2.1,1-2.1,2.1v12.2C3.9,21,4.8,22,6,22h15c1.2,0,2.2-1,2.2-2.2V7.6C23.2,6.4,22.2,5.5,21,5.5z M5.4,18.6 l4.7-5.2c0,0,0,0,0.1,0c0,0,0,0,0,0c0,0,0.1,0,0.1,0l6.6,6.9H6c-0.3,0-0.6-0.2-0.6-0.5V18.6z M21.5,17.1l-4-4.2 c-0.2-0.2-0.4-0.3-0.6-0.3c0,0,0,0,0,0c-0.2,0-0.5,0.1-0.6,0.3l-2.1,2.3l-3.4-3.6c-0.2-0.2-0.4-0.3-0.7-0.3c-0.3,0-0.5,0.1-0.7,0.3 l-4,4.5V7.6C5.4,7.3,5.7,7,6,7h15c0.3,0,0.5,0.2,0.5,0.6V17.1z M16.7,14.9c0-0.1,0.1-0.1,0.2-0.1c0.1,0,0.1,0,0.2,0.1l4.4,4.6v0.3 c0,0.3-0.2,0.5-0.5,0.5h-1.8l-3.8-4L16.7,14.9z" />
                <path d="M17.6,8.1c-0.7,0-1.5,0.6-1.5,1.6c0,0.7,0.6,1.5,1.5,1.5c0.7,0,1.6-0.6,1.5-1.6C19,8.8,18.4,8.1,17.6,8.1z" />
              </g>
            </svg>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-200 ${
              showMetadata
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:text-gray-800"
            }`}
            aria-label="Post Settings"
            title="Post Settings"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-500 bg-blue-500 text-white shadow-lg transition-all duration-200 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save Post"
            aria-label="Save Post"
          >
            {saving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
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

export default PostEditor;
