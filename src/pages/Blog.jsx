import { useState, useEffect, useRef, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import InfiniteGallery from "../components/InfiniteGallery";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   THEME
───────────────────────────────────────────────────────────────────────────── */
const ACCENT  = "#D4A853";
const ACCENT2 = "#C0392B";
const BG_DARK = "#0C0C0A";
const BG_CARD = "#141410";

const PICSUM_IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200];

function getImageUrl(post, index, w = 800, h = 500) {
  if (post.images?.length > 0) return post.images[0].url;
  const id = PICSUM_IDS[Math.abs(index) % PICSUM_IDS.length];
  return `https://picsum.photos/id/${id}/${w}/${h}`;
}

const stripHtml = (html) =>
  html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

/* ── FadeUp ── */
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 48 }, {
      opacity: 1, y: 0, duration: 0.9, delay,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  }, [delay]);
  return <div ref={ref} className={className} style={{ opacity: 0 }}>{children}</div>;
}

/* ── Blog card (grid view) ── */
function BlogCard({ post, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/post/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 border"
      style={{ background: BG_CARD, borderColor: hovered ? `${ACCENT}35` : "rgba(255,255,255,0.05)",
               transform: hovered ? "translateY(-6px)" : "translateY(0)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className="relative h-52 overflow-hidden">
        <img src={getImageUrl(post, index, 680, 420)} alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.07)" : "scale(1)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {post.category && (
          <span className="absolute top-3 left-3 text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-sm"
            style={{ background: ACCENT2, color: "#fff" }}>
            {post.category}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-white font-bold text-base leading-snug line-clamp-2 mb-2 transition-colors duration-200"
          style={{ color: hovered ? ACCENT : "#fff" }}>
          {post.title}
        </h3>
        <p className="text-white/40 text-sm line-clamp-2 flex-1">{stripHtml(post.content)}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: `${ACCENT}20`, color: ACCENT }}>
              {post.author[0].toUpperCase()}
            </div>
            <span className="text-xs text-white/40 font-medium">{post.author}</span>
          </div>
          <div className="flex gap-3 text-xs text-white/30">
            <span>👁 {post.views ?? 0}</span>
            <span>♥ {post.likes ?? 0}</span>
          </div>
        </div>
      </div>
      <div className="h-0.5 transition-transform duration-500 origin-left"
        style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
                 transform: hovered ? "scaleX(1)" : "scaleX(0)" }} />
    </Link>
  );
}

/* ── Blog row (list view) ── */
function BlogRow({ post, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/post/${post.slug}`}
      className="group flex items-center gap-5 py-6 border-b transition-all duration-300"
      style={{ borderColor: hovered ? `${ACCENT}25` : "rgba(255,255,255,0.05)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
        <img src={getImageUrl(post, index, 192, 192)} alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.1)" : "scale(1)" }} />
      </div>
      <div className="flex-1 min-w-0">
        {post.category && (
          <span className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: ACCENT }}>
            {post.category}
          </span>
        )}
        <h3 className="text-white font-bold text-base leading-snug line-clamp-2 mb-2 transition-colors duration-200"
          style={{ color: hovered ? ACCENT : "#fff" }}>
          {post.title}
        </h3>
        <p className="text-white/35 text-sm line-clamp-1 mb-2">{stripHtml(post.content)}</p>
        <div className="flex items-center gap-4 text-xs text-white/30">
          <span>{post.author}</span><span>·</span>
          <span>{post.date}</span><span>·</span>
          <span>👁 {post.views ?? 0}</span>
        </div>
      </div>
      <div className="shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300"
        style={{ borderColor: hovered ? `${ACCENT}50` : "rgba(255,255,255,0.1)",
                 color: hovered ? ACCENT : "rgba(255,255,255,0.2)",
                 transform: hovered ? "scale(1.1)" : "scale(1)" }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BLOG HERO — immersive full-viewport hero with parallax zoom image
   The background image scales from 1.15 → 1.0 as the section scrolls out,
   giving a cinematic "zoom into the page" feel without any scroll hijacking.
───────────────────────────────────────────────────────────────────────────── */
function BlogHero({ posts }) {
  const sectionRef = useRef(null);
  const imgRef     = useRef(null);
  const textRef    = useRef(null);

  const heroImg = posts[0] ? getImageUrl(posts[0], 0, 1920, 1080) : `https://picsum.photos/id/10/1920/1080`;
  const totalWriters = new Set(posts.map(p => p.author)).size;

  /* parallax zoom — image scales down as user scrolls away */
  useEffect(() => {
    const section = sectionRef.current;
    const img     = imgRef.current;
    const text    = textRef.current;
    if (!section || !img) return;

    const ctx = gsap.context(() => {
      gsap.to(img, {
        scale: 1.0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(text, {
        y: 80,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "40% top",
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  /* entrance animation */
  useEffect(() => {
    if (!textRef.current) return;
    const els = textRef.current.querySelectorAll(".hero-el");
    gsap.fromTo(els,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.2 }
    );
  }, [posts.length]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden flex items-center justify-center"
      style={{ height: "100vh", minHeight: 600 }}
    >
      {/* background image — starts slightly zoomed, normalises on scroll */}
      <div
        ref={imgRef}
        className="absolute inset-0"
        style={{ scale: 1.15, willChange: "transform" }}
      >
        <img
          src={heroImg}
          alt="Blog hero"
          className="w-full h-full object-cover"
        />
        {/* layered overlays for depth */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(12,12,10,0.35) 0%, rgba(12,12,10,0.55) 50%, rgba(12,12,10,0.92) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(12,12,10,0.6) 100%)" }} />
      </div>

      {/* content */}
      <div ref={textRef} className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* eyebrow */}
        <div className="hero-el inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border"
          style={{ color: ACCENT, borderColor: `${ACCENT}30`, background: "rgba(12,12,10,0.6)", backdropFilter: "blur(12px)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
          <span className="text-xs font-bold uppercase tracking-[0.22em]">The BlogPro Archive</span>
        </div>

        {/* headline */}
        <h1
          className="hero-el font-black text-white leading-[0.9] tracking-tight mb-6"
          style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
        >
          Every Story.<br />
          <span style={{
            background: `linear-gradient(135deg, ${ACCENT} 0%, #f0c060 50%, ${ACCENT2} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            One Place.
          </span>
        </h1>

        {/* subtitle */}
        <p
          className="hero-el text-base md:text-lg font-light leading-relaxed max-w-xl mx-auto mb-10"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {posts.length} articles from {totalWriters} writers — explore, filter, and discover.
        </p>

        {/* stats strip */}
        <div className="hero-el flex flex-wrap justify-center gap-8 mb-10">
          {[
            { val: posts.length,   label: "Articles"  },
            { val: totalWriters,   label: "Writers"   },
            { val: [...new Set(posts.map(p => p.category).filter(Boolean))].length, label: "Topics" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-white">{s.val}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: `${ACCENT}70` }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* scroll cue */}
        <div className="hero-el flex flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.25)" }}>
            Scroll to explore
          </p>
          <div className="w-px h-10 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                height: "40%",
                background: ACCENT,
                animation: "scrollCue 1.6s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* bottom fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, transparent, ${BG_DARK})` }} />

      <style>{`
        @keyframes scrollCue {
          0%   { transform: translateY(-100%); opacity: 1; }
          100% { transform: translateY(300%);  opacity: 0; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL-TRIGGERED GALLERY SECTION
   The 3D InfiniteGallery activates as soon as the section border enters view.
   Uses an IntersectionObserver so the gallery only mounts (and starts flying)
   once the user scrolls to it — zero cost before that.
───────────────────────────────────────────────────────────────────────────── */
function ScrollGallerySection({ images }) {
  const sectionRef  = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }   // fires as soon as 5% of the section is in view
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ background: BG_DARK, borderTop: `1px solid rgba(212,168,83,0.12)` }}
    >
      {/* section header */}
      <FadeUp>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] mb-3" style={{ color: ACCENT }}>
              Visual Archive
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              All Stories,<br />
              <span style={{ color: ACCENT }}>One View.</span>
            </h2>
          </div>
          <p className="hidden lg:block text-sm text-white/25 mb-2 max-w-xs text-right leading-relaxed">
            Scroll or use arrow keys to fly through every article in the archive.
          </p>
        </div>
      </FadeUp>

      {/* 3D gallery — only mounts once section is visible */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          height: "100vh",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
        {visible && (
          <Suspense fallback={
            <div className="h-full flex items-center justify-center">
              <p className="text-white/30 text-sm uppercase tracking-widest animate-pulse">
                Loading gallery…
              </p>
            </div>
          }>
            <InfiniteGallery
              images={images}
              speed={1.2}
              visibleCount={Math.min(images.length, 12)}
              className="w-full h-full"
            />
          </Suspense>
        )}
      </div>

      {/* scroll hint */}
      <div className="text-center py-6 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <p className="text-xs uppercase tracking-[0.2em] text-white/20">
          Use mouse wheel · arrow keys · touch to navigate
        </p>
        <p className="text-xs text-white/10 mt-1">Auto-play resumes after 3 seconds</p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN BLOG EXPORT
   Flow:
   1. Article grid + sidebar (search, filter, cards)
   2. 3D InfiniteGallery tunnel (mid-page)
   3. Scroll-triggered 3D gallery (bottom, before footer)
   4. Footer
   3. 3D InfiniteGallery tunnel of all post images
   4. Footer
───────────────────────────────────────────────────────────────────────────── */
export default function Blog() {
  const { posts }    = usePosts();
  const { user }     = useAuth();
  const location     = useLocation();

  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("newest");
  const [category, setCategory] = useState(location.state?.category || "");
  const [viewMode, setViewMode] = useState("grid");

  /* Lenis smooth scroll */
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.3, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); gsap.ticker.remove(tick); };
  }, []);

  const allCategories = [...new Set(posts.map((p) => p.category).filter(Boolean))].sort();

  const filtered = posts
    .filter((p) => {
      const matchSearch = [p.title, stripHtml(p.content || ""), p.author]
        .join(" ").toLowerCase().includes(search.toLowerCase());
      const matchCat = !category || p.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sort === "popular")  return (b.views || 0) - (a.views || 0);
      if (sort === "comments") return (b.comments?.length || 0) - (a.comments?.length || 0);
      if (sort === "oldest")   return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date);
    });

  /* gallery images — all posts */
  const galleryImages = posts.map((post, i) => ({
    src: getImageUrl(post, i, 800, 500),
    alt: post.title,
  }));

  /* top authors */
  const topAuthors = Object.entries(
    posts.reduce((acc, p) => {
      if (!acc[p.author]) acc[p.author] = { posts: 0, views: 0 };
      acc[p.author].posts += 1;
      acc[p.author].views += p.views || 0;
      return acc;
    }, {})
  ).sort((a, b) => b[1].views - a[1].views).slice(0, 5);

  const trendingPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);


  return (
    <div style={{ background: BG_DARK, color: "#fff" }}>

      {/* ════════════════════════════════════════════════════════════════
          1 — IMMERSIVE HERO  (zoom-in on scroll, no hijacking)
      ════════════════════════════════════════════════════════════════ */}
      <BlogHero posts={posts} />

      {/* ════════════════════════════════════════════════════════════════
          2 — 3D GALLERY  (immediately below hero)
      ════════════════════════════════════════════════════════════════ */}
      {galleryImages.length >= 3 && (
        <ScrollGallerySection images={galleryImages} />
      )}

      {/* ════════════════════════════════════════════════════════════════
          3 — ARTICLE GRID
      ════════════════════════════════════════════════════════════════ */}
      <div style={{ background: BG_DARK }}>

          {/* sticky filter bar */}
          <div className="sticky top-16 z-40 border-b"
            style={{ background: `${BG_DARK}f0`, backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between gap-4">

              {/* search */}
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input type="text" placeholder="Search…" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={e => e.target.style.borderColor = `${ACCENT}50`}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
              </div>

              {/* categories */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 justify-center">
                <button onClick={() => setCategory("")}
                  className="shrink-0 text-xs font-black uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all duration-200"
                  style={!category ? { background: ACCENT, color: "#000" } : { color: "rgba(255,255,255,0.4)" }}>
                  All
                </button>
                {allCategories.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat === category ? "" : cat)}
                    className="shrink-0 text-xs font-black uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all duration-200"
                    style={category === cat ? { background: ACCENT, color: "#000" } : { color: "rgba(255,255,255,0.4)" }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* sort + view toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="text-xs font-bold uppercase tracking-[0.12em] px-3 py-2 rounded-lg focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Popular</option>
                  <option value="comments">Discussed</option>
                </select>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  {["grid", "list"].map((mode) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className="px-3 py-2 text-xs transition-all duration-200"
                      style={viewMode === mode ? { background: ACCENT, color: "#000" } : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)" }}>
                      {mode === "grid" ? (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                          <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
                          <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 16 16">
                          <line x1="1" y1="4" x2="15" y2="4" /><line x1="1" y1="8" x2="15" y2="8" /><line x1="1" y1="12" x2="15" y2="12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* main content + sidebar */}
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
            <div className="flex flex-col lg:flex-row gap-12">

              {/* articles */}
              <div className="flex-1 min-w-0">
                {filtered.length === 0 ? (
                  <FadeUp>
                    <div className="rounded-2xl py-24 text-center border"
                      style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.05)" }}>
                      <p className="text-5xl mb-5">🔍</p>
                      <p className="text-xl font-black text-white mb-2">No results</p>
                      <p className="text-sm text-white/30 mb-8">Try a different keyword or category.</p>
                      <div className="flex gap-4 justify-center">
                        {search && <button onClick={() => setSearch("")}
                          className="text-sm font-bold px-5 py-2.5 rounded-full border"
                          style={{ color: ACCENT, borderColor: `${ACCENT}40` }}>Clear search</button>}
                        {category && <button onClick={() => setCategory("")}
                          className="text-sm font-bold px-5 py-2.5 rounded-full border"
                          style={{ color: ACCENT, borderColor: `${ACCENT}40` }}>Clear category</button>}
                      </div>
                    </div>
                  </FadeUp>
                ) : (
                  <>
                    <FadeUp className="flex items-center gap-3 mb-8">
                      <span className="w-6 h-px" style={{ background: ACCENT }} />
                      <p className="text-xs font-black uppercase tracking-[0.2em]"
                        style={{ color: "rgba(255,255,255,0.35)" }}>
                        {filtered.length} Articles
                      </p>
                      {(search || category) && (
                        <button onClick={() => { setSearch(""); setCategory(""); }}
                          className="ml-auto text-xs font-bold transition-colors duration-200"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                          onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                          Clear filters ×
                        </button>
                      )}
                    </FadeUp>

                    {viewMode === "grid" ? (
                      <div className="grid sm:grid-cols-2 gap-5">
                        {filtered.map((post, i) => (
                          <FadeUp key={post.id} delay={i * 0.04}>
                            <BlogCard post={post} index={i} />
                          </FadeUp>
                        ))}
                      </div>
                    ) : (
                      <div>
                        {filtered.map((post, i) => (
                          <FadeUp key={post.id} delay={i * 0.03}>
                            <BlogRow post={post} index={i} />
                          </FadeUp>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* sidebar */}
              <aside className="lg:w-72 shrink-0 space-y-6">

                {/* write CTA */}
                <FadeUp delay={0.1}>
                  {user ? (
                    <div className="rounded-2xl p-6 border"
                      style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.06)" }}>
                      <p className="text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ color: ACCENT }}>Your Space</p>
                      <h3 className="text-white font-black text-lg mb-2">Dashboard</h3>
                      <p className="text-white/35 text-sm mb-5">Manage your posts and insights.</p>
                      <Link to="/dashboard"
                        className="block text-center text-sm font-black uppercase tracking-[0.15em] py-3 rounded-xl transition-all duration-300"
                        style={{ background: ACCENT, color: "#000" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
                        onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
                        Go to Dashboard →
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-6 border relative overflow-hidden"
                      style={{ background: BG_CARD, borderColor: `${ACCENT}18` }}>
                      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                        style={{ background: `${ACCENT}12` }} />
                      <p className="text-xs font-black uppercase tracking-[0.2em] mb-3 relative z-10" style={{ color: ACCENT }}>Join Us</p>
                      <h3 className="text-white font-black text-lg mb-2 relative z-10">Write for BlogPro</h3>
                      <p className="text-white/35 text-sm mb-5 relative z-10">Share your knowledge with thousands of readers.</p>
                      <Link to="/register"
                        className="block text-center text-sm font-black uppercase tracking-[0.15em] py-3 rounded-xl transition-all duration-300 relative z-10"
                        style={{ background: ACCENT, color: "#000" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
                        onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
                        Start Writing Free →
                      </Link>
                    </div>
                  )}
                </FadeUp>

                {/* browse topics */}
                {allCategories.length > 0 && (
                  <FadeUp delay={0.15}>
                    <div className="rounded-2xl overflow-hidden border"
                      style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.05)" }}>
                      <div className="px-5 py-4 border-b flex items-center gap-3"
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <span className="w-4 h-px" style={{ background: ACCENT }} />
                        <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Browse Topics</p>
                      </div>
                      <ul>
                        {allCategories.map((cat) => {
                          const count  = posts.filter((p) => p.category === cat).length;
                          const active = category === cat;
                          return (
                            <li key={cat} className="border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                              <button onClick={() => setCategory(active ? "" : cat)}
                                className="w-full flex items-center justify-between px-5 py-3.5 text-sm transition-all duration-200"
                                style={{ color: active ? ACCENT : "rgba(255,255,255,0.5)", background: active ? `${ACCENT}08` : "transparent" }}>
                                <span className="font-semibold">{cat}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                  style={{ background: active ? `${ACCENT}20` : "rgba(255,255,255,0.06)", color: active ? ACCENT : "rgba(255,255,255,0.3)" }}>
                                  {count}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </FadeUp>
                )}

                {/* trending */}
                <FadeUp delay={0.2}>
                  <div className="rounded-2xl overflow-hidden border"
                    style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="px-5 py-4 border-b flex items-center gap-3"
                      style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <span className="w-4 h-px" style={{ background: ACCENT }} />
                      <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Trending</p>
                    </div>
                    <ul>
                      {trendingPosts.map((post, i) => (
                        <li key={post.id} className="border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <Link to={`/post/${post.slug}`}
                            className="group flex items-start gap-3 px-5 py-3.5 transition-all duration-200"
                            onMouseEnter={e => e.currentTarget.style.background = `${ACCENT}06`}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <span className="text-2xl font-black leading-none shrink-0 w-6 pt-0.5 select-none"
                              style={{ color: "rgba(255,255,255,0.07)" }}>{i + 1}</span>
                            <div>
                              <p className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors duration-200">
                                {post.title}
                              </p>
                              <p className="text-xs text-white/30 mt-1">{post.author} · {post.views ?? 0} views</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeUp>

                {/* top authors */}
                <FadeUp delay={0.25}>
                  <div className="rounded-2xl overflow-hidden border"
                    style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="px-5 py-4 border-b flex items-center gap-3"
                      style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <span className="w-4 h-px" style={{ background: ACCENT }} />
                      <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Top Authors</p>
                    </div>
                    <ul>
                      {topAuthors.map(([name, stats], i) => (
                        <li key={name} className="flex items-center gap-3 px-5 py-3.5 border-b last:border-0"
                          style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <span className="text-xs font-black w-4 shrink-0" style={{ color: "rgba(255,255,255,0.12)" }}>{i + 1}</span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                            style={{ background: `${ACCENT}20`, color: ACCENT }}>
                            {name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{name}</p>
                            <p className="text-xs text-white/30">{stats.posts} posts · {stats.views.toLocaleString()} views</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeUp>

              </aside>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              3 — FOOTER
          ════════════════════════════════════════════════════════════════ */}
          <footer className="border-t mt-0" style={{ background: "#080806", borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-black text-xs"
                  style={{ background: ACCENT }}>B</div>
                <span className="text-white font-black text-lg tracking-tight">BlogPro</span>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                © {new Date().getFullYear()} BlogPro. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                {[
                  { to: "/",        label: "Home"      },
                  { to: "/blog",    label: "Blog"      },
                  { to: "/about",   label: "About"     },
                  { to: "/contact", label: "Contact"   },
                  user ? { to: "/dashboard", label: "Dashboard" } : { to: "/register", label: "Register" },
                ].map((l) => (
                  <Link key={l.to} to={l.to}
                    className="transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </footer>

        </div>

    </div>
  );
}
