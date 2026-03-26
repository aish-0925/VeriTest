import React, { useEffect, useState, useRef } from "react";
import { getCompliance, exportReport } from "../api/complianceApi";
import { Badge, Card, CardTitle, SectionHeader, Button, Spinner, PageLoader, useToast } from "../components/Shared";

function AnimatedBar({ coverage, status }) {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => { if(ref.current) ref.current.style.width = `${coverage}%`; }, 200);
    return () => clearTimeout(t);
  }, [coverage]);
  const color = status === "PASS" ? "pass" : status === "FAIL" ? "fail" : "pending";
  return (
    <div className="comp-bar-wrap">
      <div ref={ref} className={`comp-bar ${color}`} />
    </div>
  );
}

export default function Compliance() {
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(null);
  const toast = useToast();

  useEffect(() => {
  getCompliance()
    .then(setData)
    .catch(err => console.error("Error fetching compliance:", err));
}, []);

  async function handleExport(fmt) {
    setExporting(fmt);
    const res = await exportReport(fmt);
    setExporting(null);
    toast(res.message, "success");
  }

  if (!data) return <PageLoader label="Loading compliance data..." />;

  return (
    <div>
      <div className="two-col fade-up" style={{ marginBottom: 14 }}>
        <Card>
          <CardTitle>Overall Compliance</CardTitle>
          <div style={{ display:"flex", alignItems:"center", gap:24, marginBottom:24 }}>
            <div>
              <div style={{ fontFamily:"var(--f-display)", fontSize:56, fontWeight:800, color:"var(--accent)", lineHeight:1, letterSpacing:"-2px" }}>
                {data.coveragePct}<span style={{ fontSize:24, fontWeight:600, letterSpacing:0 }}>%</span>
              </div>
              <div style={{ marginTop:8 }}><Badge status={data.overallStatus}/></div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ height:8, background:"var(--bg4)", borderRadius:4, overflow:"hidden", marginBottom:8 }}>
                <div style={{ height:"100%", width:`${data.coveragePct}%`, background:"linear-gradient(90deg, var(--accent), var(--blue))", borderRadius:4, transition:"width 1.4s cubic-bezier(0.4,0,0.2,1)" }}/>
              </div>
              <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"var(--f-mono)" }}>Generated {data.generatedAt}</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[{l:"Passed",v:data.passed,c:"var(--accent)"},{l:"Failed",v:data.failed,c:"var(--red)"},{l:"Errors",v:data.errors,c:"var(--amber)"}].map(({l,v,c})=>(
              <div key={l} style={{ textAlign:"center", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:var_r(), padding:"14px 10px" }}>
                <div style={{ fontFamily:"var(--f-display)", fontSize:28, fontWeight:800, color:c, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"var(--f-mono)", marginTop:6, letterSpacing:"1px" }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Section Breakdown</CardTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {data.sections.map(s=>(
              <div key={s.name} className="comp-row">
                <div className="comp-name">{s.name}</div>
                <Badge status={s.status}/>
                <AnimatedBar coverage={s.coverage} status={s.status}/>
                <div className="comp-pct">{s.coverage}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="fade-up-1">
        <SectionHeader title="Export Report"/>
        <p style={{ color:"var(--text2)", fontSize:13.5, marginBottom:20, lineHeight:1.8 }}>
          Generate a full compliance report with all test results, coverage metrics, and section breakdowns. 
          Attach to sprint documentation or share with your QA team.
        </p>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <Button onClick={() => handleExport("pdf")} disabled={!!exporting}>
            {exporting==="pdf" ? <><Spinner size={13}/> Generating...</> : <>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Export PDF
            </>}
          </Button>
          <Button variant="ghost" onClick={() => handleExport("json")} disabled={!!exporting}>
            {exporting==="json" ? <><Spinner size={13}/> Generating...</> : "Export JSON"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function var_r() { return "var(--r)"; }
