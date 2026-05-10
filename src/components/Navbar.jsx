import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toast }        = useToast();
  const location         = useLocation();
  const [open, setOpen]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    const name = user?.username || user?.name || "User";
    logout();
    toast(`See you soon, ${name}! 👋`, "info");
  };

  const navLinks = [
    { to: "/",        label: "Home",    end: true },
    { to: "/blog",    label: "Blog" },
    { to: "/digest",  label: "Digest" },
    { to: "/about",   label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const initials = (user?.username || user?.name || "U")[0].toUpperCase();

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(12,12,10,0.92)"
          : "rgba(12,12,10,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(212,168,83,0.15)"
          : "1px solid rgba(255,255,255,0.05)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
      }}
    >
      {/* ── Accent bar ── */}
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D4A853, #C0392B, transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-9 h-9">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105"
                style={{ background: "#D4A853", boxShadow: "0 4px 16px rgba(212,168,83,0.3)" }}>
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
            </div>
            <div className="leading-none">
              <span className="block font-black text-xl text-white tracking-tight">BlogPro</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(212,168,83,0.7)" }}>Magazine</span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  }`
                }
                style={({ isActive }) => isActive ? { color: "#D4A853" } : {}}
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: "#D4A853" }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Desktop auth ── */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                  style={({ isActive }) => ({
                    background: isActive ? "#D4A853" : "rgba(212,168,83,0.1)",
                    color: isActive ? "#000" : "#D4A853",
                    border: "1px solid rgba(212,168,83,0.25)",
                  })}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </NavLink>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-sm"
                      style={{ background: "#D4A853" }}>
                      {initials}
                    </div>
                    <span className="text-sm font-semibold text-white/70 max-w-[90px] truncate">
                      {user.username || user.name}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl border py-2 animate-scaleIn origin-top-right"
                      style={{ background: "#141410", borderColor: "rgba(212,168,83,0.15)" }}>
                      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <p className="text-sm font-bold text-white">{user.username || user.name}</p>
                        <p className="text-xs text-white/30 truncate">{user.email || "Member"}</p>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
                        style={{}} onMouseEnter={e => e.currentTarget.style.color = "#D4A853"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link to="/digest" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 transition-colors"
                        onMouseEnter={e => e.currentTarget.style.color = "#D4A853"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Weekly Digest
                      </Link>
                      <div className="border-t mt-1 pt-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors"
                          style={{ color: "#C0392B" }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-black px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ background: "#D4A853", color: "#000", boxShadow: "0 4px 16px rgba(212,168,83,0.25)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
                  onMouseLeave={e => e.currentTarget.style.background = "#D4A853"}
                >
                  Get started →
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile toggle ── */}
          <div className="md:hidden flex items-center gap-1">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.6)" }}
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>

        </div>{/* end flex row */}
      </div>{/* end max-w container */}

      {/* ── Mobile menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t px-4 py-4 space-y-1"
          style={{ background: "#0C0C0A", borderColor: "rgba(255,255,255,0.06)" }}>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={({ isActive }) => ({
                color: isActive ? "#D4A853" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(212,168,83,0.08)" : "transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="pt-3 mt-3 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ background: "rgba(212,168,83,0.06)", borderColor: "rgba(212,168,83,0.15)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold shadow-sm"
                    style={{ background: "#D4A853" }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.username || user.name}</p>
                    <p className="text-xs text-white/30">{user.email || "Member"}</p>
                  </div>
                </div>
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                  style={({ isActive }) => ({
                    background: isActive ? "#D4A853" : "rgba(212,168,83,0.1)",
                    color: isActive ? "#000" : "#D4A853",
                  })}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{ color: "#C0392B" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-center px-4 py-3 text-sm font-black rounded-xl transition-all duration-200"
                  style={{ background: "#D4A853", color: "#000" }}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
