import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { io } from "socket.io-client";
import { getDeviceId } from "../hooks/useDeviceId";

const renderURL = "https://soporte-tickets-ybpf.onrender.com";
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

type RetryRequest = InternalAxiosRequestConfig & { _retry?: boolean };
let refreshRequest: Promise<string> | null = null;

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as RetryRequest | undefined;
  const refreshToken = localStorage.getItem("refreshToken");
  const isAuthRequest = request?.url?.includes("/auth/login") || request?.url?.includes("/auth/refresh");
  if (error.response?.status !== 401 || !request || request._retry || !refreshToken || isAuthRequest) {
    return Promise.reject(error);
  }

  request._retry = true;
  try {
    refreshRequest ??= axios.post<{ accessToken: string }>(`${apiBaseURL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      })
      .finally(() => { refreshRequest = null; });
    const accessToken = await refreshRequest;
    request.headers.Authorization = `Bearer ${accessToken}`;
    return api(request);
  } catch (refreshError) {
    clearSession();
    if (!window.location.pathname.endsWith("/login")) {
      window.location.assign(`${import.meta.env.BASE_URL}login`);
    }
    return Promise.reject(refreshError);
  }
});

export const socket = io(socketURL, {
  autoConnect: false
});
