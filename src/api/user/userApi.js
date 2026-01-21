import { httpClient } from "../http/httpClient";

export async function getCurrentUserInfo(signal) {
    const { data } = await httpClient.get("/api/user/current-user/info", { signal });
    return data;
}
