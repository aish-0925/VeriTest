import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getTestRuns } from "../api/testRunApi";
import { Badge, Card, SectionHeader, LoadingBar, LiveDot, PageLoader, CovBar, EmptyState } from "../components/Shared";

const LOG_COLORS = { INFO:"var(--blue)", PASS:"var(--accent)", FAIL:"var(--red)", ERROR:"var(--amber)" };

function LogPanel({ run, onClose }) {
  return (
    <div className="detail-panel">
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:15 }}>{run.id}</span>
          <Badge status={run.status}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--text3)" }}>{run.script}</span>
          <button onClick={onClose} style={{ width:26, height:26, borderRadius:7, background:"var(--bg4)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text3)" }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {run.status === "RUNNING" && <LoadingBar/>}

      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"var(--f-mono)", letterSpacing:"1.2px", textTransform:"uppercase", marginBottom:10 }}>Execution Logs</div>
        <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:"12px 14px" }}>
          {(run.logs || []).map((log, i) => (
  <div key={i} className="log-line">
    <span className="log-time">{log.t}</span>
    <span style={{ color: LOG_COLORS[log.level]||"var(--text3)", width:48 }}>{log.level}</span>
    <span>{log.msg}</span>
  </div>
))}
        </div>
      </div>

      <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
        {[["Duration",run.duration,"var(--text)"],["Coverage",run.coverage!=null?`${run.coverage}%`:"—","var(--accent)"],["Requirement",run.reqId,"var(--text)"],["Started",run.startedAt,"var(--text3)"]].map(([l,v,c])=>(
          <div key={l}>
            <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"var(--f-mono)", letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:5 }}>{l}</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:13, color:c }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TestRuns() {
  const [runs, setRuns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
  getTestRuns()
    .then(data => {
      const formatted = (data || []).map(r => ({
        ...r,

        //  map backend → frontend fields
        script: r.script_name || "-",
        reqId: r.requirement || r.requirement_id || "-",
        startedAt: r.created_at || "-",

        //  CRITICAL FIX (prevents crash)
        logs: Array.isArray(r.logs) ? r.logs : [],

        // optional safety
        coverage: r.coverage ?? 0
      }));

      setRuns(formatted);

      if (location.state?.selectedRun) {
        setSelected(location.state.selectedRun);
      }
    })
    .catch(err => {
      console.error("Error fetching test runs:", err);
    })
    .finally(() => setLoading(false));
}, [location.state]);

  if (loading) return <PageLoader label="Loading test runs..."/>;
  const activeRuns = runs.filter(r => r.status === "RUNNING").length;
  const selectedRun = runs.find(r => r.id === selected);

  return (
    <div>
      <Card className="fade-up">
        <SectionHeader
          title="All Test Runs"
          action={activeRuns > 0 && (
            <span style={{ fontSize:11, fontFamily:"var(--f-mono)", color:"var(--accent)", display:"flex", alignItems:"center", gap:6 }}>
              <LiveDot/>{activeRuns} running
            </span>
          )}
        />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Run ID</th><th>Script</th><th>Requirement</th><th>Status</th><th>Coverage</th><th>Time</th><th>Duration</th></tr></thead>
            <tbody>
              {runs.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="No test runs yet"/></td></tr>
              ) : runs.map(r => (
                <tr key={r.id}
                  className={[r.status==="RUNNING"?"running":"", selected===r.id?"selected":""].join(" ")}
                  onClick={() => setSelected(selected === r.id ? null : r.id)}>
                  <td><span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--accent)" }}>{r.id}</span></td>
                  <td style={{ color:"var(--text)", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.script}</td>
                  <td><span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--text3)" }}>{r.reqId}</span></td>
                  <td><Badge status={r.status}/></td>
                  <td><CovBar value={r.coverage}/></td>
                  <td style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--text3)" }}>{r.startedAt}</td>
                  <td style={{ fontFamily:"var(--f-mono)", fontSize:11 }}>{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {selectedRun && <LogPanel run={selectedRun} onClose={() => setSelected(null)}/>}
    </div>
  );
}
