import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});