import axios from "axios";
import { tokenStorage } from "../../shared/tokenStorage";

export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// ✅ автоматически добавляет Bearer token во все запросы
httpClient.interceptors.request.use((config) => {
    const token = tokenStorage.get();

    // не добавляем токен если его нет
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


/* ===== RESPONSE ===== */
httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);