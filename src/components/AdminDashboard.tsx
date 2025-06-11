import React, { useState, useEffect } from "react";
import { hc } from "hono/client";
import type { App } from "../pages/api/[...path]";

interface Post {
  id: number;
  title: string;
  description: string;
  slug: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  pubDatetime: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  posts: {
    total: number;
    published: number;
    draft: number;
    featured: number;
  };
  images: {
    total: number;
  };
}

interface Tag {
  tag: string;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const client = hc<App>(
    typeof window !== "undefined" ? window.location.origin : ""
  );

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch posts with filters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (statusFilter) params.append("status", statusFilter);
      if (tagFilter) params.append("tag", tagFilter);
      if (searchQuery) params.append("search", searchQuery);

      const [postsResponse, statsResponse, tagsResponse] = await Promise.all([
        client.api.admin.posts.$get({ query: Object.fromEntries(params) }),
        client.api.admin.stats.$get(),
        client.api.admin.tags.$get(),
      ]);

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        console.log("Posts data:", postsData); // Debug log
        if (postsData && postsData.posts) {
          setPosts(postsData.posts || []);
          setTotalPages(postsData.pagination?.totalPages || 1);
        } else {
          // Fallback for direct posts array
          setPosts(Array.isArray(postsData) ? postsData : []);
          setTotalPages(1);
        }
      } else {
        console.error("Failed to fetch posts:", await postsResponse.text());
        setPosts([]);
        setTotalPages(1);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log("Stats data:", statsData); // Debug log
        setStats(statsData);
      } else {
        console.error("Failed to fetch stats:", await statsResponse.text());
      }

      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        console.log("Tags data:", tagsData); // Debug log
        setTags(tagsData.tags || []);
      } else {
        console.error("Failed to fetch tags:", await tagsResponse.text());
        setTags([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set safe defaults on error
      setPosts([]);
      setStats({
        posts: { total: 0, published: 0, draft: 0, featured: 0 },
        images: { total: 0 },
      });
      setTags([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter, tagFilter, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const parseTags = (tags: any): string[] => {
    try {
      if (typeof tags === "string") {
        if (tags.trim() === "" || tags === "0") return [];
        return JSON.parse(tags);
      } else if (Array.isArray(tags)) {
        return tags.filter(tag => tag && tag !== "0" && tag.trim() !== "");
      }
    } catch (error) {
      console.error("Error parsing tags:", error);
    }
    return [];
  };

  if (loading && !posts.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-skin-fill">
        <div className="text-center">
          <div className="border-skin-accent mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="mt-4 text-skin-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-skin-fill">
      {/* Header */}
      <header className="bg-skin-card ring-1 shadow-sm ring-white/5">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-skin-base">
                ブログ管理
              </h1>
              <p className="text-skin-base/60 mt-1 text-sm">記事の作成と管理</p>
            </div>
            <div className="ml-4 flex shrink-0">
              <a
                href="/admin/new"
                className="hover:bg-skin-accent/90 focus-visible:outline-skin-accent inline-flex items-center gap-x-1.5 rounded-md bg-skin-accent px-3 py-2 text-sm text-skin-inverted shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                新しい記事
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Summary */}
        {stats && (
          <div className="mb-8 overflow-hidden rounded-xl bg-skin-card ring-1 shadow-sm ring-white/5">
            <div className="grid grid-cols-2 divide-x divide-white/5 sm:grid-cols-4">
              <div className="px-6 py-4">
                <dt className="text-skin-base/70 text-sm font-medium">
                  記事総数
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-skin-base">
                  {stats.posts.total}
                </dd>
              </div>
              <div className="px-6 py-4">
                <dt className="text-skin-base/70 text-sm font-medium">
                  公開中
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-emerald-400">
                  {stats.posts.published}
                </dd>
              </div>
              <div className="px-6 py-4">
                <dt className="text-skin-base/70 text-sm font-medium">
                  下書き
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-skin-accent">
                  {stats.posts.draft}
                </dd>
              </div>
              <div className="px-6 py-4">
                <dt className="text-skin-base/70 text-sm font-medium">
                  注目記事
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-amber-400">
                  {stats.posts.featured}
                </dd>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-y-4 sm:flex-row sm:items-center sm:gap-x-4">
          <div className="min-w-0 flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="text-skin-base/50 size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="記事を検索..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="placeholder:text-skin-base/50 focus:ring-skin-accent block w-full rounded-md bg-skin-card py-2 pr-3 pl-10 text-sm text-skin-base ring-1 shadow-sm ring-white/10 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex shrink-0 space-x-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="focus:ring-skin-accent rounded-md bg-skin-card py-2 pr-8 pl-3 text-sm text-skin-base ring-1 shadow-sm ring-white/10 focus:ring-2 focus:outline-none"
            >
              <option value="">すべてのステータス</option>
              <option value="published">公開中</option>
              <option value="draft">下書き</option>
            </select>
            <select
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              className="focus:ring-skin-accent rounded-md bg-skin-card py-2 pr-8 pl-3 text-sm text-skin-base ring-1 shadow-sm ring-white/10 focus:ring-2 focus:outline-none"
            >
              <option value="">すべてのタグ</option>
              {tags &&
                tags.length > 0 &&
                tags.slice(0, 10).map(tag => (
                  <option key={tag.tag} value={tag.tag}>
                    {tag.tag} ({tag.count})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="overflow-hidden rounded-xl bg-skin-card ring-1 shadow-sm ring-white/5">
          <ul role="list" className="divide-y divide-white/5">
            {posts && posts.length > 0 ? (
              posts.map(post => (
                <li key={post.id} className="group relative">
                  <a
                    href={`/admin/edit/${post.id}`}
                    className="hover:bg-skin-fill/20 focus:bg-skin-fill/20 block px-6 py-4 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm leading-6 font-semibold text-skin-base group-hover:text-skin-accent">
                            {post.title}
                          </h3>
                        </div>
                        {post.description && (
                          <p className="text-skin-base/60 mt-1 line-clamp-1 text-sm leading-5">
                            {post.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-x-3 text-xs">
                          <div
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              post.draft
                                ? "bg-skin-accent/10 ring-skin-accent/30 text-skin-accent"
                                : "bg-emerald-400/10 text-emerald-400 ring-emerald-400/30"
                            }`}
                          >
                            {post.draft ? "下書き" : "公開中"}
                          </div>
                          {Boolean(post.featured) && (
                            <div className="inline-flex items-center rounded-md bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-400/30 ring-inset">
                              注目
                            </div>
                          )}
                          {post.pubDatetime && (
                            <time className="text-skin-base/50">
                              {formatDate(post.pubDatetime)}
                            </time>
                          )}
                          {(() => {
                            const postTags = parseTags(post.tags);
                            if (postTags && postTags.length > 0) {
                              return postTags.slice(0, 2).map(
                                (tag, index) =>
                                  tag && (
                                    <span
                                      key={`${tag}-${index}`}
                                      className="bg-skin-fill/50 text-skin-base/60 inline-flex items-center rounded-md px-2 py-1 text-xs"
                                    >
                                      #{tag}
                                    </span>
                                  )
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center">
                        <svg
                          className="text-skin-base/40 group-hover:text-skin-base/60 size-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>
                </li>
              ))
            ) : (
              <li className="p-12 text-center">
                <div className="bg-skin-accent/10 mx-auto flex size-12 items-center justify-center rounded-full">
                  <svg
                    className="text-skin-accent/70 size-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-skin-base">
                  {loading
                    ? "記事を読み込み中..."
                    : "記事が見つかりませんでした"}
                </h3>
                {!loading && (
                  <>
                    <p className="text-skin-base/60 mt-1 text-sm">
                      最初の記事を作成して、ブログを始めましょう
                    </p>
                    <div className="mt-6">
                      <a
                        href="/admin/new"
                        className="hover:bg-skin-accent/90 focus-visible:outline-skin-accent inline-flex items-center gap-x-1.5 rounded-md bg-skin-accent px-3 py-2 text-sm font-semibold text-skin-inverted shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        <svg
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        最初の記事を作成
                      </a>
                    </div>
                  </>
                )}
              </li>
            )}
          </ul>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-between rounded-lg bg-skin-card px-4 py-3 ring-1 shadow-sm ring-white/5 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-skin-base/60 text-sm">
                ページ <span className="font-medium">{currentPage}</span> /{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-skin-fill/80 relative inline-flex items-center rounded-md bg-skin-fill px-3 py-2 text-sm font-semibold text-skin-base ring-1 shadow-sm ring-white/10 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                前へ
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-skin-fill/80 relative ml-3 inline-flex items-center rounded-md bg-skin-fill px-3 py-2 text-sm font-semibold text-skin-base ring-1 shadow-sm ring-white/10 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
