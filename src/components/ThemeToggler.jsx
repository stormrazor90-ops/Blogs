"use client";
import { useState, useEffect, useRef, useId } from "react";
import { motion } from "motion/react";

/* ─────────────────────────────────────────────────────────────────────────────
   Animated Theme Toggler — sun ↔ moon morph
   Ported from TypeScript to plain JS. No shadcn, no lucide.
   Reads / writes the "dark" class on <html>.
───────────────────────────────────────────────────────────────────────────── */

/* ── tiny click sound ── */
let _ctx = null;
let _buf = null;

function audioCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function ensureBuf(ac) {
  if (_buf && _buf.sampleRate === ac.sampleRate) return _buf;
  const rate = ac.sampleRate;
  const len  = Math.floor(rate * 0.006);
  const buf  = ac.createBuffer(1, len, rate);
  const ch   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t     = i / len;
    const sine  = Math.sin(2 * Math.PI * 3400 * t);
    const noise = Math.random() * 2 - 1;
    ch[i] = (sine * 0.6 + noise * 0.4) * Math.pow(1 - t, 3);
  }
  _buf = buf;
  return buf;
}

function playTick(lastRef) {
  const now = performance.now();
  if (now - lastRef.current < 80) return;
  lastRef.current = now;
  try {
    const ac   = audioCtx();
    const buf  = ensureBuf(ac);
    const src  = ac.createBufferSource();
    const gain = ac.createGain();
    src.buffer    = buf;
    gain.gain.value = 0.08;
    src.connect(gain);
    gain.connect(ac.destination);
    src.start();
  } catch (_) { /* silent */ }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
export default function ThemeToggler({ sound = true }) {
  const rawId   = useId();
  const maskId  = `att${rawId.replace(/:/g, "")}`;
  const lastSnd = useRef(0);
  const isFirst = useRef(true);

  const [isDark, setIsDark] = useState(false);

  /* read initial theme from <html> class */
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    requestAnimationFrame(() => { isFirst.current = false; });
  }, []);

  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    setIsDark(dark);
    if (sound) playTick(lastSnd);
  };

  /* skip spring on first render to avoid flash */
  const spring = isFirst.current
    ? { duration: 0 }
    : { type: "spring", stiffness: 380, damping: 30 };

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.84 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        color: isDark ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.65)",
      }}
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ rotate: isDark ? 270 : 0 }}
        transition={spring}
        style={{ overflow: "visible" }}
      >
        {/* SVG mask carves the crescent from the moon circle */}
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.circle
              initial={false}
              animate={{ cx: isDark ? 17 : 33, cy: isDark ? 8 : 0 }}
              transition={spring}
              r="9"
              fill="black"
            />
          </mask>
        </defs>

        {/* center body — small sun disc or large crescent moon */}
        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          stroke="none"
          mask={`url(#${maskId})`}
          initial={false}
          animate={{ r: isDark ? 9 : 5 }}
          transition={spring}
        />

        {/* sun rays — fade + shrink when dark */}
        <motion.g
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            scale:   isDark ? 0 : 1,
            rotate:  isDark ? -30 : 0,
          }}
          transition={spring}
          style={{ transformOrigin: "12px 12px" }}
        >
          <line x1="12" y1="1"     x2="12" y2="3"     />
          <line x1="12" y1="21"    x2="12" y2="23"    />
          <line x1="1"  y1="12"    x2="3"  y2="12"    />
          <line x1="21" y1="12"    x2="23" y2="12"    />
          <line x1="5.64"  y1="5.64"  x2="4.22"  y2="4.22"  />
          <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
          <line x1="5.64"  y1="18.36" x2="4.22"  y2="19.78" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        </motion.g>
      </motion.svg>
    </motion.button>
  );
}
