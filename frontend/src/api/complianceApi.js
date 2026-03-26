import API from "./axios";

// GET compliance data
export const getCompliance = async () => {
  try {
    const res = await API.get("/compliance/");
    return res.data || { sections: [] }; //  safe fallback
  } catch (err) {
    console.error("Error fetching compliance:", err);
    return {}; //  prevents crash
  }
};

// EXPORT report
export const exportReport = async (format) => {
  try {
    const res = await API.get(`/compliance/export?format=${format}`);
    return res.data;
  } catch (err) {
    console.error("Error exporting report:", err);
    throw err; // let UI handle it
  }
};
