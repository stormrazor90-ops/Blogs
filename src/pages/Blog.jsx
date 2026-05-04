import { useState } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";

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

// ── Large card (first post) ──────────────────────────────────────────────────
function FeaturedCard({ post, index }) {
  return (
    <Link
      to={`/post/${post.id}`}
      className="group grid md:grid-cols-5 gap-0 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300"
    >
      <div className="md:col-span-3 relative h-64 md:h-auto overflow-hidden">
        <Cover post={post} index={index} className="group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <div className="md:col-span-2 p-8 flex flex-col justify-center">
        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
          Editor's Pick
        </span>
        <h2 className="text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-indigo-600 transition">
          {post.title}
        </h2>
        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-6">{post.content}</p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            {post.author[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{post.author}</p>
            <p className="text-xs text-gray-400">{post.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
          <span>{post.views ?? 0} views</span>
          <span>{post.likes ?? 0} likes</span>
          <span>{post.comments?.length ?? 0} comments</span>
        </div>
      </div>
    </Link>
  );
}

// ── Standard card ────────────────────────────────────────────────────────────
function BlogCard({ post, index }) {
  return (
    <Link
      to={`/post/${post.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <Cover post={post} index={index} className="group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-indigo-600 transition line-clamp-2">
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
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{post.views ?? 0} views</span>
            <span>{post.likes ?? 0} likes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Blog() {
  const { posts } = usePosts();
  const { user }  = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState("newest");

  const filtered = posts
    .filter((p) =>
      [p.title, p.content, p.author].join(" ").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "popular")  return (b.views || 0) - (a.views || 0);
      if (sort === "comments") return (b.comments?.length || 0) - (a.comments?.length || 0);
      return new Date(b.date) - new Date(a.date);
    });

  const featured = filtered[0];
  const rest     = filtered.slice(1);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── page header ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">The Blog</h1>
          <p className="text-gray-500">
            {posts.length} articles from {new Set(posts.map((p) => p.author)).size} writers.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── main ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* search + sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search articles, authors…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              >
                <option value="newest">Newest first</option>
                <option value="popular">Most popular</option>
                <option value="comments">Most discussed</option>
              </select>
            </div>

            {/* results */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-gray-700 mb-1">No results for "{search}"</p>
                <p className="text-sm text-gray-400 mb-5">Try a different keyword.</p>
                <button onClick={() => setSearch("")} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* featured card */}
                {featured && !search && <FeaturedCard post={featured} index={0} />}

                {/* grid */}
                <div className="grid sm:grid-cols-2 gap-5">
                  {(search ? filtered : rest).map((post, i) => (
                    <BlogCard key={post.id} post={post} index={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── sidebar ── */}
          <aside className="lg:w-72 shrink-0 space-y-6">

            {/* write CTA */}
            {user ? (
              <div className="bg-white rounded-xl border border-indigo-200 p-6">
                <h3 className="font-bold text-gray-900 mb-2">Your Dashboard</h3>
                <p className="text-gray-500 text-sm mb-4">Manage your posts and view your insights.</p>
                <Link
                  to="/dashboard"
                  className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition"
                >
                  Go to Dashboard →
                </Link>
              </div>
            ) : (
              <div className="bg-indigo-600 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Write for BlogPro</h3>
                <p className="text-indigo-200 text-sm mb-5 leading-relaxed">
                  Share your knowledge with thousands of readers.
                </p>
                <Link
                  to="/register"
                  className="block text-center bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition"
                >
                  Start writing →
                </Link>
              </div>
            )}

            {/* trending */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Trending</h3>
              </div>
              <ul className="divide-y divide-gray-50">
                {[...posts]
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 5)
                  .map((post, i) => (
                    <li key={post.id}>
                      <Link to={`/post/${post.id}`} className="group flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition">
                        <span className="text-xl font-black text-gray-100 leading-none shrink-0 w-6 pt-0.5 group-hover:text-indigo-100 transition">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{post.author} · {post.views ?? 0} views</p>
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
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
                  .slice(0, 5)
                  .map(([name, stats]) => (
                    <li key={name} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
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

      {/* ── footer ── */}
      <footer className="bg-gray-900 text-gray-400 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">B</span>
            </div>
            <span className="text-white font-black">BlogPro</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} BlogPro. All rights reserved.</p>
          <div className="flex gap-5 text-sm">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/blog" className="hover:text-white transition">Blog</Link>
            {user
              ? <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
              : <Link to="/register" className="hover:text-white transition">Register</Link>
            }
          </div>
        </div>
      </footer>

    </div>
  );
}
