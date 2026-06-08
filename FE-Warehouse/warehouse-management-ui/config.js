const dev = {
  apiUrl: import.meta.env.VITE_APP_API_URL || "https://mdm-test.c4i4.org/api/",
  // apiUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/",
};

const prod = {
  apiUrl: import.meta.env.VITE_APP_API_URL || "/api",
};

const config = import.meta.env.MODE === "development" ? dev : prod;

export default config;
