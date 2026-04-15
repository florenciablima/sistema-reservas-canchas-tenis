import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 REQUEST → agrega token automáticamente
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE → manejar errores globales (CLAVE)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 👉 Si el token expiró o es inválido
    if (error.response?.status === 401) {
      console.warn("🔒 Sesión expirada");

      localStorage.removeItem("token");

      // 🔥 redirige al login automáticamente
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default client;