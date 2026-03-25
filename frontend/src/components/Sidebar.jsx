import React from "react";
import { NavLink } from "react-router-dom";
import { LiveDot, useTheme } from "./Shared";

const navItems = [
  { section: "Monitor", links: [
    { to: "/", label: "Dashboard", exact: true,
      icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
    { to: "/runs", label: "Test Runs", badge: "3",
      icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
    { to: "/compliance", label: "Compliance",
      icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg> },
  ]},
  { section: "Manage", links: [
    { to: "/requirements", label: "Requirements",
      icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { to: "/generate", label: "Generate Tests",
      icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> },
  ]},
];

export default function Sidebar({ open, onClose }) {
  const { theme } = useTheme();
  return (
    <>
      <div className={`sidebar-overlay ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="logo">
          <div className="logo-wordmark">
            <div className="logo-icon">
              <svg width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <div className="logo-mark">Veri<span>Test</span></div>
          </div>
          <div className="logo-sub">AI Test Platform</div>
        </div>
        <nav className="nav">
          {navItems.map(({ section, links }) => (
            <div className="nav-section" key={section}>
              <div className="nav-label">{section}</div>
              {links.map(({ to, label, icon, badge, exact }) => (
                <NavLink key={to} to={to} end={exact}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                  onClick={onClose}>
                  <span className="nav-icon">{icon}</span>
                  {label}
                  {badge && <span className="nav-badge">{badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-status">
            <LiveDot /><span style={{ color: "var(--text3)", fontSize: 11, fontFamily: "var(--f-mono)" }}>3 active runs</span>
          </div>
        </div>
      </aside>
    </>
  );
}
