// Centralized Backend API URL Configuration
// Reads from VITE_API_URL environment variable, defaulting to localhost:8080 for local dev
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Clean up trailing slash and accidental "/api" duplication
export const API_URL = rawUrl.trim().replace(/\/+$/, "").replace(/\/api$/, "");
