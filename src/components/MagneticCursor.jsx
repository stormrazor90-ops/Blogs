import { useEffect, useRef } from "react";
import gsap from "gsap";

const ACCENT = "#D4A853";

/**
 * Global magnetic cursor — renders a gold dot + lagging ring.
 * Mount this once at the app root so it works on every page.
 */
export default function MagneticCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const posRef  = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const rafRef  = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    /* ── move dot instantly ── */
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08, ease: "power3.out" });
    };

    /* ── ring lags behind with lerp ── */
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ringPos.current.x = lerp(ringPos.current.x, posRef.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, posRef.current.y, 0.12);
      gsap.set(ring, { x: ringPos.current.x, y: ringPos.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    /* ── hover: ring expands, dot shrinks ── */
    const onEnter = () => {
      gsap.to(ring, { scale: 2.4, opacity: 0.5, duration: 0.3, ease: "power2.out" });
      gsap.to(dot,  { scale: 0.3, duration: 0.3, ease: "power2.out" });
    };
    const onLeave = () => {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.4, ease: "elastic.out(1,0.5)" });
      gsap.to(dot,  { scale: 1, duration: 0.4, ease: "elastic.out(1,0.5)" });
    };

    /* ── attach to all interactive elements (including future ones via delegation) ── */
    const attachListeners = () => {
      document.querySelectorAll("a, button, [data-cursor], input, textarea, select, label")
        .forEach((el) => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
        });
    };

    attachListeners();

    /* re-attach when DOM changes (route changes add new links) */
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mousemove", onMove);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* small filled dot — snaps instantly */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 8,
          height: 8,
          background: ACCENT,
          mixBlendMode: "difference",
        }}
      />
      {/* larger ring — lags behind */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full -translate-x-1/2 -translate-y-1/2 border-2"
        style={{
          width: 36,
          height: 36,
          borderColor: ACCENT,
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
