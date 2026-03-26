import API from "./axios";

// GET all test runs
export const getTestRuns = async () => {
  try {
    const res = await API.get("/test-runs/");
    return res.data?.data || [];   //  safe fallback
  } catch (err) {
    console.error("Error fetching test runs:", err);
    return []; //  prevents UI crash
  }
};

// RUN a test
export const runTest = async (requirementId) => {
  try {
    const res = await API.post(`/test-runs/run/${requirementId}`);
    return res.data;
  } catch (err) {
    console.error("Error running test:", err);
    throw err; //  let UI handle error
  }
};