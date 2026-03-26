import React, { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { runTest } from "../api/testRunApi";
import {
  Card, CardTitle, SectionHeader,
  Button, Spinner, useToast
} from "../components/Shared";

/* =========================
   Syntax Highlight
========================= */
function highlight(code) {
  return code
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\b(import|from|class|def|self|return|assert|if|else|for|in|not|True|False|None|with|as)\b/g, '<span class="c-kw">$1</span>')
    .replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, '<span class="c-str">$&</span>')
    .replace(/(#.*$)/gm, '<span class="c-comment">$1</span>')
    .replace(/\b([A-Z][A-Za-z]+)\(/g, '<span class="c-fn">$1</span>(');
}

/* =========================
   Main Component
========================= */
export default function Generate() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [expectedText, setExpectedText] = useState("");

  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [requirementId, setRequirementId] = useState(null);

  const toast = useToast();

  /* =========================
     Fetch Projects
  ========================= */
  useEffect(() => {
    API.get("/projects")
      .then((res) => setProjects(res.data || []))
      .catch((err) => {
        console.error(err);
        toast("Failed to load projects", "error");
      });
  }, []);

  /* =========================
     Generate Script
  ========================= */
  async function handleGenerate() {
    if (!title.trim() || !desc.trim() || !url.trim() || !expectedText.trim()) {
      toast("Please fill all fields", "error");
      return;
    }

    if (!projectId) {
      toast("Please select a project", "error");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      //  Create Requirement
      const res = await API.post("/requirements/", {
        title,
        description: desc,
        project_id: projectId,
        url,
        expected_text: expectedText
      });

      const reqId = res.data.id;
      setRequirementId(reqId);

      //  Generate Script
      const genRes = await API.post(`/generate/script/${reqId}`);
      setResult(genRes.data);

      toast("Script generated successfully", "success");

    } catch (e) {
      console.error(e);
      toast("Generation failed", "error");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     Run Script
  ========================= */
  async function handleRun() {
    if (!requirementId) {
      toast("Generate script first", "error");
      return;
    }

    try {
      await runTest(requirementId);
      toast("Test executed successfully", "success");
    } catch (err) {
      console.error(err);
      toast("Run failed", "error");
    }
  }

  /* =========================
     Clear Form
  ========================= */
  function handleClear() {
    setTitle("");
    setDesc("");
    setUrl("");
    setExpectedText("");
    setResult(null);
    setRequirementId(null);
    setProjectId("");
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="two-col">

      {/* LEFT PANEL */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <SectionHeader title="New Requirement" />

          {/*  PROJECT SELECT */}
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Requirement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <input
            type="text"
            placeholder="Website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            type="text"
            placeholder="Expected Text"
            value={expectedText}
            onChange={(e) => setExpectedText(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? <><Spinner size={13}/> Generating...</> : "Generate Script"}
            </Button>

            <Button variant="ghost" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </Card>

        {/* NLP Preview */}
        <Card>
          <CardTitle>NLP Parsing Preview</CardTitle>

          {!result ? (
            <div style={{ color: "var(--text3)" }}>
              Run generation to see extracted actions...
            </div>
          ) : (
            <div>
              {result?.parsed?.actions?.map((a, i) => (
                <div key={i}>{a}</div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* RIGHT PANEL */}
      <Card>
        <CardTitle>Generated Script</CardTitle>

        {!result && !loading && <div>Waiting...</div>}
        {loading && <Spinner size={30} />}

        {result && (
          <>
            <pre dangerouslySetInnerHTML={{ __html: highlight(result.code) }} />

            <div style={{ marginTop: 16 }}>
              <Button onClick={handleRun}>
                Run Script
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}