// api/index.ts
import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"}/api`,
  withCredentials: true, // important for sending refresh token
});
