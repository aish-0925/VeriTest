import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Badge, Card, SectionHeader, Button, EmptyState, PageLoader, CovBar } from "../components/Shared";

function ReqDetail({ req, runs, onGenerate }) {
  const rel = runs?.filter(r => r.reqId === req.id) || [];
  return (
    <div className="detail-panel">
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--accent)", marginBottom:5 }}>{req.id}</div>
          <div style={{ fontFamily:"var(--f-display)", fontSize:18, fontWeight:700 }}>{req.title}</div>
        </div>
        <Badge status={req.status}/>
      </div>
      <div style={{ background:"var(--bg4)", borderRadius:"var(--r)", padding:"14px 16px", fontSize:13.5, color:"var(--text2)", marginBottom:20, lineHeight:1.8, border:"1px solid var(--border)" }}>
        {req.description}
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"var(--f-mono)", letterSpacing:"1.2px", textTransform:"uppercase", marginBottom:12 }}>
          Linked Test Runs
        </div>
        {rel.length === 0 ? (
          <EmptyState message="No runs linked to this requirement yet"/>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead><tr>
              {["Run","Script","Status","Coverage","Duration"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"8px 12px", color:"var(--text3)", fontSize:10, letterSpacing:"1px", textTransform:"uppercase", fontFamily:"var(--f-mono)", borderBottom:"1px solid var(--border)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rel.map(r=>(
                <tr key={r.id} style={{ cursor:"default" }}>
                  <td style={{ padding:"11px 12px", borderBottom:"1px solid var(--border)", fontFamily:"var(--f-mono)", fontSize:11, color:"var(--accent)" }}>{r.id}</td>
                  <td style={{ padding:"11px 12px", borderBottom:"1px solid var(--border)", color:"var(--text2)" }}>{r.script}</td>
                  <td style={{ padding:"11px 12px", borderBottom:"1px solid var(--border)" }}><Badge status={r.status || "pending"}/></td>
                  <td style={{ padding:"11px 12px", borderBottom:"1px solid var(--border)" }}><CovBar value={r.coverage}/></td>
                  <td style={{ padding:"11px 12px", borderBottom:"1px solid var(--border)", fontFamily:"var(--f-mono)", fontSize:11 }}>{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {req.status === "pending" && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
          <Button onClick={onGenerate}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83"/></svg>
            Generate Test Scripts →
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Requirements() {
  const [reqs, setReqs] = useState([]);
  const [runs, setRuns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await API.get("/requirements");
      setReqs(res.data);

      setRuns([]); // keep empty for now (no test runs API yet)
    } catch (err) {
      console.error("Error fetching requirements:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading) return <PageLoader label="Loading requirements..."/>;
  const selectedReq = reqs.find(r => r.id === selected);

  return (
    <div>
      <Card className="fade-up" style={{ marginBottom:14 }}>
        <SectionHeader
          title="Requirements"
          action={
            <Button size="sm" onClick={() => navigate("/generate")}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Requirement
            </Button>
          }
        />
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Status</th><th>Scripts</th><th>Created</th></tr></thead>
            <tbody>
              {reqs.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="No requirements yet. Add one to get started."/></td></tr>
              ) : reqs.map(r => (
                <tr key={r.id}
                  className={selected===r.id?"selected":""}
                  onClick={() => setSelected(selected===r.id?null:r.id)}>
                  <td><span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--accent)" }}>{r.id}</span></td>
                  <td style={{ color:"var(--text)", fontWeight:500 }}>{r.title}</td>
                  <td style={{ maxWidth:240, color:"var(--text3)", fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.description}</td>
                  <td><Badge status={r.status}/></td>
                  <td style={{ fontFamily:"var(--f-mono)", fontSize:11 }}>{r.scriptsCount || 0} script{r.scriptsCount !== 1 ? "s" : ""}</td>
                  <td style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--text3)" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {selectedReq && (
        <ReqDetail req={selectedReq} runs={runs} onGenerate={() => navigate("/generate")}/>
      )}
    </div>
  );
}
