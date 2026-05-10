import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { useDigest } from "../context/DigestContext";
import RichTextEditor from "../components/RichTextEditor";

// ── constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Technology",
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science & AI",
  "Cybersecurity",
  "Cloud & DevOps",
  "Design & UX",
  "Science",
  "Health & Wellness",
  "Mental Health",
  "Fitness & Sports",
  "Food & Cooking",
  "Travel",
  "Finance & Investing",
  "Business & Entrepreneurship",
  "Marketing & SEO",
  "Education",
  "Career & Productivity",
  "Self Improvement",
  "Relationships",
  "Parenting",
  "Environment & Sustainability",
  "Politics & Society",
  "History",
  "Philosophy",
  "Art & Culture",
  "Music",
  "Movies & TV",
  "Gaming",
  "Books & Literature",
  "Photography",
  "Fashion & Lifestyle",
  "DIY & Crafts",
  "Pets & Animals",
  "News & Current Events",
  "Opinion & Commentary",
  "Humor & Satire",
  "Other",
];

const SUGGESTED_TAGS = [
  "javascript", "typescript", "react", "vue", "angular", "nextjs", "nodejs",
  "python", "django", "flask", "fastapi", "rust", "golang", "java", "kotlin",
  "swift", "flutter", "react-native", "css", "tailwindcss", "html", "graphql",
  "rest-api", "docker", "kubernetes", "aws", "azure", "gcp", "devops", "ci-cd",
  "git", "open-source", "machine-learning", "deep-learning", "nlp", "ai",
  "data-science", "sql", "mongodb", "postgresql", "redis", "firebase",
  "web3", "blockchain", "cybersecurity", "linux", "terminal", "productivity",
  "career", "tutorial", "beginners", "advanced", "tips", "best-practices",
  "performance", "accessibility", "testing", "debugging", "architecture",
  "design-patterns", "ux", "ui", "figma", "startup", "freelancing", "remote-work",
  "motivation", "mindset", "health", "fitness", "travel", "food", "photography",
  "writing", "storytelling", "review", "opinion", "news", "interview", "podcast",
];

// ── tag input component ──────────────────────────────────────────────────────
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef();

  const filtered = input.trim()
    ? SUGGESTED_TAGS.filter(
        (t) => t.includes(input.toLowerCase()) && !tags.includes(t)
      ).slice(0, 8)
    : [];

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag) && tags.length < 15) {
      onChange([...tags, tag]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div
        className="border border-gray-300 rounded-lg p-2 flex flex-wrap gap-2 min-h-[46px] cursor-text focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="text-indigo-400 hover:text-indigo-700 leading-none ml-0.5"
              aria-label={`Remove tag ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? "Add tags (press Enter or comma)…" : ""}
          className="flex-1 min-w-[140px] outline-none text-sm bg-transparent placeholder-gray-400"
        />
      </div>

      {/* suggestions dropdown */}
      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((t) => (
            <li
              key={t}
              onMouseDown={() => addTag(t)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
            >
              #{t}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-400 mt-1">
        {tags.length}/15 tags · Press <kbd className="bg-gray-100 px-1 rounded">Enter</kbd> or <kbd className="bg-gray-100 px-1 rounded">,</kbd> to add
      </p>
    </div>
  );
}

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
        <div
          className="text-gray-600 text-sm mt-0.5 prose prose-sm max-w-none
            [&_a]:text-indigo-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
            [&_code]:bg-gray-100 [&_code]:text-red-600 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs"
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />
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
  const [tags, setTags] = useState(post.tags || []);
  const [category, setCategory] = useState(post.category || "");

  const handleAddImage = useCallback((img) => setImages((prev) => [...prev, img]), []);
  const handleRemoveImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const isContentEmpty = (html) => !html || html.replace(/<[^>]*>/g, "").trim() === "";

  const handleSave = () => {
    if (!title.trim() || isContentEmpty(content)) return;
    onSave({ title: title.trim(), content, images, tags, category });
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
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your content here…"
              minHeight={180}
            />
          </div>

          {/* category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700"
            >
              <option value="">— Select a category —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <TagInput tags={tags} onChange={setTags} />
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
            disabled={!title.trim() || isContentEmpty(content)}
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
  const { user }   = useAuth();
  const { activeCount, weekLabel, subscribers } = useDigest();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);

  const username = user?.username || user?.name || "alice";
  const myPosts = posts.filter((p) => p.author === username);

  const totalViews    = myPosts.reduce((s, p) => s + (p.views    || 0), 0);
  const totalLikes    = myPosts.reduce((s, p) => s + (p.likes    || 0), 0);
  const totalComments = myPosts.reduce((s, p) => s + (p.comments?.length || 0), 0);
  const totalHelpful    = myPosts.reduce((s, p) => s + (p.helpful    || 0), 0);
  const totalNotHelpful = myPosts.reduce((s, p) => s + (p.notHelpful || 0), 0);
  const totalReviews    = totalHelpful + totalNotHelpful;

  const allComments = myPosts
    .flatMap((p) => (p.comments || []).map((c) => ({ ...c, postTitle: p.title, postId: p.id })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAddImage    = useCallback((img) => setImages((prev) => [...prev, img]), []);
  const handleRemoveImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const isContentEmpty = (html) => !html || html.replace(/<[^>]*>/g, "").trim() === "";

  const handleAdd = () => {
    if (!title.trim() || isContentEmpty(content) || !category) return;
    addPost({ title, content, images, tags, category }, username);
    setTitle("");
    setContent("");
    setImages([]);
    setTags([]);
    setCategory("");
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
    { key: "posts",    label: "My Posts",          count: myPosts.length },
    { key: "insights", label: "Insights",           count: null },
    { key: "reviews",  label: "Comments & Reviews", count: totalComments + totalReviews },
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
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Create a New Post</h2>

              <input
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your post content here…"
                  minHeight={200}
                />
              </div>

              {/* category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700"
                >
                  <option value="">— Select a category —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <TagInput tags={tags} onChange={setTags} />
              </div>

              <ImageUploadZone images={images} onAdd={handleAddImage} onRemove={handleRemoveImage} />

              <button
                onClick={handleAdd}
                disabled={!title.trim() || isContentEmpty(content) || !category}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                Publish Post
              </button>
              {(!title.trim() || isContentEmpty(content) || !category) && (
                <p className="text-xs text-amber-600 mt-1">
                  {!title.trim() ? "Title is required. " : ""}
                  {isContentEmpty(content) ? "Content is required. " : ""}
                  {!category ? "Please select a category." : ""}
                </p>
              )}
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
                          to={`/post/${post.slug}`}
                          className="text-lg font-bold text-indigo-600 hover:underline truncate block"
                        >
                          {post.title}
                        </Link>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                          {post.content?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Published: {post.date}</p>
                        {/* category & tags */}
                        {post.category && (
                          <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                            {post.category}
                          </span>
                        )}
                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {post.tags.map((tag) => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
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
              {/* weekly digest stats */}
              <div className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Weekly Digest</h3>
                  <Link
                    to="/digest"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                  >
                    View digest page →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center bg-indigo-50 rounded-xl p-3">
                    <p className="text-2xl font-black text-indigo-600">{activeCount}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Subscribers</p>
                  </div>
                  <div className="text-center bg-green-50 rounded-xl p-3">
                    <p className="text-2xl font-black text-green-600">68%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Open rate</p>
                  </div>
                  <div className="text-center bg-violet-50 rounded-xl p-3">
                    <p className="text-2xl font-black text-violet-600">12</p>
                    <p className="text-xs text-gray-500 mt-0.5">Issues sent</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Current issue · {weekLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[...myPosts]
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 3)
                      .map((post) => (
                        <Link
                          key={post.id}
                          to={`/post/${post.slug}`}
                          className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 px-2.5 py-1 rounded-full transition truncate max-w-[180px]"
                        >
                          {post.title}
                        </Link>
                      ))}
                    {myPosts.length === 0 && (
                      <p className="text-xs text-gray-400">No posts yet — publish one to feature it in the digest.</p>
                    )}
                  </div>
                </div>
                {/* recent subscribers */}
                {subscribers.filter((s) => s.active).length > 0 && (
                  <div className="border-t mt-4 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Recent Subscribers
                    </p>
                    <div className="space-y-2">
                      {[...subscribers]
                        .filter((s) => s.active)
                        .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
                        .slice(0, 5)
                        .map((s) => (
                          <div key={s.email} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                {s.name[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-gray-800 text-xs font-medium">{s.name}</p>
                                <p className="text-gray-400 text-xs">{s.email}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{s.joinedAt}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              {totalReviews > 0 && (
                <div className="bg-white rounded-xl shadow p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Helpfulness Summary</h3>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{totalHelpful}</p>
                      <p className="text-xs text-gray-500">👍 Helpful</p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${Math.round((totalHelpful / totalReviews) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-center">
                        {Math.round((totalHelpful / totalReviews) * 100)}% positive · {totalReviews} total reviews
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{totalNotHelpful}</p>
                      <p className="text-xs text-gray-500">👎 Not helpful</p>
                    </div>
                  </div>
                </div>
              )}

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
                            <Link to={`/post/${post.slug}`} className="text-indigo-600 hover:underline font-medium">
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
            <div className="space-y-6">

              {/* ── Helpfulness Reviews ── */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Helpfulness Reviews</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {totalReviews} total
                  </span>
                </div>

                {totalReviews === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <p className="text-3xl mb-2">⭐</p>
                    <p className="font-medium">No helpfulness reviews yet.</p>
                    <p className="text-sm mt-1">Readers can rate your posts as helpful or not.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {myPosts
                      .filter((p) => (p.helpful || 0) + (p.notHelpful || 0) > 0)
                      .sort((a, b) => ((b.helpful || 0) + (b.notHelpful || 0)) - ((a.helpful || 0) + (a.notHelpful || 0)))
                      .map((post) => {
                        const h   = post.helpful    || 0;
                        const nh  = post.notHelpful || 0;
                        const tot = h + nh;
                        const pct = Math.round((h / tot) * 100);
                        return (
                          <div key={post.id} className="px-5 py-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <Link
                                to={`/post/${post.slug}`}
                                className="text-sm font-semibold text-indigo-600 hover:underline truncate"
                              >
                                {post.title}
                              </Link>
                              <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                                pct >= 70 ? "bg-green-100 text-green-700" :
                                pct >= 40 ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-600"
                              }`}>
                                {pct}% helpful
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 shrink-0">👍 {h}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-400" : "bg-red-400"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 shrink-0">{nh} 👎</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">{tot} review{tot !== 1 ? "s" : ""}</p>

                            {/* individual reviewer list */}
                            {post.reviews?.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {post.reviews.map((r, i) => (
                                  <span
                                    key={i}
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                      r.vote === "helpful"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-600 border border-red-200"
                                    }`}
                                  >
                                    {r.vote === "helpful" ? "👍" : "👎"} {r.reviewer}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* ── Comments ── */}
              <div className="bg-white rounded-xl shadow">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Comments on Your Posts</h3>
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
