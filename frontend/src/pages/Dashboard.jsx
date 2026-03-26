import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

import API from "../api/axios";
import {
  StatCard, Card, CardTitle, Badge,
  SectionHeader, Button, PageLoader, CovBar, useToast
} from "../components/Shared";

/* =========================
   Tooltip
========================= */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: "var(--bg3)",
      border: "1px solid var(--border2)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12
    }}>
      <div style={{ color: "var(--text3)", marginBottom: 6 }}>{label}</div>

      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* =========================
   Main Component
========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    coverage: 0,
    totalTests: 0,
    passRate: 0,
    activeRuns: 0
  });

  const [history, setHistory] = useState([]);
  const [runs, setRuns] = useState([]);

  /* =========================
     Fetch Data
  ========================= */
  useEffect(() => {
    API.get("/dashboard")
      .then((res) => {
        const data = res.data || {};

        setStats({
          coverage: data?.stats?.coverage ?? 0,
          totalTests: data?.stats?.totalTests ?? 0,
          passRate: data?.stats?.passRate ?? 0,
          activeRuns: data?.stats?.activeRuns ?? 0
        });

        setHistory(data?.history ?? []);
        setRuns(data?.runs ?? []);
      })
      .catch((err) => {
        console.error(err);
        toast("Failed to load dashboard", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading dashboard..." />;

  /* =========================
     Render
  ========================= */
  return (
    <div>

      {/* ================= STATS ================= */}
      <div className="stats-grid">
        <StatCard label="Coverage" value={stats.coverage} unit="%" color="green" />
        <StatCard label="Total Tests" value={stats.totalTests} color="blue" />
        <StatCard label="Pass Rate" value={stats.passRate} unit="%" color="green" />
        <StatCard label="Active Runs" value={stats.activeRuns} color="purple" />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="chart-grid">

        {/* BAR CHART */}
        <Card>
          <CardTitle>Pass / Fail — Last Runs</CardTitle>

          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="passed" fill="var(--accent)" />
              <Bar dataKey="failed" fill="var(--red)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AREA CHART */}
        <Card>
          <CardTitle>Coverage Trend</CardTitle>

          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="coverage"
                stroke="var(--accent)"
                fillOpacity={0.2}
                fill="var(--accent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

      </div>

      {/* ================= RUNS TABLE ================= */}
      <Card>
        <SectionHeader
          title="Recent Runs"
          action={
            <Button onClick={() => navigate("/runs")}>
              View all →
            </Button>
          }
        />

        {runs.length === 0 ? (
          <p style={{ color: "var(--text3)" }}>No runs available</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Script</th>
                  <th>Req</th>
                  <th>Status</th>
                  <th>Coverage</th>
                  <th>Duration</th>
                </tr>
              </thead>

              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.script}</td>
                    <td>{r.reqId}</td>
                    <td><Badge status={r.status} /></td>
                    <td><CovBar value={r.coverage} /></td>
                    <td>{r.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}