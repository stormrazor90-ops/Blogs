import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * ScrollExpandMedia — ported from Next.js TypeScript to plain React JS.
 * A rectangle expands as the user scrolls, "diving" into the content below.
 * Works with mediaType="image" only (no Next/Image dependency).
 */
export default function ScrollExpandMedia({
  mediaSrc,
  bgImageSrc,
  title = "",
  date = "",
  scrollToExpand = "Scroll to explore",
  textBlend = false,
  children,
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent]       = useState(false);
  const [fullyExpanded, setFullyExpanded]   = useState(false);
  const [touchStartY, setTouchStartY]       = useState(0);
  const [isMobile, setIsMobile]             = useState(false);

  /* mobile detection */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* scroll / touch / wheel handlers */
  useEffect(() => {
    const handleWheel = (e) => {
      if (fullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setFullyExpanded(false);
        e.preventDefault();
        return;
      }
      if (!fullyExpanded) {
        e.preventDefault();
        const delta = e.deltaY * 0.0009;
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + delta, 0), 1);
          if (next >= 1) { setFullyExpanded(true); setShowContent(true); }
          else if (next < 0.75) setShowContent(false);
          return next;
        });
      }
    };

    const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);

    const handleTouchMove = (e) => {
      if (!touchStartY) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      if (fullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setFullyExpanded(false);
        e.preventDefault();
        return;
      }
      if (!fullyExpanded) {
        e.preventDefault();
        const factor = deltaY < 0 ? 0.008 : 0.005;
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + deltaY * factor, 0), 1);
          if (next >= 1) { setFullyExpanded(true); setShowContent(true); }
          else if (next < 0.75) setShowContent(false);
          return next;
        });
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => setTouchStartY(0);
    const handleScroll   = () => { if (!fullyExpanded) window.scrollTo(0, 0); };

    window.addEventListener("wheel",      handleWheel,      { passive: false });
    window.addEventListener("scroll",     handleScroll);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove",  handleTouchMove,  { passive: false });
    window.addEventListener("touchend",   handleTouchEnd);

    return () => {
      window.removeEventListener("wheel",      handleWheel);
      window.removeEventListener("scroll",     handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove",  handleTouchMove);
      window.removeEventListener("touchend",   handleTouchEnd);
    };
  }, [scrollProgress, fullyExpanded, touchStartY]);

  const mediaW = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaH = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTX = scrollProgress * (isMobile ? 180 : 150);

  const firstWord = title.split(" ")[0] || "";
  const restTitle = title.split(" ").slice(1).join(" ") || "";

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">

          {/* background image fades out as card expands */}
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <img
              src={bgImageSrc}
              alt="Background"
              className="w-screen h-screen object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">

              {/* expanding media rectangle */}
              <div
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden transition-none"
                style={{
                  width:     `${mediaW}px`,
                  height:    `${mediaH}px`,
                  maxWidth:  "95vw",
                  maxHeight: "85vh",
                  boxShadow: "0 0 80px rgba(0,0,0,0.5)",
                }}
              >
                <img
                  src={mediaSrc}
                  alt={title}
                  className="w-full h-full object-cover rounded-xl"
                />
                <motion.div
                  className="absolute inset-0 bg-black/50 rounded-xl"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.7 - scrollProgress * 0.5 }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              {/* date + scroll hint */}
              <div className="flex flex-col items-center text-center relative z-10 mt-4">
                {date && (
                  <p
                    className="text-sm font-bold uppercase tracking-[0.2em] mb-2"
                    style={{
                      color: "#D4A853",
                      transform: `translateX(-${textTX}vw)`,
                    }}
                  >
                    {date}
                  </p>
                )}
                {scrollToExpand && (
                  <p
                    className="text-white/50 text-xs font-medium uppercase tracking-widest"
                    style={{ transform: `translateX(${textTX}vw)` }}
                  >
                    {scrollToExpand}
                  </p>
                )}
              </div>
            </div>

            {/* split title */}
            <div
              className={`flex items-center justify-center text-center gap-4 w-full relative z-10 flex-col ${
                textBlend ? "mix-blend-difference" : ""
              }`}
            >
              <motion.h2
                className="font-black text-white"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 6rem)",
                  transform: `translateX(-${textTX}vw)`,
                  lineHeight: 0.9,
                }}
              >
                {firstWord}
              </motion.h2>
              <motion.h2
                className="font-black text-white"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 6rem)",
                  transform: `translateX(${textTX}vw)`,
                  lineHeight: 0.9,
                  color: "#D4A853",
                }}
              >
                {restTitle}
              </motion.h2>
            </div>
          </div>

          {/* content revealed after full expansion */}
          <motion.section
            className="flex flex-col w-full px-6 md:px-16 py-10 lg:py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            {children}
          </motion.section>
        </div>
      </section>
    </div>
  );
}
