import { httpClient } from "../http/httpClient";

export async function registerUser(body) {
    const res = await httpClient.post("/auth/register", body);
    return res.data; // { uuid, secondsLeft }
}

export async function verifyOtp(body) {
    const res = await httpClient.post("/auth/verify", body);
    return res.data; // { token }
}

export async function getVerifyStatus(uuid) {
    const res = await  httpClient.get(`/auth/${uuid}/verify`);
    return res.data; // { uuid, secondsLeft }
}
