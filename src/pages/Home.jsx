import { Link } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";

// ── Placeholder cover when no image ─────────────────────────────────────────
const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-teal-400 to-cyan-600",
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
];

function Cover({ post, index, className = "" }) {
  if (post.images?.length > 0) {
    return (
      <img
        src={post.images[0].url}
        alt={post.title}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} ${className}`} />;
}

// ── Hero post (large, left-aligned) ─────────────────────────────────────────
function HeroPost({ post, index }) {
  return (
    <Link to={`/post/${post.id}`} className="group relative block rounded-2xl overflow-hidden h-[480px]">
      <div className="absolute inset-0">
        <Cover post={post} index={index} className="group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <span className="inline-block bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          Featured
        </span>
        <h2 className="text-white text-3xl font-bold leading-tight mb-3 group-hover:text-indigo-200 transition max-w-2xl">
          {post.title}
        </h2>
        <p className="text-white/70 text-sm line-clamp-2 max-w-xl mb-5">{post.content}</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-sm border border-white/30">
            {post.author[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{post.author}</p>
            <p className="text-white/60 text-xs">{post.date}</p>
          </div>
          <div className="ml-auto flex items-center gap-4 text-white/60 text-xs">
            <span>{post.views ?? 0} views</span>
            <span>{post.likes ?? 0} likes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Standard card ────────────────────────────────────────────────────────────
function PostCard({ post, index }) {
  return (
    <Link to={`/post/${post.id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="relative h-44 overflow-hidden">
        <Cover post={post} index={index} className="group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-indigo-600 transition line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 flex-1">{post.content}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {post.author[0].toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 font-medium">{post.author}</span>
          </div>
          <span className="text-xs text-gray-400">{post.date}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Horizontal list card ─────────────────────────────────────────────────────
function ListCard({ post, index, rank }) {
  return (
    <Link to={`/post/${post.id}`} className="group flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 transition">
      <span className="text-4xl font-black text-gray-100 leading-none shrink-0 w-10 pt-1 group-hover:text-indigo-100 transition">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug text-sm">
          {post.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1.5">{post.author} · {post.date}</p>
      </div>
      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
        <Cover post={post} index={index} />
      </div>
    </Link>
  );
}

// ── Category tag ─────────────────────────────────────────────────────────────
const TAGS = ["Technology", "Design", "React", "Career", "Productivity", "Open Source"];

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const { posts } = usePosts();
  const { user }  = useAuth();

  const featured   = posts[0];
  const secondary  = posts.slice(1, 4);
  const trending   = posts.slice(0, 5);
  const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── HERO SECTION ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-2xl mb-12">
            <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Now publishing
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight mb-5">
              Where great<br />
              <span className="text-indigo-600">ideas</span> live.
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Discover expert writing on technology, design, and the craft of building software. Written by developers, for developers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/blog" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition text-sm">
                Browse articles
              </Link>
              {user ? (
                <Link to="/dashboard" className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition text-sm">
                  Go to dashboard
                </Link>
              ) : (
                <Link to="/register" className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition text-sm">
                  Start writing
                </Link>
              )}
            </div>
          </div>

          {/* stats row */}
          <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-100">
            {[
              { label: "Articles published", value: `${posts.length}` },
              { label: "Total reads",         value: totalViews.toLocaleString() },
              { label: "Active writers",      value: `${new Set(posts.map((p) => p.author)).size}` },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TAGS BAR ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
          {TAGS.map((tag) => (
            <button
              key={tag}
              className="shrink-0 text-xs font-medium text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-full border border-gray-200 hover:border-indigo-200 transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* left: featured + grid */}
          <div className="lg:col-span-2 space-y-10">

            {/* featured hero */}
            {featured && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Featured Story</h2>
                </div>
                <HeroPost post={featured} index={0} />
              </div>
            )}

            {/* secondary grid */}
            {secondary.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Latest Articles</h2>
                  <Link to="/blog" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
                    View all →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {secondary.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* right: sidebar */}
          <aside className="space-y-8">

            {/* trending */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">Trending</h3>
                <span className="text-xs text-gray-400">This week</span>
              </div>
              <div className="divide-y divide-gray-50">
                {trending.map((post, i) => (
                  <ListCard key={post.id} post={post} index={i + 1} rank={i + 1} />
                ))}
              </div>
            </div>

            {/* newsletter */}
            <div className="bg-indigo-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-1">Weekly digest</h3>
              <p className="text-indigo-200 text-sm mb-5 leading-relaxed">
                The best articles of the week, curated and delivered every Sunday.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-indigo-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-indigo-700 font-semibold text-sm py-2.5 rounded-lg hover:bg-indigo-50 transition"
                >
                  Subscribe free
                </button>
              </form>
            </div>

            {/* top authors */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Top Authors</h3>
              </div>
              <ul className="divide-y divide-gray-50">
                {Object.entries(
                  posts.reduce((acc, p) => {
                    if (!acc[p.author]) acc[p.author] = { posts: 0, views: 0 };
                    acc[p.author].posts += 1;
                    acc[p.author].views += p.views || 0;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1].views - a[1].views)
                  .slice(0, 4)
                  .map(([name, stats]) => (
                    <li key={name} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                        {name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                        <p className="text-xs text-gray-400">{stats.posts} posts · {stats.views} views</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

          </aside>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white font-black text-xs">B</span>
              </div>
              <span className="text-white font-black text-lg">BlogPro</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              A platform for developers and creators to share ideas that matter.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-4">Explore</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
              {!user && <li><Link to="/register" className="hover:text-white transition">Start writing</Link></li>}
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-4">Account</p>
            <ul className="space-y-2 text-sm">
              {user ? (
                <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-white transition">Sign in</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
                  <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-4 text-center text-xs">
          © {new Date().getFullYear()} BlogPro. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
