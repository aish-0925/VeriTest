import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import API from "../api/axios";
import { StatCard, Card, CardTitle, Badge, SectionHeader, Button, PageLoader, CovBar } from "../components/Shared";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontFamily: "var(--f-mono)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
      <div style={{ color: "var(--text3)", marginBottom: 8, fontSize: 11 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          {p.name}: <strong style={{ marginLeft: 2 }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [runs, setRuns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  API.get("/dashboard")
    .then((res) => {
      setStats(res.data.stats);
      setHistory(res.data.history);
      setRuns(res.data.runs);
    })
    .catch((err) => console.log(err));
}, []);

  if (!stats) return <PageLoader label="Loading dashboard..." />;

  return (
    <div>
      <div className="stats-grid">
        <StatCard label="Coverage"    value={stats.coverage}  unit="%" sub="+3.4% since yesterday" color="green"  delay={0.04}
          icon={<svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M9 12l2 2 4-4"/></svg>} />
        <StatCard label="Total Tests" value={stats.totalTests}        sub="Across 5 requirements"   color="blue"   delay={0.08}
          icon={<svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>} />
        <StatCard label="Pass Rate"   value={stats.passRate}  unit="%" sub="129 / 148 tests passing" color="green" delay={0.12}
          icon={<svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>} />
        <StatCard label="Active Runs" value={stats.activeRuns}
          sub={<span style={{color:"var(--accent)",display:"flex",alignItems:"center",gap:5,fontSize:11}}><span style={{width:5,height:5,borderRadius:"50%",background:"var(--accent)",display:"inline-block",animation:"pulse 2s infinite"}}/>Running now</span>}
          color="purple" delay={0.16}
          icon={<svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
      </div>

      <div className="chart-grid">
        <Card className="fade-up-2">
          <CardTitle>Pass / Fail — Last 7 Days</CardTitle>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={history} barCategoryGap="28%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--text3)", fontSize: 11, fontFamily: "var(--f-mono)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="passed" name="Passed" fill="var(--accent)" radius={[4,4,0,0]} />
              <Bar dataKey="failed" name="Failed" fill="var(--red)"   radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
            {[["var(--accent)","Passed"], ["var(--red)","Failed"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text3)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
              </div>
            ))}
          </div>
        </Card>

        <Card className="fade-up-2">
          <CardTitle>Coverage Trend</CardTitle>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="date" tick={{ fill:"var(--text3)", fontSize:11, fontFamily:"var(--f-mono)" }} axisLine={false} tickLine={false}/>
              <YAxis domain={[60,100]} hide/>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke:"var(--border2)" }}/>
              <Area type="monotone" dataKey="coverage" name="Coverage %" stroke="var(--accent)" strokeWidth={2.5} fill="url(#cg)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ textAlign:"center", marginTop:8 }}>
            <span style={{ fontFamily:"var(--f-display)", fontSize:28, fontWeight:800, color:"var(--accent)" }}>{stats.coverage}</span>
            <span style={{ fontSize:14, color:"var(--text3)", marginLeft:2 }}>% today</span>
          </div>
        </Card>
      </div>

      <Card className="fade-up-3">
        <SectionHeader title="Recent Runs" action={<Button variant="ghost" size="sm" onClick={() => navigate("/runs")}>View all →</Button>} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Run ID</th><th>Script</th><th>Req.</th><th>Status</th><th>Coverage</th><th>Duration</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className={r.status === "RUNNING" ? "running" : ""} onClick={() => navigate("/runs", { state: { selectedRun: r.id } })}>
                  <td><span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--accent)" }}>{r.id}</span></td>
                  <td style={{ color:"var(--text)" }}>{r.script}</td>
                  <td><span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--text3)" }}>{r.reqId}</span></td>
                  <td><Badge status={r.status}/></td>
                  <td><CovBar value={r.coverage}/></td>
                  <td style={{ fontFamily:"var(--f-mono)", fontSize:11 }}>{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
