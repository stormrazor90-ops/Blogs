import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   THEME — matches site-wide dark editorial palette
───────────────────────────────────────────────────────────────────────────── */
const ACCENT  = "#D4A853";
const ACCENT2 = "#C0392B";
const BG_DARK = "#0C0C0A";
const BG_CARD = "#141410";
const BG_MID  = "#1A1A16";

const stripHtml = (html) =>
  html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

/* ── FadeUp scroll reveal ── */
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 36 }, {
      opacity: 1, y: 0, duration: 0.8, delay,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%" },
    });
  }, [delay]);
  return <div ref={ref} className={className} style={{ opacity: 0 }}>{children}</div>;
}

/* ── Stat card ── */
function StatCard({ label, value, sub, accent = false, icon }) {
  return (
    <div className="rounded-2xl p-6 border relative overflow-hidden"
      style={{ background: BG_CARD, borderColor: accent ? `${ACCENT}30` : "rgba(255,255,255,0.06)" }}>
      {accent && (
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${ACCENT}15` }} />
      )}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <span className="text-2xl">{icon}</span>
        {accent && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: ACCENT }} />}
      </div>
      <p className="text-3xl font-black text-white mb-1 relative z-10">{value}</p>
      <p className="text-xs font-bold uppercase tracking-[0.18em] relative z-10"
        style={{ color: accent ? ACCENT : "rgba(255,255,255,0.35)" }}>{label}</p>
      {sub && <p className="text-xs mt-1 relative z-10" style={{ color: "rgba(255,255,255,0.2)" }}>{sub}</p>}
    </div>
  );
}

/* ── Confirm modal ── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="rounded-2xl p-8 max-w-sm w-full border"
        style={{ background: BG_CARD, borderColor: `${ACCENT2}40` }}>
        <p className="text-2xl mb-2 text-center">⚠️</p>
        <p className="text-white font-bold text-center mb-2">Are you sure?</p>
        <p className="text-white/50 text-sm text-center mb-7">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-black transition-all duration-200"
            style={{ background: ACCENT2, color: "#fff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e04030"}
            onMouseLeave={e => e.currentTarget.style.background = ACCENT2}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Post Modal ── */
function EditPostModal({ post, onSave, onClose }) {
  const [title,    setTitle]    = useState(post.title);
  const [content,  setContent]  = useState(stripHtml(post.content));
  const [category, setCategory] = useState(post.category || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
      <div className="rounded-2xl w-full max-w-lg border"
        style={{ background: BG_CARD, borderColor: `${ACCENT}25` }}>
        <div className="flex items-center justify-between px-7 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-white font-black text-lg">Edit Post</p>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xl">✕</button>
        </div>
        <div className="p-7 space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.18em] mb-2 block"
              style={{ color: "rgba(255,255,255,0.4)" }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={e => e.target.style.borderColor = `${ACCENT}60`}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.18em] mb-2 block"
              style={{ color: "rgba(255,255,255,0.4)" }}>Category</label>
            <input value={category} onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Technology"
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={e => e.target.style.borderColor = `${ACCENT}60`}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.18em] mb-2 block"
              style={{ color: "rgba(255,255,255,0.4)" }}>Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={e => e.target.style.borderColor = `${ACCENT}60`}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>
        </div>
        <div className="flex gap-3 px-7 pb-7">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}>
            Cancel
          </button>
          <button onClick={() => onSave({ title, content, category })}
            className="flex-1 py-3 rounded-xl text-sm font-black transition-all duration-200"
            style={{ background: ACCENT, color: "#000" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
            onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit User Modal ── */
function EditUserModal({ user: u, onSave, onClose }) {
  const [name,  setName]  = useState(u.name);
  const [email, setEmail] = useState(u.email);
  const [role,  setRole]  = useState(u.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
      <div className="rounded-2xl w-full max-w-md border"
        style={{ background: BG_CARD, borderColor: `${ACCENT}25` }}>
        <div className="flex items-center justify-between px-7 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-white font-black text-lg">Edit User</p>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xl">✕</button>
        </div>
        <div className="p-7 space-y-5">
          {[
            { label: "Name",  val: name,  set: setName,  type: "text" },
            { label: "Email", val: email, set: setEmail, type: "email" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-bold uppercase tracking-[0.18em] mb-2 block"
                style={{ color: "rgba(255,255,255,0.4)" }}>{f.label}</label>
              <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={e => e.target.style.borderColor = `${ACCENT}60`}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.18em] mb-2 block"
              style={{ color: "rgba(255,255,255,0.4)" }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
              style={{ background: BG_MID, border: "1px solid rgba(255,255,255,0.1)" }}>
              {["reader", "author", "admin"].map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-7 pb-7">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}>
            Cancel
          </button>
          <button onClick={() => onSave({ name, email, role })}
            className="flex-1 py-3 rounded-xl text-sm font-black transition-all duration-200"
            style={{ background: ACCENT, color: "#000" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
            onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   TAB: OVERVIEW — stats + charts
───────────────────────────────────────────────────────────────────────────── */
function OverviewTab({ posts, users }) {
  const totalViews    = posts.reduce((s, p) => s + (p.views  || 0), 0);
  const totalLikes    = posts.reduce((s, p) => s + (p.likes  || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0);
  const authors       = new Set(posts.map(p => p.author)).size;
  const activeUsers   = users.filter(u => u.status === "active").length;
  const suspended     = users.filter(u => u.status === "suspended").length;

  /* top posts by views */
  const topPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  /* category breakdown */
  const catMap = posts.reduce((acc, p) => {
    const c = p.category || "Uncategorised";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] || 1;

  /* recent activity */
  const recent = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* stat cards */}
      <FadeUp>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Posts"    value={posts.length}  icon="📝" accent />
          <StatCard label="Total Views"    value={totalViews.toLocaleString()} icon="👁" />
          <StatCard label="Total Likes"    value={totalLikes}    icon="♥" />
          <StatCard label="Comments"       value={totalComments} icon="💬" />
        </div>
      </FadeUp>
      <FadeUp delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Authors"        value={authors}       icon="✍️" />
          <StatCard label="Total Users"    value={users.length}  icon="👥" accent />
          <StatCard label="Active Users"   value={activeUsers}   icon="✅" />
          <StatCard label="Suspended"      value={suspended}     icon="🚫" />
        </div>
      </FadeUp>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* top posts */}
        <FadeUp delay={0.1}>
          <div className="rounded-2xl border overflow-hidden" style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="w-4 h-px" style={{ background: ACCENT }} />
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Top Posts by Views</p>
            </div>
            <div className="p-4 space-y-3">
              {topPosts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4">
                  <span className="text-2xl font-black w-8 shrink-0 select-none"
                    style={{ color: "rgba(255,255,255,0.07)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.title}</p>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${((p.views || 0) / (topPosts[0]?.views || 1)) * 100}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: ACCENT }}>{p.views ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* category breakdown */}
        <FadeUp delay={0.15}>
          <div className="rounded-2xl border overflow-hidden" style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="w-4 h-px" style={{ background: ACCENT }} />
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Posts by Category</p>
            </div>
            <div className="p-4 space-y-3">
              {cats.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No categories yet</p>
              ) : cats.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-4">
                  <p className="text-sm text-white/70 w-28 shrink-0 truncate">{cat}</p>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / maxCat) * 100}%`, background: ACCENT }} />
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>

      {/* recent activity */}
      <FadeUp delay={0.2}>
        <div className="rounded-2xl border overflow-hidden" style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="w-4 h-px" style={{ background: ACCENT }} />
            <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Recent Activity</p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {recent.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: `${ACCENT}20`, color: ACCENT }}>
                  {p.author[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">by {p.author} · {p.date}</p>
                </div>
                <div className="flex gap-4 text-xs shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <span>👁 {p.views ?? 0}</span>
                  <span>♥ {p.likes ?? 0}</span>
                  <span>💬 {p.comments?.length ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   TAB: POSTS — full CRUD
───────────────────────────────────────────────────────────────────────────── */
function PostsTab({ posts, deletePost, updatePost, toast }) {
  const [search,    setSearch]    = useState("");
  const [confirm,   setConfirm]   = useState(null);   // post id to delete
  const [editing,   setEditing]   = useState(null);   // post object to edit
  const [sortBy,    setSortBy]    = useState("date");

  const filtered = posts
    .filter(p => [p.title, p.author, p.category || ""].join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "views")    return (b.views || 0) - (a.views || 0);
      if (sortBy === "likes")    return (b.likes || 0) - (a.likes || 0);
      if (sortBy === "comments") return (b.comments?.length || 0) - (a.comments?.length || 0);
      return new Date(b.date) - new Date(a.date);
    });

  const handleDelete = (id) => {
    deletePost(id);
    setConfirm(null);
    toast("Post deleted.", "success");
  };

  const handleSave = (id, updates) => {
    updatePost(id, updates);
    setEditing(null);
    toast("Post updated.", "success");
  };

  return (
    <div>
      {confirm && (
        <ConfirmModal
          message="This will permanently delete the post and all its comments."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {editing && (
        <EditPostModal
          post={editing}
          onSave={(updates) => handleSave(editing.id, updates)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input type="text" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={e => e.target.style.borderColor = `${ACCENT}50`}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
          <option value="date">Sort: Newest</option>
          <option value="views">Sort: Most Viewed</option>
          <option value="likes">Sort: Most Liked</option>
          <option value="comments">Sort: Most Discussed</option>
        </select>
        <span className="self-center text-xs px-3 py-1.5 rounded-full font-bold"
          style={{ background: `${ACCENT}15`, color: ACCENT }}>
          {filtered.length} posts
        </span>
      </div>

      {/* table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.06)" }}>
        {/* header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-black uppercase tracking-[0.18em]"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
          <span className="col-span-5">Post</span>
          <span className="col-span-2 hidden md:block">Author</span>
          <span className="col-span-2 hidden lg:block">Stats</span>
          <span className="col-span-2 hidden md:block">Date</span>
          <span className="col-span-3 md:col-span-1 text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-white/30 text-sm">No posts match your search.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {filtered.map(p => (
              <div key={p.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center group transition-colors duration-150"
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {/* title */}
                <div className="col-span-5 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.title}</p>
                  <p className="text-xs text-white/30 mt-0.5 truncate">{stripHtml(p.content).slice(0, 60)}…</p>
                  {p.category && (
                    <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm"
                      style={{ background: ACCENT2, color: "#fff" }}>{p.category}</span>
                  )}
                </div>
                {/* author */}
                <div className="col-span-2 hidden md:flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{ background: `${ACCENT}20`, color: ACCENT }}>
                    {p.author[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-white/50 truncate">{p.author}</span>
                </div>
                {/* stats */}
                <div className="col-span-2 hidden lg:flex gap-3 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <span>👁 {p.views ?? 0}</span>
                  <span>♥ {p.likes ?? 0}</span>
                  <span>💬 {p.comments?.length ?? 0}</span>
                </div>
                {/* date */}
                <div className="col-span-2 hidden md:block">
                  <span className="text-xs text-white/30">{p.date}</span>
                </div>
                {/* actions */}
                <div className="col-span-3 md:col-span-1 flex items-center justify-end gap-2">
                  <Link to={`/post/${p.slug}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}20`; e.currentTarget.style.color = ACCENT; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                    title="View">👁</Link>
                  <button onClick={() => setEditing(p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}20`; e.currentTarget.style.color = ACCENT; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                    title="Edit">✏️</button>
                  <button onClick={() => setConfirm(p.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT2}25`; e.currentTarget.style.color = ACCENT2; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                    title="Delete">🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   TAB: USERS — manage all users
───────────────────────────────────────────────────────────────────────────── */
function UsersTab({ users, posts, deleteUser, updateUser, suspendUser, toast, currentUser }) {
  const [search,  setSearch]  = useState("");
  const [confirm, setConfirm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users
    .filter(u => [u.name, u.username, u.email].join(" ").toLowerCase().includes(search.toLowerCase()))
    .filter(u => roleFilter === "all" || u.role === roleFilter);

  const handleDelete = (id) => {
    deleteUser(id);
    setConfirm(null);
    toast("User removed.", "success");
  };

  const handleSave = (id, updates) => {
    updateUser(id, updates);
    setEditing(null);
    toast("User updated.", "success");
  };

  const handleSuspend = (u) => {
    suspendUser(u.id);
    toast(u.status === "suspended" ? `${u.name} reactivated.` : `${u.name} suspended.`, "info");
  };

  const roleColor = (role) => {
    if (role === "admin")  return { bg: `${ACCENT}20`,  color: ACCENT };
    if (role === "author") return { bg: `${ACCENT2}20`, color: ACCENT2 };
    return { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" };
  };

  return (
    <div>
      {confirm && (
        <ConfirmModal
          message="This will permanently remove the user account."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {editing && (
        <EditUserModal
          user={editing}
          onSave={(updates) => handleSave(editing.id, updates)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={e => e.target.style.borderColor = `${ACCENT}50`}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        </div>
        <div className="flex gap-1.5">
          {["all", "admin", "author", "reader"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-200"
              style={roleFilter === r ? { background: ACCENT, color: "#000" } : { color: "rgba(255,255,255,0.4)" }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* user cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center rounded-2xl border"
            style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-3xl mb-3">👤</p>
            <p className="text-white/30 text-sm">No users match your search.</p>
          </div>
        ) : filtered.map(u => {
          const userPosts = posts.filter(p => p.author === u.username);
          const rc = roleColor(u.role);
          const isSelf = currentUser?.username === u.username;
          return (
            <div key={u.id} className="rounded-2xl border p-5 relative overflow-hidden transition-all duration-200"
              style={{ background: BG_CARD, borderColor: u.status === "suspended" ? `${ACCENT2}30` : "rgba(255,255,255,0.06)" }}>
              {u.status === "suspended" && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: `${ACCENT2}25`, color: ACCENT2 }}>Suspended</span>
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black shrink-0"
                  style={{ background: `${ACCENT}20`, color: ACCENT }}>
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{u.name}</p>
                  <p className="text-white/40 text-xs truncate">@{u.username}</p>
                  <p className="text-white/25 text-xs truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: rc.bg, color: rc.color }}>{u.role}</span>
                <span className="text-xs text-white/25">Joined {u.joined}</span>
              </div>
              <div className="flex gap-4 text-xs mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                <span>📝 {userPosts.length} posts</span>
                <span>👁 {userPosts.reduce((s, p) => s + (p.views || 0), 0)} views</span>
              </div>
              {!isSelf && (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(u)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 border"
                    style={{ color: ACCENT, borderColor: `${ACCENT}30`, background: `${ACCENT}08` }}
                    onMouseEnter={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#000"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${ACCENT}08`; e.currentTarget.style.color = ACCENT; }}>
                    Edit
                  </button>
                  <button onClick={() => handleSuspend(u)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 border"
                    style={{ color: u.status === "suspended" ? "#4ade80" : ACCENT2, borderColor: u.status === "suspended" ? "#4ade8030" : `${ACCENT2}30`, background: "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    {u.status === "suspended" ? "Reactivate" : "Suspend"}
                  </button>
                  <button onClick={() => setConfirm(u.id)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT2}25`; e.currentTarget.style.color = ACCENT2; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                    🗑
                  </button>
                </div>
              )}
              {isSelf && (
                <p className="text-xs text-center py-2" style={{ color: "rgba(255,255,255,0.2)" }}>— Your account —</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   TAB: COMMENTS — moderate all comments
───────────────────────────────────────────────────────────────────────────── */
function CommentsTab({ posts, updatePost, toast }) {
  const [search, setSearch] = useState("");

  /* flatten all comments with post context */
  const allComments = posts.flatMap(p =>
    (p.comments || []).map(c => ({ ...c, postId: p.id, postTitle: p.title, postSlug: p.slug }))
  ).filter(c =>
    [c.text, c.user, c.postTitle].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const deleteComment = (postId, commentId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    updatePost(postId, { comments: post.comments.filter(c => c.id !== commentId) });
    toast("Comment removed.", "success");
  };

  return (
    <div>
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input type="text" placeholder="Search comments…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm focus:outline-none max-w-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          onFocus={e => e.target.style.borderColor = `${ACCENT}50`}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.06)" }}>
        {allComments.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">💬</p>
            <p className="text-white/30 text-sm">No comments found.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {allComments.map(c => (
              <div key={`${c.postId}-${c.id}`} className="flex items-start gap-4 px-6 py-4 group transition-colors duration-150"
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  {c.user[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{c.user}</span>
                    <span className="text-xs text-white/25">·</span>
                    <span className="text-xs text-white/25">{c.date}</span>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed mb-1"
                    dangerouslySetInnerHTML={{ __html: c.text }} />
                  <Link to={`/post/${c.postSlug}`}
                    className="text-xs transition-colors duration-200"
                    style={{ color: `${ACCENT}70` }}
                    onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                    onMouseLeave={e => e.currentTarget.style.color = `${ACCENT}70`}>
                    on: {c.postTitle}
                  </Link>
                </div>
                <button onClick={() => deleteComment(c.postId, c.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0"
                  style={{ background: `${ACCENT2}20`, color: ACCENT2 }}
                  title="Delete comment">🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT — AdminPanel
───────────────────────────────────────────────────────────────────────────── */
export default function AdminPanel() {
  const { posts, deletePost, updatePost } = usePosts();
  const { user, users, deleteUser, updateUser, suspendUser } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();
  const headerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");

  /* entrance animation */
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }
  }, []);

  /* guard — only admins */
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: BG_DARK }}>
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-2xl font-black text-white mb-2">Access Restricted</h2>
          <p className="text-white/40 text-sm mb-8">You must be signed in as an admin to view this page.</p>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 hover:scale-105"
            style={{ background: ACCENT, color: "#000" }}>
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: BG_DARK }}>
        <div className="text-center">
          <p className="text-5xl mb-4">⛔</p>
          <h2 className="text-2xl font-black text-white mb-2">Admins Only</h2>
          <p className="text-white/40 text-sm mb-8">Your account doesn't have admin privileges.</p>
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-black uppercase tracking-[0.15em] border transition-all duration-300 hover:scale-105"
            style={{ color: ACCENT, borderColor: `${ACCENT}40` }}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview",  icon: "📊" },
    { id: "posts",    label: "Posts",     icon: "📝" },
    { id: "users",    label: "Users",     icon: "👥" },
    { id: "comments", label: "Comments",  icon: "💬" },
  ];

  return (
    <div className="min-h-screen" style={{ background: BG_DARK, color: "#fff" }}>

      {/* ── ambient blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(192,57,43,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-10">

        {/* ── header ── */}
        <div ref={headerRef} className="mb-10" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-black text-sm"
                  style={{ background: ACCENT }}>A</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: `${ACCENT}80` }}>
                    Admin Panel
                  </p>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Control<br />
                <span style={{
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #f0c060 50%, ${ACCENT2} 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>Centre.</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user.name || user.username}</p>
                <p className="text-xs" style={{ color: `${ACCENT}80` }}>Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black"
                style={{ background: `${ACCENT}20`, color: ACCENT }}>
                {(user.name || user.username || "A")[0].toUpperCase()}
              </div>
            </div>
          </div>

          {/* top accent line */}
          <div className="mt-6 h-px" style={{ background: `linear-gradient(90deg, ${ACCENT}40, transparent)` }} />
        </div>

        {/* ── tab nav ── */}
        <div className="flex gap-1 mb-8 p-1 rounded-2xl w-fit"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={activeTab === t.id
                ? { background: ACCENT, color: "#000" }
                : { color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── tab content ── */}
        {activeTab === "overview" && (
          <OverviewTab posts={posts} users={users || []} />
        )}
        {activeTab === "posts" && (
          <PostsTab posts={posts} deletePost={deletePost} updatePost={updatePost} toast={toast} />
        )}
        {activeTab === "users" && (
          <UsersTab
            users={users || []}
            posts={posts}
            deleteUser={deleteUser}
            updateUser={updateUser}
            suspendUser={suspendUser}
            toast={toast}
            currentUser={user}
          />
        )}
        {activeTab === "comments" && (
          <CommentsTab posts={posts} updatePost={updatePost} toast={toast} />
        )}

      </div>
    </div>
  );
}
