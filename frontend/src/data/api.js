/**
 * VeriTest API Service
 *
 * HOW TO SWITCH FROM MOCK → REAL BACKEND:
 * 1. Set USE_MOCK = false
 * 2. Make sure your FastAPI backend is running at http://localhost:8000
 * 3. That's it — all functions below will call real endpoints automatically.
 */

import axios from "axios";
import {
  mockStats,
  mockCoverageHistory,
  mockRequirements,
  mockTestRuns,
  mockCompliance,
} from "../data/mockData";

const USE_MOCK = true; // ← flip to false when backend is ready

const BASE_URL = "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ─── Dashboard ────────────────────────────────────────────────
export async function fetchStats() {
  if (USE_MOCK) { await delay(); return mockStats; }
  const { data } = await api.get("/dashboard/stats");
  return data;
}

export async function fetchCoverageHistory() {
  if (USE_MOCK) { await delay(); return mockCoverageHistory; }
  const { data } = await api.get("/dashboard/coverage-history");
  return data;
}

// ─── Requirements ─────────────────────────────────────────────
export async function fetchRequirements() {
  if (USE_MOCK) { await delay(); return mockRequirements; }
  const { data } = await api.get("/requirements");
  return data;
}

export async function createRequirement(payload) {
  if (USE_MOCK) {
    await delay(800);
    return { id: `REQ-00${mockRequirements.length + 1}`, ...payload, status: "pending", scriptsCount: 0, createdAt: "Just now" };
  }
  const { data } = await api.post("/requirements", payload);
  return data;
}

// ─── Generate ─────────────────────────────────────────────────
export async function generateTestScript(reqId) {
  if (USE_MOCK) {
    await delay(1400);
    return {
      scriptId: `SCR-${Math.floor(Math.random() * 9000) + 1000}`,
      code: `import pytest\nfrom selenium import webdriver\nfrom selenium.webdriver.common.by import By\n\nclass TestGeneratedFlow:\n\n    def setup_method(self):\n        options = webdriver.ChromeOptions()\n        options.add_argument("--headless")\n        self.driver = webdriver.Chrome(options=options)\n\n    def test_flow(self):\n        self.driver.get("/login")\n        self.driver.find_element(By.ID, "username").send_keys("test@example.com")\n        self.driver.find_element(By.ID, "password").send_keys("password123")\n        self.driver.find_element(By.ID, "submit-btn").click()\n        assert "/dashboard" in self.driver.current_url\n\n    def teardown_method(self):\n        self.driver.quit()`,
      parsed: {
        actions: ["navigate → /login", "enter → #username", "enter → #password", "click → #submit-btn"],
        assertions: ["url_contains → /dashboard", "element_present → .dashboard-header"],
        confidence: 0.91,
      },
    };
  }
  const { data } = await api.post(`/generate-test/${reqId}`);
  return data;
}

// ─── Test Runs ────────────────────────────────────────────────
export async function fetchTestRuns() {
  if (USE_MOCK) { await delay(); return mockTestRuns; }
  const { data } = await api.get("/runs");
  return data;
}

export async function fetchRunLogs(runId) {
  if (USE_MOCK) {
    await delay(300);
    return mockTestRuns.find((r) => r.id === runId)?.logs || [];
  }
  const { data } = await api.get(`/runs/${runId}/logs`);
  return data;
}

export async function runTestScript(scriptId) {
  if (USE_MOCK) {
    await delay(800);
    return { runId: `RUN-${Math.floor(Math.random() * 9000) + 1000}`, status: "RUNNING" };
  }
  const { data } = await api.post(`/run-test/${scriptId}`);
  return data;
}

// ─── Compliance ───────────────────────────────────────────────
export async function fetchCompliance() {
  if (USE_MOCK) { await delay(); return mockCompliance; }
  const { data } = await api.get("/compliance");
  return data;
}

export async function exportReport(format = "pdf") {
  if (USE_MOCK) {
    await delay(1200);
    return { success: true, message: `${format.toUpperCase()} report generated` };
  }
  const { data } = await api.get(`/reports/export?format=${format}`);
  return data;
}
