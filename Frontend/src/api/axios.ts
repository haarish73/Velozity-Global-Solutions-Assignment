import axios from "axios";

const API = axios.create({
  baseURL: "https://velozity-global-solutions-assignment-l91b.onrender.com/api",
  withCredentials: true // for refresh token cookie
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;