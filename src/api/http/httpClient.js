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
