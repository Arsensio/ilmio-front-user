// src/api/user/testsApi.js
import {httpClient} from "../http/httpClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

export async function getRandomTestQuestion(lessonId) {
    const res = await httpClient.get(`/api/user/test/lesson-block/${lessonId}/random-question`);
    return res.data; // [{id,title,description,orderIndex,lessonStatus,...}]
}

export async function sendTestAnswer({questionId, selectedPairs}) {
    const res = await httpClient.post(`/api/user/test/answer`, {
        questionId,
        selectedPairs,
    });

    return res.data;
}

export async function getRandomLessonBlockQuestion(blockId) {
    try {
        const res = await httpClient.get(
            `/api/user/test/lesson-block/${blockId}/random-question`
        );

        return res.data;
    } catch (e) {
        if (e.response?.status === 204) {
            return null; // 👈 ВАЖНО
        }
        throw e;
    }
}
