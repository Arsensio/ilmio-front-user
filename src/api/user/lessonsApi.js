import { httpClient } from "../http/httpClient";

export async function getUserLessons() {
    const res = await httpClient.get("/api/user/lessons");
    return res.data; // [{id,title,description,orderIndex,lessonStatus,...}]
}

export async function getUserLessonById(lessonId) {
    const { data } = await httpClient.get(`/api/user/lessons/${lessonId}`);
    return data;
}

export async function completeLesson(lessonId) {
    const { data } = await httpClient.post(`/api/user/lessons/${lessonId}/complete`);
    return data; // boolean
}