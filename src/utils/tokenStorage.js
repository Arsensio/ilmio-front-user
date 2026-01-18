const TOKEN_KEY = "ilmio_token";

export function getStoredToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
        return null;
    }
}

export function setStoredToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {}
}

export function clearStoredToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
}
