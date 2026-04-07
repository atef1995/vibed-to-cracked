"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  FileText,
  TrendingUp,
  Save,
  X,
  Star,
  StarOff,
  Globe,
  GlobeLock,
} from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  published: boolean;
  featured: boolean;
  readingTime: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string | null; image: string | null };
  category: { id: string; slug: string; name: string } | null;
}

export default function BlogDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    published: false,
    featured: false,
    readingTime: 5,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/blog");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);
  const publishedCount = posts.filter((p) => p.published).length;

  const openEditor = (post: BlogPost) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      tags: post.tags.join(", "),
      published: post.published,
      featured: post.featured,
      readingTime: post.readingTime,
    });
    setMessage(null);
  };

  const closeEditor = () => {
    setEditingPost(null);
    setMessage(null);
  };

  const savePost = async () => {
    if (!editingPost) return;
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPost.id,
          title: editForm.title,
          excerpt: editForm.excerpt || null,
          content: editForm.content,
          tags: editForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          published: editForm.published,
          featured: editForm.featured,
          readingTime: editForm.readingTime,
        }),
      });

      if (response.ok) {
        setMessage({ text: "Post saved", type: "success" });
        fetchPosts();
        setTimeout(() => closeEditor(), 800);
      } else {
        setMessage({ text: "Failed to save", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (
    post: BlogPost,
    field: "published" | "featured"
  ) => {
    try {
      const response = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, [field]: !post[field] }),
      });
      if (response.ok) fetchPosts();
    } catch (error) {
      console.error(`Error toggling ${field}:`, error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-600 rounded-lg p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-2xl font-bold text-gray-400">{posts.length}</p>
            <p className="text-sm text-gray-400">Total Posts</p>
          </div>
        </div>
        <div className="bg-gray-600 rounded-lg p-4 flex items-center gap-3">
          <Globe className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-2xl font-bold text-gray-400">{publishedCount}</p>
            <p className="text-sm text-gray-400">Published</p>
          </div>
        </div>
        <div className="bg-gray-600 rounded-lg p-4 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-2xl font-bold text-gray-400">
              {totalViews.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Total Views</p>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                Post
              </th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                Views
              </th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                Featured
              </th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                Published
              </th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-gray-100 hover:bg-gray-6000"
              >
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-400 text-sm">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500">/blog/{post.slug}</p>
                    {post.category && (
                      <span className="text-xs text-blue-600">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Eye className="w-4 h-4 text-gray-400" />
                    {post.viewCount.toLocaleString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleField(post, "published")}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      post.published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {post.published ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <GlobeLock className="w-3 h-3" />
                    )}
                    {post.published ? "Live" : "Draft"}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleField(post, "featured")}
                    className="cursor-pointer"
                    title={
                      post.featured ? "Remove from featured" : "Mark featured"
                    }
                  >
                    {post.featured ? (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatDate(post.publishedAt)}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => openEditor(post)}
                    className="text-blue-600 hover:text-gray-400 text-sm font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-gray-500 text-sm"
                >
                  No blog posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-700 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h3 className="text-lg font-semibold text-gray-400">Edit Post</h3>
              <button
                onClick={closeEditor}
                aria-label="Close editor"
                className="p-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {message && (
                <div
                  className={`text-sm px-3 py-2 rounded ${
                    message.type === "success"
                      ? "bg-gray-600 text-green-700"
                      : "bg-gray-600 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Post title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={editForm.excerpt}
                  onChange={(e) =>
                    setEditForm({ ...editForm, excerpt: e.target.value })
                  }
                  rows={2}
                  placeholder="Short excerpt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Content (Markdown)
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  rows={12}
                  placeholder="Markdown content"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tags: e.target.value })
                    }
                    placeholder="tag1, tag2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Reading Time (min)
                  </label>
                  <input
                    type="number"
                    value={editForm.readingTime}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        readingTime: parseInt(e.target.value) || 5,
                      })
                    }
                    min={1}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={editForm.published}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        published: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  Published
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={editForm.featured}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        featured: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  Featured
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-600">
              <button
                onClick={closeEditor}
                className="px-4 py-2 text-sm text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={savePost}
                disabled={saving || !editForm.title.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
