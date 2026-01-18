import { httpClient } from "../http/httpClient";

export async function getLanguages() {
    const res = await httpClient.get("/dictionary/languages");
    return res.data; // [{code:"KZ",label:"KZ"}, ...]
}