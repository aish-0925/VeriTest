import API from "./axios";

// GET compliance data
export const getCompliance = async () => {
  const res = await API.get("/compliance/");
  return res.data;
};

// EXPORT report
export const exportReport = async (format) => {
  const res = await API.get(`/dashboard/export?format=${format}`);
  return res.data;
};