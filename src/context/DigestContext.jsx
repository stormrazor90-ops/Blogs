import { createContext, useContext, useState, useCallback } from "react";

const DigestContext = createContext();

// ── helpers ──────────────────────────────────────────────────────────────────
function getWeekLabel() {
  const now  = new Date();
  const day  = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const mon  = new Date(now.setDate(diff));
  const sun  = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt  = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`;
}

export function DigestProvider({ children }) {
  const [subscribers, setSubscribers] = useState([
    // seed a couple so the count isn't zero
    { email: "demo@example.com",  name: "Demo User",  joinedAt: "2026-04-20", active: true },
    { email: "reader@blogpro.io", name: "Blog Reader", joinedAt: "2026-04-25", active: true },
  ]);

  // subscribe — returns "ok" | "duplicate" | "invalid"
  const subscribe = useCallback((email, name = "") => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "invalid";
    if (subscribers.some((s) => s.email === trimmed && s.active)) return "duplicate";

    // if previously unsubscribed, re-activate
    const existing = subscribers.find((s) => s.email === trimmed);
    if (existing) {
      setSubscribers((prev) =>
        prev.map((s) => s.email === trimmed ? { ...s, active: true } : s)
      );
    } else {
      setSubscribers((prev) => [
        ...prev,
        {
          email: trimmed,
          name: name.trim() || trimmed.split("@")[0],
          joinedAt: new Date().toISOString().split("T")[0],
          active: true,
        },
      ]);
    }
    return "ok";
  }, [subscribers]);

  const unsubscribe = useCallback((email) => {
    setSubscribers((prev) =>
      prev.map((s) => s.email === email.toLowerCase() ? { ...s, active: false } : s)
    );
  }, []);

  const isSubscribed = useCallback(
    (email) => subscribers.some((s) => s.email === email?.toLowerCase() && s.active),
    [subscribers]
  );

  const activeCount = subscribers.filter((s) => s.active).length;
  const weekLabel   = getWeekLabel();

  return (
    <DigestContext.Provider value={{
      subscribers,
      activeCount,
      weekLabel,
      subscribe,
      unsubscribe,
      isSubscribed,
    }}>
      {children}
    </DigestContext.Provider>
  );
}

export const useDigest = () => useContext(DigestContext);
