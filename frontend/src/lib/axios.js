import axios from "axios";

/**
 * Axios instance pre-configured with the backend base URL.
 * Automatically attaches JWT token from localStorage to every request.
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
    console.warn("⚠️ VITE_API_URL is not defined in production environment!");
}

const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // Important for cookies/sessions if used
});

// Request interceptor — inject Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
