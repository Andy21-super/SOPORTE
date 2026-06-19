import axios from "axios";
import { io } from "socket.io-client";
import { getDeviceId } from "../hooks/useDeviceId";

const renderURL = "https://soporte-tickets.onrender.com";
const configuredApiURL = import.meta.env.VITE_API_URL;
const configuredSocketURL = import.meta.env.VITE_SOCKET_URL;
const isLocalConfigured = configuredApiURL?.includes("localhost") && import.meta.env.PROD;
const apiBaseURL = !isLocalConfigured && configuredApiURL
  ? configuredApiURL
  : import.meta.env.PROD
    ? `${renderURL}/api`
    : "http://localhost:4000/api";
const socketURL = !isLocalConfigured && configuredSocketURL
  ? configuredSocketURL
  : import.meta.env.PROD
    ? renderURL
    : "http://localhost:4000";

export const api = axios.create({
  baseURL: apiBaseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const deviceId = getDeviceId();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-device-id'] = deviceId;
  return config;
});

export const socket = io(socketURL, {
  autoConnect: false
});
