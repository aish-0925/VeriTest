import React, { useEffect, useState, useRef } from "react";
import { getCompliance, exportReport } from "../api/complianceApi";
import {
  Badge,
  Card,
  CardTitle,
  SectionHeader,
  Button,
  Spinner,
  PageLoader,
  useToast
} from "../components/Shared";

/* =========================
   Animated Progress Bar
========================= */
function AnimatedBar({ coverage, status }) {
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (ref.current) ref.current.style.width = `${coverage}%`;
    }, 200);
    return () => clearTimeout(t);
  }, [coverage]);

  const color =
    status === "PASS" ? "pass" :
    status === "FAIL" ? "fail" :
    "pending";

  return (
    <div className="comp-bar-wrap">
      <div ref={ref} className={`comp-bar ${color}`} />
    </div>
  );
}

/* =========================
   Main Component
========================= */
export default function Compliance() {
  const [data, setData] = useState({
    coveragePct: 0,
    overallStatus: "PENDING",
    passed: 0,
    failed: 0,
    errors: 0,
    generatedAt: "",
    sections: []
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const toast = useToast();

  /* =========================
     Fetch Compliance Data
  ========================= */
  useEffect(() => {
    getCompliance()
      .then((res) => {
        setData({
          coveragePct: res?.coveragePct ?? 0,
          overallStatus: res?.overallStatus ?? "PENDING",
          passed: res?.passed ?? 0,
          failed: res?.failed ?? 0,
          errors: res?.errors ?? 0,
          generatedAt: res?.generatedAt ?? "",
          sections: res?.sections ?? []
        });
      })
      .catch((err) => {
        console.error("Error fetching compliance:", err);
        toast("Failed to load compliance data", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     Export Handler
  ========================= */
  async function handleExport(fmt) {
    try {
      setExporting(fmt);
      const res = await exportReport(fmt);
      toast(res?.message || "Report generated", "success");
    } catch (err) {
      toast("Export failed", "error");
    } finally {
      setExporting(null);
    }
  }

  /* =========================
     Loading State
  ========================= */
  if (loading) return <PageLoader label="Loading compliance data..." />;

  /* =========================
     Render
  ========================= */
  return (
    <div>
      {/* ================= OVERALL + SECTIONS ================= */}
      <div className="two-col fade-up" style={{ marginBottom: 14 }}>

        {/* ===== OVERALL CARD ===== */}
        <Card>
          <CardTitle>Overall Compliance</CardTitle>

          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: 56,
                  fontWeight: 800,
                  color: "var(--accent)",
                  lineHeight: 1,
                  letterSpacing: "-2px"
                }}
              >
                {data.coveragePct}
                <span style={{ fontSize: 24, fontWeight: 600 }}>%</span>
              </div>

              <div style={{ marginTop: 8 }}>
                <Badge status={data.overallStatus} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 8,
                  background: "var(--bg4)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 8
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${data.coveragePct}%`,
                    background: "linear-gradient(90deg, var(--accent), var(--blue))",
                    transition: "width 1.4s ease"
                  }}
                />
              </div>

              <div style={{ fontSize: 11, color: "var(--text3)" }}>
                Generated {data.generatedAt || "-"}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { l: "Passed", v: data.passed, c: "var(--accent)" },
              { l: "Failed", v: data.failed, c: "var(--red)" },
              { l: "Errors", v: data.errors, c: "var(--amber)" }
            ].map(({ l, v, c }) => (
              <div
                key={l}
                style={{
                  textAlign: "center",
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r)",
                  padding: "14px 10px"
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 6 }}>
                  {l.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ===== SECTIONS ===== */}
        <Card>
          <CardTitle>Section Breakdown</CardTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.sections?.length === 0 ? (
              <p style={{ color: "var(--text3)" }}>No compliance data available</p>
            ) : (
              data.sections.map((s) => (
                <div key={s.name} className="comp-row">
                  <div className="comp-name">{s.name}</div>
                  <Badge status={s.status} />
                  <AnimatedBar coverage={s.coverage} status={s.status} />
                  <div className="comp-pct">{s.coverage}%</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ================= EXPORT ================= */}
      <Card className="fade-up-1">
        <SectionHeader title="Export Report" />

        <p style={{ color: "var(--text2)", fontSize: 13.5, marginBottom: 20 }}>
          Generate a full compliance report with test results and coverage.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={() => handleExport("pdf")} disabled={!!exporting}>
            {exporting === "pdf" ? (
              <>
                <Spinner size={13} /> Generating...
              </>
            ) : (
              "Export PDF"
            )}
          </Button>

          <Button variant="ghost" onClick={() => handleExport("json")} disabled={!!exporting}>
            {exporting === "json" ? (
              <>
                <Spinner size={13} /> Generating...
              </>
            ) : (
              "Export JSON"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}