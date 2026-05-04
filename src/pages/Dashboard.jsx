import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";

// ── small stat card ──────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div className={`flex items-center gap-4 bg-white rounded-xl shadow p-5 border-l-4 ${color}`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── comment row ──────────────────────────────────────────────────────────────
function CommentRow({ comment, postTitle }) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
        {comment.user[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-gray-800 text-sm">{comment.user}</span>
          <span className="text-xs text-gray-400">{comment.date}</span>
        </div>
        <p className="text-gray-600 text-sm mt-0.5">{comment.text}</p>
        <p className="text-xs text-indigo-500 mt-1 truncate">on: {postTitle}</p>
      </div>
    </div>
  );
}

// ── image upload zone ────────────────────────────────────────────────────────
function ImageUploadZone({ images, onAdd, onRemove }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback(
    (files) => {
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => onAdd({ name: file.name, url: e.target.result });
        reader.readAsDataURL(file);
      });
    },
    [onAdd]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
          ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"}`}
      >
        <p className="text-3xl mb-1">🖼️</p>
        <p className="text-sm text-gray-500">
          Drag & drop images here, or{" "}
          <span className="text-indigo-600 font-medium">click to browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WEBP supported</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group w-24 h-24">
              <img
                src={img.url}
                alt={img.name}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs
                           flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
              <p className="text-xs text-gray-400 truncate mt-1 max-w-[96px]">{img.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── edit post modal ──────────────────────────────────────────────────────────
function EditModal({ post, onSave, onClose }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [images, setImages] = useState(post.images || []);

  const handleAddImage = useCallback((img) => setImages((prev) => [...prev, img]), []);
  const handleRemoveImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), images });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full h-36 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <ImageUploadZone images={images} onAdd={handleAddImage} onRemove={handleRemoveImage} />
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── delete confirm modal ─────────────────────────────────────────────────────
function DeleteConfirm({ postTitle, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <p className="text-4xl mb-3">🗑️</p>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Delete Post?</h3>
        <p className="text-sm text-gray-500 mb-6">
          "<span className="font-medium text-gray-700">{postTitle}</span>" will be permanently removed.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 border hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { posts, addPost, deletePost, updatePost } = usePosts();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);

  const username = user?.username || user?.name || "alice";
  const myPosts = posts.filter((p) => p.author === username);

  const totalViews    = myPosts.reduce((s, p) => s + (p.views    || 0), 0);
  const totalLikes    = myPosts.reduce((s, p) => s + (p.likes    || 0), 0);
  const totalComments = myPosts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  const allComments = myPosts
    .flatMap((p) => (p.comments || []).map((c) => ({ ...c, postTitle: p.title, postId: p.id })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAddImage    = useCallback((img) => setImages((prev) => [...prev, img]), []);
  const handleRemoveImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) return;
    addPost({ title, content, images }, username);
    setTitle("");
    setContent("");
    setImages([]);
    setShowForm(false);
  };

  const handleSaveEdit = (updates) => {
    updatePost(editingPost.id, updates);
    setEditingPost(null);
  };

  const handleConfirmDelete = () => {
    deletePost(deletingPost.id);
    setDeletingPost(null);
  };

  const tabs = [
    { key: "posts",    label: "My Posts",             count: myPosts.length },
    { key: "insights", label: "Insights",              count: null },
    { key: "reviews",  label: "Comments & Reviews",    count: totalComments },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── header ── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back, <span className="font-semibold text-indigo-600">{username}</span>
              </p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              {showForm ? "Cancel" : "+ New Post"}
            </button>
          </div>

          {/* ── create post form ── */}
          {showForm && (
            <div className="bg-white rounded-xl shadow p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Create a New Post</h2>
              <input
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="border border-gray-300 rounded-lg p-3 w-full h-28 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Write your content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <ImageUploadZone images={images} onAdd={handleAddImage} onRemove={handleRemoveImage} />
              <button
                onClick={handleAdd}
                disabled={!title.trim() || !content.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                Publish Post
              </button>
            </div>
          )}

          {/* ── tabs ── */}
          <div className="flex gap-1 bg-white rounded-xl shadow p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === t.key
                    ? "bg-indigo-600 text-white shadow"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
                {t.count !== null && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === t.key ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ══ MY POSTS tab ══════════════════════════════════════════════ */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {myPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                  <p className="text-4xl mb-3">📝</p>
                  <p className="font-medium">You haven't published any posts yet.</p>
                  <p className="text-sm mt-1">Click "+ New Post" to get started.</p>
                </div>
              ) : (
                myPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/post/${post.id}`}
                          className="text-lg font-bold text-indigo-600 hover:underline truncate block"
                        >
                          {post.title}
                        </Link>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.content}</p>
                        <p className="text-xs text-gray-400 mt-2">Published: {post.date}</p>
                      </div>
                      {/* action buttons */}
                      <div className="flex gap-3 shrink-0">
                        <button
                          onClick={() => setEditingPost(post)}
                          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeletingPost(post)}
                          className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {/* post images */}
                    {post.images?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.images.map((img, i) => (
                          <img
                            key={i}
                            src={img.url}
                            alt={img.name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    )}

                    {/* per-post mini stats */}
                    <div className="flex gap-5 mt-4 pt-3 border-t text-sm text-gray-500">
                      <span>👁 {post.views ?? 0} views</span>
                      <span>❤️ {post.likes ?? 0} likes</span>
                      <span>💬 {post.comments?.length ?? 0} comments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ══ INSIGHTS tab ══════════════════════════════════════════════ */}
          {activeTab === "insights" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Posts"    value={myPosts.length} icon="📝" color="border-indigo-500" />
                <StatCard label="Total Views"    value={totalViews}     icon="👁"  color="border-blue-500"   />
                <StatCard label="Total Likes"    value={totalLikes}     icon="❤️"  color="border-pink-500"   />
                <StatCard label="Total Comments" value={totalComments}  icon="💬"  color="border-green-500"  />
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-gray-800">Post Performance</h3>
                </div>
                {myPosts.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No posts to show insights for.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                      <tr>
                        <th className="text-left px-5 py-3">Title</th>
                        <th className="text-center px-3 py-3">Views</th>
                        <th className="text-center px-3 py-3">Likes</th>
                        <th className="text-center px-3 py-3">Comments</th>
                        <th className="text-center px-3 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {myPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3">
                            <Link to={`/post/${post.id}`} className="text-indigo-600 hover:underline font-medium">
                              {post.title}
                            </Link>
                          </td>
                          <td className="text-center px-3 py-3 text-gray-600">{post.views ?? 0}</td>
                          <td className="text-center px-3 py-3 text-gray-600">{post.likes ?? 0}</td>
                          <td className="text-center px-3 py-3 text-gray-600">{post.comments?.length ?? 0}</td>
                          <td className="text-center px-3 py-3 text-gray-400">{post.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {myPosts.length > 0 && (
                <div className="bg-white rounded-xl shadow p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Engagement Overview</h3>
                  <div className="space-y-3">
                    {myPosts.map((post) => {
                      const engagement = post.views > 0
                        ? (((post.likes + (post.comments?.length || 0)) / post.views) * 100).toFixed(1)
                        : 0;
                      const barWidth = Math.min(engagement * 5, 100);
                      return (
                        <div key={post.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 truncate max-w-xs">{post.title}</span>
                            <span className="text-gray-500 shrink-0 ml-2">{engagement}% engagement</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ COMMENTS & REVIEWS tab ════════════════════════════════════ */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-xl shadow">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Comments & Reviews on Your Posts</h3>
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
                  {allComments.length} total
                </span>
              </div>
              <div className="px-5 py-2">
                {allComments.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <p className="text-3xl mb-2">💬</p>
                    <p className="font-medium">No comments yet.</p>
                    <p className="text-sm mt-1">When readers comment on your posts, they'll appear here.</p>
                  </div>
                ) : (
                  allComments.map((comment) => (
                    <CommentRow
                      key={`${comment.postId}-${comment.id}`}
                      comment={comment}
                      postTitle={comment.postTitle}
                    />
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── edit modal ── */}
      {editingPost && (
        <EditModal
          post={editingPost}
          onSave={handleSaveEdit}
          onClose={() => setEditingPost(null)}
        />
      )}

      {/* ── delete confirm modal ── */}
      {deletingPost && (
        <DeleteConfirm
          postTitle={deletingPost.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPost(null)}
        />
      )}
    </>
  );
}
