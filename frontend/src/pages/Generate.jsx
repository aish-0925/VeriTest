import React, { useState } from "react";
import API from "../api/axios";
import { Card, CardTitle, SectionHeader, Button, Spinner, useToast } from "../components/Shared";

function highlight(code) {
  return code
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\b(import|from|class|def|self|return|assert|if|else|for|in|not|True|False|None|with|as)\b/g, '<span class="c-kw">$1</span>')
    .replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, '<span class="c-str">$&</span>')
    .replace(/(#.*$)/gm, '<span class="c-comment">$1</span>')
    .replace(/\b([A-Z][A-Za-z]+)\(/g, '<span class="c-fn">$1</span>(');
}

const STEP_INFO = [
  { label: "Parsing", desc: "NLP engine extracting actions & entities..." },
  { label: "Mapping", desc: "Mapping actions to Selenium selectors..." },
  { label: "Generating", desc: "Building pytest class and assertions..." },
];

export default function Generate() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  async function handleGenerate() {
  if (!title.trim() || !desc.trim()) return;

  setLoading(true);
  setResult(null);
  setSaved(false);
  setStep(0);

  try {
    //  1. Create Requirement
    const res = await API.post("/requirements/", {
      title: "Login Feature",
      description: "User logs in",
      priority: "High",
      type: "Functional",
      project_id: 1,
    });

    const reqId = res.data.id;

    //  UI steps (keep for animation)
    await new Promise(r => setTimeout(r, 400));
    setStep(1);

    await new Promise(r => setTimeout(r, 400));
    setStep(2);

    //  2. Generate Script from backend
    const genRes = await API.post(`/generate/script/${reqId}`);

    //  3. Set result
    setResult(genRes.data);

    toast("Test script generated successfully", "success");

  } catch (e) {
    console.error(e);
    toast("Generation failed — check backend", "error");
  } finally {
    setLoading(false);
    setStep(-1);
  }
}

  function handleClear() {
    setTitle(""); setDesc(""); setResult(null); setSaved(false); setStep(-1);
  }

  function handleRun() {
    toast("Run queued — check Test Runs for live logs", "success");
  }

  function handleSave() {
    setSaved(true);
    toast("Script saved to database", "success");
  }

  return (
    <div className="two-col">
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card className="fade-up">
          <SectionHeader title="New Requirement"/>
          <div className="form-group">
            <label className="form-label">Requirement Title</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. User Registration Flow"/>
          </div>
          <div className="form-group">
            <label className="form-label">Plain-English Description</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)}
              placeholder="Describe what the user does and what should happen. e.g. User navigates to signup page, fills name, email and password, clicks register. A confirmation should appear and user is redirected to onboarding."/>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Button onClick={handleGenerate} disabled={loading || !title.trim() || !desc.trim()}>
              {loading ? <><Spinner size={13}/> {STEP_INFO[step]?.label || "Generating"}...</> : <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
                Generate with AI
              </>}
            </Button>
            <Button variant="ghost" onClick={handleClear} disabled={loading}>Clear</Button>
          </div>
          {loading && step >= 0 && (
            <div style={{ marginTop:16, padding:"12px 14px", background:"var(--bg3)", borderRadius:"var(--r)", border:"1px solid var(--border)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                {STEP_INFO.map((s,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontFamily:"var(--f-mono)", color: i < step ? "var(--accent)" : i === step ? "var(--blue)" : "var(--text3)" }}>
                    {i < step ? "✓" : i === step ? <Spinner size={10}/> : "○"} {s.label}
                  </div>
                ))}
              </div>
              <div style={{ height:2, background:"var(--bg4)", borderRadius:1, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${((step+1)/3)*100}%`, background:"linear-gradient(90deg,var(--blue),var(--accent))", transition:"width 0.5s ease", borderRadius:1 }}/>
              </div>
              <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"var(--f-mono)", marginTop:6 }}>{STEP_INFO[step]?.desc}</div>
            </div>
          )}
        </Card>

        <Card className="fade-up-1">
          <CardTitle>NLP Parsing Preview</CardTitle>
          {!result ? (
            <div style={{ color:"var(--text3)", fontSize:12, fontFamily:"var(--f-mono)", padding:"4px 0" }}>
              Run generation to see extracted actions and selectors...
            </div>
          ) : (
            <div style={{ fontFamily:"var(--f-mono)", fontSize:12, lineHeight:2 }} className="fade-up">
              <div style={{ marginBottom:10 }}>
                {result.parsed.actions.map((a,i)=>(
                  <span key={i} className="nlp-tag action" style={{ marginBottom:4, display:"inline-flex" }}>
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    {a}
                  </span>
                ))}
              </div>
              <div>
                {result.parsed.assertions.map((a,i)=>(
                  <span key={i} className="nlp-tag assert" style={{ marginBottom:4, display:"inline-flex" }}>
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    {a}
                  </span>
                ))}
              </div>
              <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"var(--text3)", fontSize:11 }}>NLP confidence:</span>
                <span style={{ color: result.parsed.confidence > 0.8 ? "var(--accent)" : "var(--amber)", fontFamily:"var(--f-mono)", fontSize:12, fontWeight:600 }}>
                  {(result.parsed.confidence*100).toFixed(0)}%
                </span>
                <div style={{ flex:1, height:4, background:"var(--bg4)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${result.parsed.confidence*100}%`, background: result.parsed.confidence > 0.8 ? "var(--accent)" : "var(--amber)", borderRadius:2 }}/>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="fade-up">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <CardTitle style={{ margin:0 }}>Generated Script</CardTitle>
          <span style={{ fontSize:11, fontFamily:"var(--f-mono)", color: result ? "var(--accent)" : "var(--text3)" }}>
            {loading ? <><Spinner size={11}/> <span style={{ marginLeft:4 }}>Generating</span></> : result ? "✓ Ready" : "Waiting..."}
          </span>
        </div>

        {!result && !loading && (
          <div style={{ textAlign:"center", padding:"60px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"var(--bg3)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text3)" }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4"/></svg>
            </div>
            <div style={{ color:"var(--text3)", fontSize:13 }}>Fill in the requirement and click Generate</div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign:"center", padding:"60px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <Spinner size={32}/>
            <div style={{ color:"var(--text3)", fontSize:12, fontFamily:"var(--f-mono)" }}>NLP engine processing...</div>
          </div>
        )}

        {result && (
          <div className="fade-up">
            <pre className="script-preview" dangerouslySetInnerHTML={{ __html: highlight(result.code) }}/>
            <div style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap", alignItems:"center" }}>
              <Button onClick={handleRun}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Run Script
              </Button>
              <Button variant="ghost" onClick={handleSave} disabled={saved}>
                {saved ? "✓ Saved" : <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Save Script
                </>}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
