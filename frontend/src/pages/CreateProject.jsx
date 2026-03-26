import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Card, SectionHeader, Button } from "../components/Shared";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) return;

    try {
      setLoading(true);

      await API.post("/projects", {
        name,
        description
      });

      //  Go back to projects page
      navigate("/projects");

    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fade-up">
      <SectionHeader title="Create Project" />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "10px 12px",
            borderRadius: "var(--r)",
            border: "1px solid var(--border)"
          }}
        />

        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{
            padding: "10px 12px",
            borderRadius: "var(--r)",
            border: "1px solid var(--border)"
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>

          <Button variant="ghost" onClick={() => navigate("/projects")}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}