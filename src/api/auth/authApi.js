import { httpClient } from "../http/httpClient";
import { tokenStorage } from "../../shared/tokenStorage";

/**
 * POST /auth/login
 * body: { username, password }
 * response: { token }
 */
export async function login({ username, password }) {
    const response = await httpClient.post("/auth/login", {
        username,
        password
    });

    const token = response?.data?.token;

    if (token) {
        tokenStorage.set(token);
    }

    return response.data; // { token }
}

export function logout() {
    tokenStorage.clear();
}
