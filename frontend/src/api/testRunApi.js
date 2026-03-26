import API from "./axios";

// GET all test runs
export const getTestRuns = async () => {
  const res = await API.get("/test-runs/");
  return res.data.data;
};

// RUN a test
export const runTest = async (requirementId) => {
  const res = await API.post(`/test-runs/run/${requirementId}`);
  return res.data;
};