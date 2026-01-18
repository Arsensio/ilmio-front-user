import { httpClient } from "../http/httpClient";

export async function getUserLessons() {
    const res = await httpClient.get("/api/user/lessons");
    return res.data; // [{id,title,description,orderIndex,lessonStatus,...}]
}
