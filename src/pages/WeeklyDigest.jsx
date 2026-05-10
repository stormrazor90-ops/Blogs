import { useState } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { useDigest } from "../context/DigestContext";
import { useToast } from "../context/ToastContext";

const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-teal-400 to-cyan-600",
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
];

const stripHtml = (html) =>
  html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

function Cover({ post, index, className = "" }) {
  if (post.images?.length > 0)
    return <img src={post.images[0].url} alt={post.title} className={`w-full h-full object-cover ${className}`} />;
  return <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} ${className}`} />;
}

// ── inline subscribe form ────────────────────────────────────────────────────
function SubscribeForm({ compact = false }) {
  const { subscribe, isSubscribed } = useDigest();
  const { user }  = useAuth();
  const { toast } = useToast();

  const defaultEmail = user?.email || "";
  const [email,   setEmail]   = useState(defaultEmail);
  const [name,    setName]    = useState(user?.username || user?.name || "");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(isSubscribed(defaultEmail));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const result = subscribe(email, name);
      setLoading(false);
      if (result === "ok") {
        setDone(true);
        toast("You're subscribed! 🎉 First digest arrives Sunday.", "success");
      } else if (result === "duplicate") {
        toast("You're already subscribed with that email.", "info");
        setDone(true);
      } else {
        toast("Please enter a valid email address.", "error");
      }
    }, 600);
  };

  if (done) {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${compact ? "py-2" : "py-6"}`}>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-gray-800 text-sm">You're on the list!</p>
        <p className="text-xs text-gray-500">Digest arrives every Sunday morning.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {!compact && (
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      )}
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Subscribing…
          </>
        ) : "Subscribe free"}
      </button>
    </form>
  );
}

// ── digest post card ─────────────────────────────────────────────────────────
function DigestCard({ post, index, rank }) {
  return (
    <Link
      to={`/post/${post.slug}`}
      className="group flex gap-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all p-4"
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
        <Cover post={post} index={index} className="group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black text-gray-200 group-hover:text-indigo-200 transition">
            {String(rank).padStart(2, "0")}
          </span>
          {post.category && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              {post.category}
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition mb-1">
          {post.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{stripHtml(post.content)}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[9px]">
              {post.author[0].toUpperCase()}
            </div>
            {post.author}
          </span>
          <span>👁 {post.views ?? 0}</span>
          <span>❤️ {post.likes ?? 0}</span>
          <span>💬 {post.comments?.length ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}

// ── unsubscribe modal ────────────────────────────────────────────────────────
function UnsubscribeModal({ onClose, onConfirm }) {
  const [email, setEmail] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Unsubscribe</h3>
        <p className="text-sm text-gray-500 mb-5">
          Enter your email to remove yourself from the weekly digest.
        </p>
        <input
          type="email"
          autoFocus
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(email)}
            disabled={!email}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white transition"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────────────
export default function WeeklyDigest() {
  const { posts }                           = usePosts();
  const { activeCount, weekLabel, unsubscribe, isSubscribed } = useDigest();
  const { toast }                           = useToast();
  const [showUnsub, setShowUnsub]           = useState(false);

  // this week's digest = top 5 by views + 3 most recent + 2 most commented
  const byViews    = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const byRecent   = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const byComments = [...posts].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)).slice(0, 2);

  // deduplicate while preserving order
  const seen = new Set();
  const digestPosts = [...byViews, ...byRecent, ...byComments].filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const handleUnsubscribe = (email) => {
    if (!email.trim()) return;
    if (!isSubscribed(email)) {
      toast("That email isn't subscribed.", "error");
      return;
    }
    unsubscribe(email);
    setShowUnsub(false);
    toast("You've been unsubscribed.", "info");
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">

        {/* ── hero banner ── */}
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Every Sunday morning
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              The BlogPro Weekly Digest
            </h1>
            <p className="text-indigo-200 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              The best articles of the week, hand-picked and delivered straight to your inbox. No spam, ever.
            </p>

            {/* stats row */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              {[
                { label: "Subscribers",    value: activeCount.toLocaleString() },
                { label: "Issues sent",    value: "12" },
                { label: "Open rate",      value: "68%" },
                { label: "Articles/issue", value: `${digestPosts.length}` },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-black">{s.value}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* subscribe box */}
            <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-xl">
              <h2 className="text-gray-900 font-bold text-lg mb-1">Subscribe to the digest</h2>
              <p className="text-gray-500 text-sm mb-4">Join {activeCount.toLocaleString()} readers. Free forever.</p>
              <SubscribeForm />
              <p className="text-xs text-gray-400 mt-3 text-center">
                No spam · Unsubscribe anytime ·{" "}
                <button
                  onClick={() => setShowUnsub(true)}
                  className="underline hover:text-gray-600 transition"
                >
                  Unsubscribe
                </button>
              </p>
            </div>
          </div>
        </section>

        {/* ── this week's digest ── */}
        <div className="max-w-4xl mx-auto px-6 py-12">

          {/* week label */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">This Week's Issue</p>
              <h2 className="text-2xl font-black text-gray-900">{weekLabel}</h2>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-full">
              {digestPosts.length} articles
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* main: digest posts */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                🔥 Top Picks This Week
              </h3>
              {digestPosts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm">No posts yet — check back after some articles are published.</p>
                </div>
              ) : (
                digestPosts.map((post, i) => (
                  <DigestCard key={post.id} post={post} index={i} rank={i + 1} />
                ))
              )}
            </div>

            {/* sidebar */}
            <aside className="space-y-6">

              {/* what's inside */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4">What's inside every issue</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  {[
                    { icon: "🔥", text: "Top 5 most-read articles" },
                    { icon: "🆕", text: "Latest posts this week" },
                    { icon: "💬", text: "Most discussed stories" },
                    { icon: "✍️", text: "Editor's note & highlights" },
                    { icon: "📌", text: "Curated tips & resources" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-2.5">
                      <span className="text-base leading-none mt-0.5">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* past issues */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Past Issues</h3>
                <ul className="space-y-2">
                  {[
                    { label: "Apr 27 – May 3",  articles: 8 },
                    { label: "Apr 20 – Apr 26",  articles: 6 },
                    { label: "Apr 13 – Apr 19",  articles: 7 },
                    { label: "Apr 6 – Apr 12",   articles: 5 },
                  ].map((issue) => (
                    <li key={issue.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{issue.label}</span>
                      <span className="text-xs text-gray-400">{issue.articles} articles</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* mini subscribe */}
              <div className="bg-indigo-600 rounded-xl p-5 text-white">
                <h3 className="font-bold mb-1 text-sm">Don't miss next Sunday</h3>
                <p className="text-indigo-200 text-xs mb-4">
                  {activeCount} readers already subscribed.
                </p>
                <SubscribeForm compact />
              </div>

            </aside>
          </div>
        </div>

        {/* ── footer ── */}
        <footer className="bg-gray-900 text-gray-400 mt-10">
          <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white font-black text-xs">B</span>
              </div>
              <span className="text-white font-black">BlogPro Weekly</span>
            </div>
            <p className="text-xs">© {new Date().getFullYear()} BlogPro. All rights reserved.</p>
            <div className="flex gap-5 text-sm">
              <Link to="/" className="hover:text-white transition">Home</Link>
              <Link to="/blog" className="hover:text-white transition">Blog</Link>
              <button onClick={() => setShowUnsub(true)} className="hover:text-white transition">
                Unsubscribe
              </button>
            </div>
          </div>
        </footer>

      </div>

      {showUnsub && (
        <UnsubscribeModal
          onClose={() => setShowUnsub(false)}
          onConfirm={handleUnsubscribe}
        />
      )}
    </>
  );
}
