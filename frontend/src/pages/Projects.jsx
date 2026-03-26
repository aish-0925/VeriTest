import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Card, SectionHeader, Button, EmptyState, PageLoader } from "../components/Shared";

function ProjectDetail({ project }) {
  return (
    <div className="detail-panel">
      <div style={{ marginBottom: 18 }}>
        <div style={{
          fontFamily: "var(--f-mono)",
          fontSize: 11,
          color: "var(--accent)",
          marginBottom: 5
        }}>
          {project.id}
        </div>

        <div style={{
          fontFamily: "var(--f-display)",
          fontSize: 18,
          fontWeight: 700
        }}>
          {project.name}
        </div>
      </div>

      <div style={{
        background: "var(--bg4)",
        borderRadius: "var(--r)",
        padding: "14px 16px",
        fontSize: 13.5,
        color: "var(--text2)",
        lineHeight: 1.8,
        border: "1px solid var(--border)"
      }}>
        {project.description || "No description provided"}
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <PageLoader label="Loading projects..." />;

  const selectedProject = projects.find(p => p.id === selected);

  return (
    <div>
      {/* 🔹 HEADER CARD */}
      <Card className="fade-up" style={{ marginBottom: 14 }}>
        <SectionHeader
          title="Projects"
          action={
            <Button size="sm" onClick={() => navigate("/create-project")}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Project
            </Button>
          }
        />

        {/* 🔹 TABLE */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="No projects yet. Create one to get started." />
                  </td>
                </tr>
              ) : projects.map(p => (
                <tr
                  key={p.id}
                  className={selected === p.id ? "selected" : ""}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                >
                  <td>
                    <span style={{
                      fontFamily: "var(--f-mono)",
                      fontSize: 11,
                      color: "var(--accent)"
                    }}>
                      {p.id}
                    </span>
                  </td>

                  <td style={{ fontWeight: 500 }}>
                    {p.name}
                  </td>

                  <td style={{
                    maxWidth: 240,
                    color: "var(--text3)",
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {p.description}
                  </td>

                  <td style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: 11,
                    color: "var(--text3)"
                  }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 🔹 DETAIL PANEL (LIKE REQUIREMENTS) */}
      {selectedProject && (
        <ProjectDetail project={selectedProject} />
      )}
    </div>
  );
}