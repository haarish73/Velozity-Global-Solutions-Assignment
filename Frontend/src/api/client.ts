import axios from "axios";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Adjust to your backend URL

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

// 2. Socket.io Setup
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // Prevents automatic connection before auth
  auth: (cb) => {
    cb({ token: localStorage.getItem("accessToken") });
  },
});

// Helper function to connect socket
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

// Helper function to disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};