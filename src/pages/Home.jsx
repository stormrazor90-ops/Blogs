import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { useDigest } from "../context/DigestContext";
import { useToast } from "../context/ToastContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { motion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   THEME  — Dark editorial
   Accent : Amber-gold #D4A853  |  Deep red #C0392B
   BG     : Near-black warm tones
───────────────────────────────────────────────────────────────────────────── */
const ACCENT  = "#D4A853";
const ACCENT2 = "#C0392B";
const BG_DARK = "#0C0C0A";
const BG_CARD = "#141410";
const BG_MID  = "#1A1A16";

/* ── Picsum photo IDs — curated blog-relevant photos, always available ─────
   picsum.photos is free, no API key, never goes down.
   Each ID maps to a specific real photograph.
   Format: https://picsum.photos/id/{id}/{w}/{h}
─────────────────────────────────────────────────────────────────────────────*/
const PICSUM_IDS = [
  10,   // forest path — nature/calm
  20,   // laptop on desk — tech/work
  30,   // coffee cup — coffee/reading
  40,   // architecture — city/modern
  50,   // notebook writing — writing/desk
  60,   // camera lens — photography
  70,   // office team — startup
  80,   // minimal interior — design
  90,   // newspaper — journalism
  100,  // kitchen — food/cooking
  110,  // mountains — nature
  120,  // code screen — technology
  130,  // books — reading
  140,  // workspace — creative
  150,  // street — city
  160,  // portrait — people
  170,  // abstract — design
  180,  // forest — nature
  190,  // building — architecture
  200,  // beach — calm
];

/**
 * Returns a deterministic photo URL for a post.
 * Uses the post's own image if available, otherwise uses picsum.photos
 * which is always online and returns a real photo by numeric ID.
 */
function getImageUrl(post, index, w = 800, h = 500) {
  if (post.images?.length > 0) return post.images[0].url;
  const id = PICSUM_IDS[Math.abs(index) % PICSUM_IDS.length];
  return `https://picsum.photos/id/${id}/${w}/${h}`;
}

const stripHtml = (html) =>
  html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

/* ─────────────────────────────────────────────────────────────────────────────
   3-D TILT CARD WRAPPER
   Wraps any child — on mouse move the card tilts in 3D perspective
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, className = "", style = {}, intensity = 12 }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el   = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(el, {
      rotateY:   x * intensity,
      rotateX:  -y * intensity,
      scale:     1.03,
      duration:  0.4,
      ease:      "power2.out",
      transformPerspective: 800,
    });
  }, [intensity]);

  const onLeave = useCallback(() => {
    gsap.to(ref.current, {
      rotateY: 0, rotateX: 0, scale: 1,
      duration: 0.6, ease: "elastic.out(1,0.6)",
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transformStyle: "preserve-3d", willChange: "transform" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SPOTLIGHT SECTION WRAPPER
   A radial light follows the mouse inside the section
───────────────────────────────────────────────────────────────────────────── */
function SpotlightSection({ children, className = "", style = {} }) {
  const ref      = useRef(null);
  const lightRef = useRef(null);

  const onMove = useCallback((e) => {
    const el   = ref.current;
    const lt   = lightRef.current;
    if (!el || !lt) return;
    const rect = el.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    gsap.to(lt, {
      x, y, duration: 0.6, ease: "power2.out",
    });
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onMouseMove={onMove}
    >
      {/* spotlight blob */}
      <div
        ref={lightRef}
        className="absolute pointer-events-none rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${ACCENT}12 0%, transparent 65%)`,
          zIndex: 0,
          left: -300,
          top: -300,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL-REVEAL WRAPPER
───────────────────────────────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 52 },
      { opacity: 1, y: 0, duration: 1, delay, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" } }
    );
  }, [delay]);
  return <div ref={ref} className={className} style={{ opacity: 0 }}>{children}</div>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────────────────────────── */
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { n: 0 };
    const tw = gsap.to(obj, {
      n: to, duration: 2.2, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => { el.textContent = Math.round(obj.n).toLocaleString() + suffix; },
    });
    return () => tw.kill();
  }, [to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 1 — HERO  (modern split layout)
───────────────────────────────────────────────────────────────────────────── */
function Hero({ posts }) {
  const wrapRef   = useRef(null);
  const blobsRef  = useRef(null);
  const badgeRef  = useRef(null);
  const h1Ref     = useRef(null);
  const subRef    = useRef(null);
  const statsRef  = useRef(null);
  const ctaRef    = useRef(null);
  const gridRef   = useRef(null);

  const totalViews  = posts.reduce((s, p) => s + (p.views || 0), 0);
  const mosaicPosts = posts.slice(0, 5);

  /* ── GSAP entrance ── */
  useEffect(() => {
    if (!posts.length) return;
    [badgeRef, h1Ref, subRef, statsRef, ctaRef].forEach(r => {
      if (r.current) gsap.set(r.current, { opacity: 0, y: 36 });
    });
    if (h1Ref.current) gsap.set(h1Ref.current, { skewY: 2, y: 60 });
    if (gridRef.current) gsap.set(gridRef.current, { opacity: 0, x: 40 });

    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } });
    tl.to(badgeRef.current,  { opacity: 1, y: 0, duration: 0.6 })
      .to(h1Ref.current,     { opacity: 1, y: 0, skewY: 0, duration: 1.0 }, "-=0.3")
      .to(subRef.current,    { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
      .to(statsRef.current,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .to(ctaRef.current,    { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
      .to(gridRef.current,   { opacity: 1, x: 0, duration: 0.9, ease: "power2.out" }, "-=0.7");

    return () => tl.kill();
  }, [posts.length]);

  /* ── mouse parallax on blobs ── */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth  - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      blobsRef.current?.querySelectorAll(".hero-blob").forEach((b, i) => {
        gsap.to(b, { x: x * (i + 1) * 20, y: y * (i + 1) * 14, duration: 1.4, ease: "power2.out" });
      });
    };
    wrap.addEventListener("mousemove", onMove);
    return () => wrap.removeEventListener("mousemove", onMove);
  }, []);

  if (!posts.length) return null;

  return (
    <section
      ref={wrapRef}
      className="relative overflow-hidden min-h-screen flex items-center"
      style={{ background: BG_DARK }}
    >
      {/* ── ambient blobs ── */}
      <div ref={blobsRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="hero-blob absolute -top-40 left-1/4 w-[700px] h-[700px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,0.11) 0%, transparent 70%)" }} />
        <div className="hero-blob absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(192,57,43,0.08) 0%, transparent 70%)" }} />
        <div className="hero-blob absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)" }} />
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}45, transparent)` }} />
      </div>

      {/* ── split layout ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-0 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen">

        {/* LEFT — text */}
        <div className="flex flex-col justify-center">

          {/* badge */}
          <div ref={badgeRef} className="mb-7" style={{ opacity: 0 }}>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] px-4 py-2 rounded-full border"
              style={{ color: ACCENT, borderColor: `${ACCENT}30`, background: `${ACCENT}0d` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
              BlogPro — Top Stories
            </span>
          </div>

          {/* headline */}
          <h1
            ref={h1Ref}
            className="font-black leading-[0.9] tracking-tight text-white mb-6"
            style={{ fontSize: "clamp(3rem, 6vw, 6.5rem)", opacity: 0 }}
          >
            Stay<br />Informed.
            <br />
            <span style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #f0c060 50%, ${ACCENT2} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Stay Ahead.
            </span>
          </h1>

          {/* subtitle */}
          <p
            ref={subRef}
            className="text-base md:text-lg font-light leading-relaxed max-w-md mb-8"
            style={{ color: "rgba(255,255,255,0.42)", opacity: 0 }}
          >
            In-depth articles on technology, design, and software —
            written by experts, curated for builders.
          </p>

          {/* stats row */}
          <div ref={statsRef} className="flex gap-8 mb-9" style={{ opacity: 0 }}>
            {[
              { label: "Articles",    val: posts.length,  suffix: "+" },
              { label: "Total Reads", val: totalViews,    suffix: ""  },
              { label: "Writers",     val: new Set(posts.map(p => p.author)).size, suffix: "" },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-col">
                <p className="text-2xl md:text-3xl font-black text-white tabular-nums">
                  <Counter to={s.val} suffix={s.suffix} />
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: `${ACCENT}65` }}>
                  {s.label}
                </p>
                {i < 2 && (
                  <div className="absolute" style={{ display: "none" }} />
                )}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap gap-3" style={{ opacity: 0 }}>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] px-7 py-3.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ background: ACCENT, color: "#000", boxShadow: `0 8px 28px ${ACCENT}38` }}
              onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
              onMouseLeave={e => e.currentTarget.style.background = ACCENT}
            >
              Browse Articles →
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] px-7 py-3.5 rounded-full border transition-all duration-300 hover:scale-105"
              style={{ color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.15)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              Start Writing
            </Link>
          </div>
        </div>

        {/* RIGHT — image grid */}
        <div ref={gridRef} className="hidden lg:grid gap-3" style={{ opacity: 0, gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto" }}>

          {/* featured large card */}
          {mosaicPosts[0] && (
            <Link
              to={`/post/${mosaicPosts[0].slug}`}
              className="col-span-2 relative rounded-2xl overflow-hidden group"
              style={{ height: 260 }}
            >
              <img
                src={getImageUrl(mosaicPosts[0], 0, 900, 520)}
                alt={mosaicPosts[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {mosaicPosts[0].category && (
                <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm"
                  style={{ background: ACCENT2, color: "#fff" }}>
                  {mosaicPosts[0].category}
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white font-bold text-lg leading-snug line-clamp-2 mb-2">
                  {mosaicPosts[0].title}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: `${ACCENT}25`, color: ACCENT }}>
                    {mosaicPosts[0].author[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-white/50">{mosaicPosts[0].author}</span>
                </div>
              </div>
              {/* hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }} />
            </Link>
          )}

          {/* smaller cards */}
          {mosaicPosts.slice(1, 5).map((post, i) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="relative rounded-2xl overflow-hidden group"
              style={{ height: 180 }}
            >
              <img
                src={getImageUrl(post, i + 1, 500, 360)}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              {post.category && (
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm"
                  style={{ background: ACCENT2, color: "#fff" }}>
                  {post.category}
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm leading-snug line-clamp-2">
                  {post.title}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }} />
            </Link>
          ))}
        </div>

      </div>

      {/* bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, transparent, ${BG_DARK})` }} />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 2 — TICKER
───────────────────────────────────────────────────────────────────────────── */
function Ticker({ posts }) {
  if (!posts.length) return null;

  // Repeat enough times so the track is always much wider than any screen.
  // We need TWO identical halves so the -50% translateX loops seamlessly.
  const base = posts.length < 6
    ? [...posts, ...posts, ...posts, ...posts]   // pad short lists
    : posts;
  const half  = base;                            // one "set"
  const items = [...half, ...half];              // doubled for seamless loop

  return (
    <div
      className="flex items-center border-y"
      style={{ background: BG_CARD, borderColor: `${ACCENT}18`, overflow: "hidden" }}
    >
      {/* LIVE badge — sits outside the scrolling area */}
      <span
        className="shrink-0 text-xs font-black uppercase tracking-[0.2em] px-5 py-3 border-r self-stretch flex items-center"
        style={{ color: ACCENT, borderColor: `${ACCENT}20`, background: `${ACCENT}10` }}
      >
        Live
      </span>

      {/* scrolling strip */}
      <div className="overflow-hidden flex-1 h-10 flex items-center">
        {/* marquee-track has width:max-content and animates translateX(-50%) */}
        <div className="marquee-track">
          {items.map((p, i) => (
            <Link
              key={i}
              to={`/post/${p.slug}`}
              className="shrink-0 inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors duration-200"
            >
              <span className="w-1 h-1 rounded-full inline-block" style={{ background: ACCENT }} />
              {p.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 3 — HORIZONTAL PINNED SCROLL
   Cards slide left as user scrolls — each card has a real Unsplash photo
───────────────────────────────────────────────────────────────────────────── */
function HorizontalScroll({ posts }) {
  const pinRef   = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const pin   = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track || posts.length < 3) return;
    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 80),
        ease: "none",
        scrollTrigger: {
          trigger: pin, start: "top top",
          end: () => `+=${track.scrollWidth}`,
          scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
    }, pin);
    return () => ctx.revert();
  }, [posts]);

  const items = posts.slice(0, 8);

  return (
    <section ref={pinRef} className="overflow-hidden" style={{ background: BG_DARK }}>
      <div className="h-screen flex flex-col justify-center overflow-hidden">
        <div className="px-10 lg:px-16 mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] mb-2" style={{ color: ACCENT }}>Explore</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Latest Stories</h2>
          </div>
          <Link to="/blog"
            className="group flex items-center gap-2 text-sm font-bold transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
            View all <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        <div ref={trackRef} className="flex gap-5 pl-10 lg:pl-16 pr-20" style={{ width: "max-content" }}>
          {items.map((post, i) => (
            <TiltCard key={post.id}
              className="group relative rounded-xl overflow-hidden shrink-0 flex flex-col cursor-pointer"
              style={{ width: 340, height: 440, background: BG_CARD }}
              intensity={8}>
              <Link to={`/post/${post.slug}`} className="flex flex-col h-full">
                <div className="relative h-52 overflow-hidden">
                  <img src={getImageUrl(post, i, 680, 420)} alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {post.category && (
                    <span className="absolute top-3 left-3 text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-sm"
                      style={{ background: ACCENT2, color: "#fff" }}>
                      {post.category}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-4 text-5xl font-black leading-none select-none"
                    style={{ color: "rgba(255,255,255,0.06)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-white font-bold text-base leading-snug line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors duration-200">
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
                    <span className="text-xs text-white/30">{post.date}</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }} />
              </Link>
            </TiltCard>
          ))}
        </div>

        <div className="px-10 lg:px-16 mt-8 flex items-center gap-3">
          <div className="h-px flex-1 max-w-xs" style={{ background: "rgba(255,255,255,0.06)" }} />
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.2)" }}>
            Scroll to explore →
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 4 — PINNED FEATURE PANEL
   Left pins, right cards scroll in — spotlight effect on the section
───────────────────────────────────────────────────────────────────────────── */
function PinnedFeature({ posts }) {
  const sectionRef = useRef(null);
  const leftRef    = useRef(null);
  const items      = posts.slice(3, 7);

  useEffect(() => {
    if (items.length < 2) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${(items.length - 1) * window.innerHeight * 0.8}`,
        pin: leftRef.current,
        pinSpacing: false,
      });
      const cards = sectionRef.current.querySelectorAll(".pf-card");
      cards.forEach((card, i) => {
        if (i === 0) return;
        gsap.fromTo(card, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 75%", toggleActions: "play none none reverse" },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <SpotlightSection style={{ background: BG_MID }}>
      <section ref={sectionRef} className="relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* LEFT — pinned */}
            <div ref={leftRef} className="lg:h-screen flex flex-col justify-center py-20 pr-10 lg:pr-16">
              <FadeUp>
                <p className="text-xs font-black uppercase tracking-[0.22em] mb-4" style={{ color: ACCENT }}>
                  Editor's Picks
                </p>
                <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                  Stories Worth<br /><span style={{ color: ACCENT }}>Your Time.</span>
                </h2>
                <p className="text-white/40 text-base leading-relaxed max-w-sm mb-10">
                  Hand-picked by our editorial team — the articles that sparked the most conversation this week.
                </p>
                <Link to="/blog"
                  className="inline-flex items-center gap-3 text-sm font-bold px-6 py-3 rounded-full border transition-all duration-300 hover:scale-105"
                  style={{ color: ACCENT, borderColor: `${ACCENT}40`, background: `${ACCENT}08` }}
                  onMouseEnter={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#000"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${ACCENT}08`; e.currentTarget.style.color = ACCENT; }}>
                  Browse all articles <span>→</span>
                </Link>
              </FadeUp>
              <div className="absolute right-0 top-0 bottom-0 w-px hidden lg:block"
                style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}20, transparent)` }} />
            </div>

            {/* RIGHT — scrolling cards with real images */}
            <div className="py-20 pl-0 lg:pl-16 space-y-16">
              {items.map((post, i) => (
                <TiltCard key={post.id} intensity={6}
                  className="pf-card group block rounded-2xl overflow-hidden cursor-pointer"
                  style={{ opacity: i === 0 ? 1 : 0, background: BG_CARD }}>
                  <Link to={`/post/${post.slug}`} className="block">
                    <div className="relative h-64 overflow-hidden">
                      <img src={getImageUrl(post, i + 3, 700, 400)} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {post.category && (
                        <span className="absolute top-4 left-4 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-sm"
                          style={{ background: ACCENT2, color: "#fff" }}>
                          {post.category}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-white text-xl font-black leading-snug mb-3 group-hover:text-amber-300 transition-colors duration-200">
                        {post.title}
                      </h3>
                      <p className="text-white/40 text-sm line-clamp-2 mb-5">{stripHtml(post.content)}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                            style={{ background: `${ACCENT}20`, color: ACCENT }}>
                            {post.author[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-white/50 font-medium">{post.author}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-white/30">
                          <span>👁 {post.views ?? 0}</span>
                          <span>♥ {post.likes ?? 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                      style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }} />
                  </Link>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SpotlightSection>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 5 — STATS MARQUEE BAND
───────────────────────────────────────────────────────────────────────────── */
function StatsBand({ posts }) {
  const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);
  const authors    = new Set(posts.map(p => p.author)).size;
  const cats       = new Set(posts.map(p => p.category).filter(Boolean)).size;

  const base = [
    `${posts.length} Articles Published`,
    `${totalViews.toLocaleString()} Total Reads`,
    `${authors} Expert Writers`,
    `${totalLikes.toLocaleString()} Likes`,
    `${cats} Categories`,
    "Updated Daily",
    "Quality Journalism",
    "Every Day",
  ];
  // repeat 4× then double — guarantees the track is always wider than any screen
  const padded = [...base, ...base, ...base, ...base];
  const doubled = [...padded, ...padded];

  return (
    <div
      className="border-y py-4"
      style={{ background: `${ACCENT}08`, borderColor: `${ACCENT}18`, overflow: "hidden" }}
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="shrink-0 inline-flex items-center gap-4 text-sm font-bold uppercase tracking-[0.15em]"
            style={{ color: `${ACCENT}90` }}
          >
            {item}
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: `${ACCENT}50` }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED HOVER MODAL  (the cnippet pattern)
   • Each blog row is a full-width item
   • On hover a floating image card follows the cursor via GSAP quickTo
   • The image strip slides vertically to reveal the correct post image
   • A custom "View" cursor circle also follows
───────────────────────────────────────────────────────────────────────────── */
const modalScaleVariants = {
  initial: { scale: 0, x: "-50%", y: "-50%" },
  enter:   { scale: 1, x: "-50%", y: "-50%", transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } },
  closed:  { scale: 0, x: "-50%", y: "-50%", transition: { duration: 0.35, ease: [0.32, 0, 0.67, 0] } },
};

function BlogHoverModal({ modal, posts }) {
  const { active, index } = modal;
  const containerRef  = useRef(null);
  const cursorRef     = useRef(null);
  const labelRef      = useRef(null);

  useEffect(() => {
    const xContainer  = gsap.quickTo(containerRef.current,  "left", { duration: 0.8,  ease: "power3" });
    const yContainer  = gsap.quickTo(containerRef.current,  "top",  { duration: 0.8,  ease: "power3" });
    const xCursor     = gsap.quickTo(cursorRef.current,     "left", { duration: 0.5,  ease: "power3" });
    const yCursor     = gsap.quickTo(cursorRef.current,     "top",  { duration: 0.5,  ease: "power3" });
    const xLabel      = gsap.quickTo(labelRef.current,      "left", { duration: 0.45, ease: "power3" });
    const yLabel      = gsap.quickTo(labelRef.current,      "top",  { duration: 0.45, ease: "power3" });

    const onMove = (e) => {
      xContainer(e.clientX); yContainer(e.clientY);
      xCursor(e.clientX);    yCursor(e.clientY);
      xLabel(e.clientX);     yLabel(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      {/* floating image card */}
      <motion.div
        ref={containerRef}
        variants={modalScaleVariants}
        initial="initial"
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-[9980] overflow-hidden rounded-2xl shadow-2xl"
        style={{ width: 340, height: 220, top: 0, left: 0 }}
      >
        {/* vertical strip — slides to show correct image */}
        <div
          className="absolute w-full transition-[top] duration-500"
          style={{
            top: `${index * -100}%`,
            height: `${posts.length * 100}%`,
            transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
          }}
        >
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="relative w-full"
              style={{ height: `${100 / posts.length}%` }}
            >
              <img
                src={getImageUrl(post, i, 680, 440)}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              {/* overlay with post info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {post.category && (
                  <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-sm mb-2 inline-block"
                    style={{ background: ACCENT2, color: "#fff" }}>
                    {post.category}
                  </span>
                )}
                <p className="text-white text-sm font-bold line-clamp-1">{post.title}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* custom cursor circle */}
      <motion.div
        ref={cursorRef}
        variants={modalScaleVariants}
        initial="initial"
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-[9981] w-20 h-20 rounded-full flex items-center justify-center"
        style={{ top: 0, left: 0, background: ACCENT }}
      />

      {/* "View" label */}
      <motion.div
        ref={labelRef}
        variants={modalScaleVariants}
        initial="initial"
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-[9982] w-20 h-20 rounded-full flex items-center justify-center text-xs font-black uppercase tracking-widest"
        style={{ top: 0, left: 0, color: "#000" }}
      >
        View
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 6 — TRENDING + SIDEBAR
   Blog rows use the animated hover modal (cnippet pattern)
───────────────────────────────────────────────────────────────────────────── */
function TrendingGrid({ posts }) {
  const trending = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
  const recent   = posts.slice(7, 13);
  const [modal, setModal] = useState({ active: false, index: 0 });

  const topAuthors = Object.entries(
    posts.reduce((acc, p) => {
      if (!acc[p.author]) acc[p.author] = { posts: 0, views: 0 };
      acc[p.author].posts += 1;
      acc[p.author].views += p.views || 0;
      return acc;
    }, {})
  ).sort((a, b) => b[1].views - a[1].views).slice(0, 5);

  return (
    <section className="relative overflow-hidden" style={{ background: BG_DARK }}>

      {/* ── ANIMATED HOVER MODAL ── */}
      <BlogHoverModal modal={modal} posts={trending} />

      {/* ── SECTION HEADER ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-0">
        <FadeUp className="flex items-end justify-between mb-0">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] mb-3" style={{ color: ACCENT }}>
              Trending Now
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
              Most Read<br />
              <span style={{ color: ACCENT }}>This Week.</span>
            </h2>
          </div>
          <Link to="/blog"
            className="hidden lg:flex items-center gap-2 text-sm font-bold mb-2 transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
            View all articles →
          </Link>
        </FadeUp>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-3 gap-16">

          {/* LEFT — blog rows with hover modal */}
          <div className="lg:col-span-2">
            {/* description line */}
            <FadeUp>
              <p className="text-white/35 text-base leading-relaxed max-w-lg mb-10 font-light border-b pb-10"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                Our most-read articles this week — curated by views, engagement, and editorial picks.
              </p>
            </FadeUp>

            {/* rows */}
            <div>
              {trending.map((post, i) => (
                <FadeUp key={post.id} delay={i * 0.05}>
                  <Link
                    to={`/post/${post.slug}`}
                    className="group flex items-center justify-between border-b transition-all duration-300 py-8 px-2"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    onMouseEnter={() => setModal({ active: true, index: i })}
                    onMouseLeave={() => setModal({ active: false, index: i })}
                  >
                    {/* left: number + text */}
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      {/* rank number */}
                      <span
                        className="text-[4rem] font-black leading-none shrink-0 select-none w-16 transition-colors duration-300"
                        style={{ color: "rgba(255,255,255,0.05)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* text block */}
                      <div className="flex-1 min-w-0">
                        {post.category && (
                          <span
                            className="text-xs font-black uppercase tracking-[0.18em] mb-2 block transition-colors duration-300"
                            style={{ color: ACCENT }}
                          >
                            {post.category}
                          </span>
                        )}
                        <h3
                          className="text-white font-black text-xl md:text-2xl leading-tight line-clamp-1 transition-all duration-300 group-hover:translate-x-2"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {post.title}
                        </h3>
                        <p className="text-white/30 text-sm mt-2 transition-all duration-300 group-hover:translate-x-2">
                          {post.author}
                          <span className="mx-2 opacity-40">·</span>
                          {post.date}
                          <span className="mx-2 opacity-40">·</span>
                          <span style={{ color: `${ACCENT}80` }}>👁 {post.views ?? 0}</span>
                        </p>
                      </div>
                    </div>

                    {/* right: arrow */}
                    <div
                      className="shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ml-4 transition-all duration-300 group-hover:scale-110"
                      style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.2)",
                      }}
                    >
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>

            <FadeUp className="mt-8">
              <Link to="/blog"
                className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.15em] px-7 py-3.5 rounded-full border transition-all duration-300 hover:scale-105"
                style={{ color: ACCENT, borderColor: `${ACCENT}35`, background: `${ACCENT}08` }}
                onMouseEnter={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#000"; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${ACCENT}08`; e.currentTarget.style.color = ACCENT; }}>
                Browse all articles →
              </Link>
            </FadeUp>
          </div>

          {/* RIGHT — sidebar */}
          <aside className="space-y-8 pt-0 lg:pt-[7.5rem]">

            {/* recent */}
            <FadeUp delay={0.1}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-5 h-px" style={{ background: ACCENT }} />
                <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: ACCENT }}>Recent</p>
              </div>
              <div className="space-y-1">
                {recent.map((post, i) => (
                  <Link key={post.id} to={`/post/${post.slug}`}
                    className="group flex gap-3 items-start p-3 rounded-xl transition-all duration-200"
                    onMouseEnter={e => e.currentTarget.style.background = `${ACCENT}08`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                      <img src={getImageUrl(post, i + 7, 112, 112)} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-bold line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors duration-200">
                        {post.title}
                      </h4>
                      <p className="text-xs text-white/30 mt-1">{post.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </FadeUp>

            {/* top authors */}
            <FadeUp delay={0.2}>
              <div className="rounded-2xl p-6" style={{ background: BG_CARD, border: `1px solid rgba(255,255,255,0.05)` }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-5 h-px" style={{ background: ACCENT }} />
                  <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: ACCENT }}>Top Authors</p>
                </div>
                <ul className="space-y-4">
                  {topAuthors.map(([name, stats], i) => (
                    <li key={name} className="flex items-center gap-3">
                      <span className="text-xs font-black w-4 shrink-0" style={{ color: "rgba(255,255,255,0.15)" }}>{i + 1}</span>
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
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 7 — NEWSLETTER CTA
───────────────────────────────────────────────────────────────────────────── */
function Newsletter({ activeCount, isSubscribed, subscribe, user }) {
  const wrapRef = useRef(null);
  const [email, setEmail]     = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(isSubscribed(user?.email || ""));
  const { toast }             = useToast();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, scale: 0.97 }, {
        opacity: 1, scale: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const result = subscribe(email);
      setLoading(false);
      if (result === "ok") { setDone(true); toast("You're subscribed! 🎉 First digest arrives Sunday.", "success"); }
      else if (result === "duplicate") { setDone(true); toast("You're already subscribed!", "info"); }
      else toast("Please enter a valid email address.", "error");
    }, 600);
  };

  return (
    <section className="py-6 px-6 lg:px-10" style={{ background: BG_MID }}>
      <div ref={wrapRef} className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative"
        style={{ background: BG_CARD, border: `1px solid ${ACCENT}18`, opacity: 0 }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[100px]"
            style={{ background: `${ACCENT}08` }} />
        </div>
        <div className="relative z-10 px-10 lg:px-16 py-16 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-5"
              style={{ color: ACCENT, background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
              Weekly Digest
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">Never Miss a Story.</h2>
            <p className="text-white/40 text-base leading-relaxed max-w-md">
              <Counter to={activeCount} /> readers get the best articles every Sunday morning.
            </p>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[360px]">
            {done ? (
              <div className="text-center py-8 px-10 rounded-2xl"
                style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}>
                <p className="text-3xl mb-3">🎉</p>
                <p className="text-white font-black text-lg mb-1">You're in!</p>
                <p className="text-white/40 text-sm mb-4">First digest arrives this Sunday.</p>
                <Link to="/digest" className="text-sm font-bold" style={{ color: ACCENT }}>
                  Preview this week's digest →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input type="email" required placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={e => e.target.style.borderColor = `${ACCENT}50`}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 disabled:opacity-50"
                  style={{ background: ACCENT, color: "#000" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
                  onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
                  {loading ? "Subscribing…" : "Subscribe Free"}
                </button>
                <p className="text-center text-xs text-white/20">No spam. Unsubscribe anytime.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 8 — CATEGORIES GRID  (spotlight + tilt)
───────────────────────────────────────────────────────────────────────────── */
function CategoriesSection({ posts }) {
  const navigate = useNavigate();
  const cats = [...new Set(posts.map(p => p.category).filter(Boolean))].sort();
  if (!cats.length) return null;

  return (
    <SpotlightSection className="py-24" style={{ background: BG_MID }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeUp>
          <p className="text-xs font-black uppercase tracking-[0.22em] mb-3" style={{ color: ACCENT }}>Browse Topics</p>
          <h2 className="text-4xl font-black text-white mb-12">Explore by Category</h2>
        </FadeUp>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {cats.map((cat, i) => {
            const count = posts.filter(p => p.category === cat).length;
            return (
              <FadeUp key={cat} delay={i * 0.05}>
                <TiltCard intensity={10}
                  className="group w-full text-left p-5 rounded-xl transition-all duration-300 border cursor-pointer"
                  style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.05)" }}
                  onClick={() => navigate("/blog", { state: { category: cat } })}>
                  <button className="w-full text-left"
                    onMouseEnter={e => { e.currentTarget.closest(".group").style.borderColor = `${ACCENT}40`; e.currentTarget.closest(".group").style.background = `${ACCENT}08`; }}
                    onMouseLeave={e => { e.currentTarget.closest(".group").style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.closest(".group").style.background = BG_CARD; }}>
                    <p className="text-white font-bold text-sm mb-1">{cat}</p>
                    <p className="text-xs text-white/30">{count} article{count !== 1 ? "s" : ""}</p>
                    <div className="mt-3 h-px w-0 group-hover:w-full transition-all duration-500"
                      style={{ background: ACCENT }} />
                  </button>
                </TiltCard>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </SpotlightSection>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 9 — WRITE CTA
───────────────────────────────────────────────────────────────────────────── */
function WriteCTA({ user }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  }, []);

  return (
    <SpotlightSection className="py-24" style={{ background: BG_DARK }}>
      <div ref={ref} className="max-w-4xl mx-auto px-6 text-center" style={{ opacity: 0 }}>
        <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: ACCENT }}>Join the Community</p>
        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
          Have Something<br /><span style={{ color: ACCENT }}>to Say?</span>
        </h2>
        <p className="text-white/40 text-lg leading-relaxed max-w-xl mx-auto mb-10">
          Join thousands of writers sharing ideas that push the industry forward.
        </p>
        {user ? (
          <Link to="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 hover:scale-105"
            style={{ background: ACCENT, color: "#000" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
            onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
            Go to Dashboard →
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 hover:scale-105"
              style={{ background: ACCENT, color: "#000" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
              onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
              Start Writing Free →
            </Link>
            <Link to="/blog"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-[0.15em] border transition-all duration-300 hover:scale-105"
              style={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.15)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
              Browse Articles
            </Link>
          </div>
        )}
      </div>
    </SpotlightSection>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────────────────────── */
function Footer({ user }) {
  return (
    <footer style={{ background: "#080806", borderTop: `1px solid rgba(255,255,255,0.05)` }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid sm:grid-cols-4 gap-10">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm"
              style={{ background: ACCENT }}>B</div>
            <span className="text-white font-black text-xl tracking-tight">BlogPro</span>
          </div>
          <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-6">
            A platform for developers and creators to share ideas that matter. Quality writing, every day.
          </p>
          <div className="flex gap-2">
            {["Twitter", "LinkedIn", "RSS"].map(s => (
              <span key={s}
                className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = `${ACCENT}40`; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-white font-black text-xs uppercase tracking-[0.2em] mb-5">Explore</p>
          <ul className="space-y-3 text-sm">
            {[{to:"/",label:"Home"},{to:"/blog",label:"Blog"},{to:"/about",label:"About Us"},{to:"/contact",label:"Contact"},{to:"/digest",label:"Weekly Digest"}].map(l => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-white font-black text-xs uppercase tracking-[0.2em] mb-5">Account</p>
          <ul className="space-y-3 text-sm">
            {user ? (
              <li><Link to="/dashboard" className="transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>Dashboard</Link></li>
            ) : (
              <>
                <li><Link to="/login" className="transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>Sign In</Link></li>
                <li><Link to="/register" className="transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        style={{ borderColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" }}>
        <span>© {new Date().getFullYear()} BlogPro. All rights reserved.</span>
        <div className="flex gap-5">
          <Link to="/about" className="hover:text-white transition-colors duration-200">About</Link>
          <Link to="/contact" className="hover:text-white transition-colors duration-200">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT — Home
───────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { posts }                                = usePosts();
  const { user }                                 = useAuth();
  const { subscribe, isSubscribed, activeCount } = useDigest();

  /* Lenis smooth scroll */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); gsap.ticker.remove(tick); };
  }, []);

  return (
    <div style={{ background: BG_DARK, color: "#fff" }}>

      {/* 1 — Ticker */}
      <Ticker posts={posts} />

      {/* 2 — Hero: GSAP entrance + mouse parallax + tilt cards */}
      <Hero posts={posts} />

      {/* 3 — Horizontal pinned scroll */}
      {posts.length >= 4 && <HorizontalScroll posts={posts} />}

      {/* 4 — Pinned feature panel + spotlight */}
      {posts.length >= 5 && <PinnedFeature posts={posts} />}

      {/* 5 — Stats marquee */}
      <StatsBand posts={posts} />

      {/* 6 — Trending + floating image preview on hover */}
      <TrendingGrid posts={posts} />

      {/* 7 — Newsletter */}
      <Newsletter
        activeCount={activeCount}
        isSubscribed={isSubscribed}
        subscribe={subscribe}
        user={user}
      />

      {/* 8 — Categories + spotlight + tilt */}
      <CategoriesSection posts={posts} />

      {/* 9 — Write CTA + spotlight */}
      <WriteCTA user={user} />

      {/* Footer */}
      <Footer user={user} />
    </div>
  );
}
