import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { LiveDot, Button, useTheme } from "./Shared";

const titles = {
  "/": "Dashboard", "/runs": "Test Runs",
  "/compliance": "Compliance Report",
  "/requirements": "Requirements", "/generate": "Generate Tests",
};

function SunIcon() {
  return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function MoonIcon() {
  return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = titles[location.pathname] || "VeriTest";

  // ✅ ADDED: user + logout (INSIDE component)
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main">
        <div className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="page-title">{title}</div>

          <div className="topbar-actions">
            <span style={{ fontSize: 11, fontFamily: "var(--f-mono)", color: "var(--text3)", display: "flex", alignItems: "center", gap: 6 }}>
              <LiveDot /> Live
            </span>

            {/* ✅ OPTIONAL: show user name */}
            {user && <span>{user.name}</span>}

            <button className="theme-toggle" onClick={toggle} title="Toggle theme">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            <Button variant="ghost" size="sm" onClick={() => navigate("/generate")}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Test
            </Button>

            {/* ✅ ADDED: logout button */}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>

          </div>
        </div>

        <div className="content">{children}</div>
      </div>
    </div>
  );
}