import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

/* ─── Theme Context ──────────────────────────────────────────── */
const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("vt-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("vt-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);

/* ─── Toast Context ──────────────────────────────────────────── */
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 10, zIndex: 999 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ color: t.type === "success" ? "var(--accent)" : "var(--red)", fontSize: 16 }}>
              {t.type === "success" ? "✓" : "✕"}
            </span>
            <span style={{ color: "var(--text)" }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ─── Badge ──────────────────────────────────────────────────── */
const badgeMap = {
  PASS:      "badge-pass",
  FAIL:      "badge-fail",
  ERROR:     "badge-error",
  RUNNING:   "badge-running",
  pending:   "badge-pending",
  generated: "badge-generated",
  error:     "badge-error",
  PENDING:   "badge-pending",
};

export function Badge({ status }) {
  const cls = badgeMap[status] || "badge-pending";
  return <span className={`badge ${cls}`}>{status?.toUpperCase?.() ?? status}</span>;
}

/* ─── Button ─────────────────────────────────────────────────── */
export function Button({ children, variant = "primary", size = "md", onClick, disabled, style, type }) {
  const v = variant === "ghost" ? "btn-ghost" : variant === "danger" ? "btn-danger" : "btn-primary";
  const s = size === "sm" ? "btn-sm" : "";
  return (
    <button type={type} className={`btn ${v} ${s}`} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}

/* ─── Card ───────────────────────────────────────────────────── */
export function Card({ children, style, className = "" }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}
export function CardTitle({ children }) {
  return <div className="card-title">{children}</div>;
}

/* ─── StatCard ───────────────────────────────────────────────── */
export function StatCard({ label, value, unit, sub, color = "green", delay = 0, icon }) {
  return (
    <div className={`stat-card ${color} fade-up`} style={{ animationDelay: `${delay}s` }}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`} style={{ animationDelay: `${delay + 0.1}s` }}>
        {value}
        {unit && <span style={{ fontSize: 16, fontWeight: 600 }}>{unit}</span>}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
      {icon && (
        <div style={{ position: "absolute", bottom: 14, right: 14, opacity: 0.08 }}>
          {icon}
        </div>
      )}
    </div>
  );
}

/* ─── Spinner ────────────────────────────────────────────────── */
export function Spinner({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none"
      style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}>
      <circle cx="9" cy="9" r="7" stroke="var(--border2)" strokeWidth="2"/>
      <path d="M9 2a7 7 0 017 7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── LoadingBar ─────────────────────────────────────────────── */
export function LoadingBar() {
  return (
    <div className="loading-bar">
      <div className="loading-bar-inner" />
    </div>
  );
}

/* ─── LiveDot ────────────────────────────────────────────────── */
export function LiveDot() {
  return <span className="live-dot" />;
}

/* ─── PageLoader ─────────────────────────────────────────────── */
export function PageLoader({ label = "Loading..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <Spinner size={28} />
      <span style={{ color: "var(--text3)", fontFamily: "var(--f-mono)", fontSize: 12 }}>{label}</span>
    </div>
  );
}

/* ─── EmptyState ─────────────────────────────────────────────── */
export function EmptyState({ message = "No data", icon }) {
  return (
    <div className="empty">
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg3)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", marginBottom: 4 }}>
        {icon || (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>
      <span>{message}</span>
    </div>
  );
}

/* ─── SectionHeader ──────────────────────────────────────────── */
export function SectionHeader({ title, action }) {
  return (
    <div className="section-header">
      <div className="section-title">{title}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ─── CoverageBar inline ─────────────────────────────────────── */
export function CovBar({ value }) {
  if (value === null || value === undefined) return <span style={{ color: "var(--text3)" }}>—</span>;
  const color = value >= 80 ? "var(--accent)" : value >= 40 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="cov-bar-wrap">
        <div className="cov-bar" style={{ width: `${value}%`, background: color }} />
      </div>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--text2)" }}>{value}%</span>
    </div>
  );
}
