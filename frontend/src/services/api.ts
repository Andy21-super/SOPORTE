import axios from "axios";
import { io } from "socket.io-client";

const apiBaseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "/api" : "http://localhost:4000/api");
const socketURL = import.meta.env.VITE_SOCKET_URL ?? (import.meta.env.PROD ? window.location.origin : "http://localhost:4000");

export const api = axios.create({
  baseURL: apiBaseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const socket = io(socketURL, {
  autoConnect: false
});
