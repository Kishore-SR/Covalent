import axios from "axios";

// Use explicit URL for production to avoid environment variable issues
const API_URL =
  import.meta.env.MODE === "production"
    ? "https://covalent-backend.vercel.app/api"
    : import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

console.log("Using API URL:", API_URL); // Debug log

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, //send cookies with requests
});
