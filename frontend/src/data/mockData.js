export const mockStats = {
  totalTests: 148,
  passRate: 87.2,
  coverage: 91.4,
  activeRuns: 3,
  avgDuration: "2.4s",
  compliance: "PASS",
};

export const mockCoverageHistory = [
  { date: "Mar 18", coverage: 74, passed: 62, failed: 14 },
  { date: "Mar 19", coverage: 78, passed: 68, failed: 12 },
  { date: "Mar 20", coverage: 81, passed: 74, failed: 10 },
  { date: "Mar 21", coverage: 85, passed: 80, failed: 9 },
  { date: "Mar 22", coverage: 88, passed: 86, failed: 7 },
  { date: "Mar 23", coverage: 91, passed: 91, failed: 6 },
  { date: "Mar 24", coverage: 91.4, passed: 93, failed: 5 },
];

export const mockRequirements = [
  {
    id: "REQ-001",
    title: "User Login Flow",
    description:
      "User navigates to login page, enters valid credentials, and clicks login. The dashboard should appear.",
    status: "generated",
    createdAt: "Mar 22, 09:14",
    scriptsCount: 3,
  },
  {
    id: "REQ-002",
    title: "Product Search Validation",
    description:
      "User enters a search query in the search bar and presses enter. Results page should display matching items.",
    status: "generated",
    createdAt: "Mar 22, 10:30",
    scriptsCount: 2,
  },
  {
    id: "REQ-003",
    title: "Checkout Process",
    description:
      "User adds item to cart, proceeds to checkout, fills shipping info, and completes payment. Order confirmation should appear.",
    status: "pending",
    createdAt: "Mar 23, 14:02",
    scriptsCount: 0,
  },
  {
    id: "REQ-004",
    title: "Password Reset",
    description:
      "User clicks forgot password, enters email, receives reset link, and sets new password successfully.",
    status: "generated",
    createdAt: "Mar 23, 15:44",
    scriptsCount: 2,
  },
  {
    id: "REQ-005",
    title: "Profile Update",
    description:
      "User navigates to profile settings, updates display name and avatar, and saves changes. Success toast should appear.",
    status: "error",
    createdAt: "Mar 24, 08:20",
    scriptsCount: 1,
  },
];

export const mockTestRuns = [
  {
    id: "RUN-2401",
    reqId: "REQ-001",
    script: "test_login_valid.py",
    status: "PASS",
    duration: "1.8s",
    startedAt: "10:02",
    coverage: 100,
    logs: [
      { level: "INFO", msg: "WebDriver initialized (headless Chrome)", t: "10:02:01" },
      { level: "INFO", msg: "Navigating to /login", t: "10:02:01" },
      { level: "INFO", msg: "Entered username: test@example.com", t: "10:02:02" },
      { level: "INFO", msg: "Entered password: ••••••••", t: "10:02:02" },
      { level: "INFO", msg: "Clicked #submit-btn", t: "10:02:03" },
      { level: "PASS", msg: "Dashboard loaded — assertion passed", t: "10:02:03" },
    ],
  },
  {
    id: "RUN-2402",
    reqId: "REQ-001",
    script: "test_login_invalid.py",
    status: "PASS",
    duration: "2.1s",
    startedAt: "10:04",
    coverage: 100,
    logs: [
      { level: "INFO", msg: "WebDriver initialized", t: "10:04:00" },
      { level: "INFO", msg: "Entered invalid credentials", t: "10:04:01" },
      { level: "PASS", msg: "Error message displayed — assertion passed", t: "10:04:02" },
    ],
  },
  {
    id: "RUN-2403",
    reqId: "REQ-002",
    script: "test_search_results.py",
    status: "FAIL",
    duration: "3.2s",
    startedAt: "10:10",
    coverage: 60,
    logs: [
      { level: "INFO", msg: "Navigating to /home", t: "10:10:01" },
      { level: "INFO", msg: "Typed 'laptop' in search bar", t: "10:10:02" },
      { level: "ERROR", msg: "TimeoutException: #results-grid not found after 3s", t: "10:10:05" },
      { level: "FAIL", msg: "Assertion failed: results page did not render", t: "10:10:05" },
    ],
  },
  {
    id: "RUN-2404",
    reqId: "REQ-004",
    script: "test_password_reset.py",
    status: "PASS",
    duration: "2.6s",
    startedAt: "11:00",
    coverage: 100,
    logs: [
      { level: "INFO", msg: "Clicked 'Forgot password'", t: "11:00:01" },
      { level: "INFO", msg: "Entered email: user@test.com", t: "11:00:02" },
      { level: "PASS", msg: "Reset confirmation displayed", t: "11:00:03" },
    ],
  },
  {
    id: "RUN-2405",
    reqId: "REQ-005",
    script: "test_profile_update.py",
    status: "ERROR",
    duration: "0.4s",
    startedAt: "11:30",
    coverage: 0,
    logs: [
      { level: "ERROR", msg: "SyntaxError in generated script at line 14", t: "11:30:00" },
      { level: "ERROR", msg: "Test aborted — script could not be executed", t: "11:30:00" },
    ],
  },
  {
    id: "RUN-2406",
    reqId: "REQ-002",
    script: "test_search_empty.py",
    status: "RUNNING",
    duration: "—",
    startedAt: "12:01",
    coverage: null,
    logs: [
      { level: "INFO", msg: "WebDriver initialized", t: "12:01:00" },
      { level: "INFO", msg: "Navigating to /home", t: "12:01:01" },
    ],
  },
];

export const mockCompliance = {
  overallStatus: "PASS",
  coveragePct: 91.4,
  totalTests: 148,
  passed: 129,
  failed: 13,
  errors: 6,
  generatedAt: "Mar 24, 10:05",
  sections: [
    { name: "Authentication", status: "PASS", coverage: 100 },
    { name: "Search & Discovery", status: "FAIL", coverage: 60 },
    { name: "Checkout", status: "PENDING", coverage: 0 },
    { name: "Account Management", status: "PASS", coverage: 95 },
  ],
};
