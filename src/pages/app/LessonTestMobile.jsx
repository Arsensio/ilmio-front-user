// src/pages/app/LessonTestMobile.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import LessonLayout from "../../layouts/LessonLayout";
import { COLORS } from "../../theme/colors";

import muizzaLike from "../../assets/images/muizza_like.png";

import { getRandomTestQuestion, sendTestAnswer } from "../../api/user/testsApi";
import { completeLesson } from "../../api/user/lessonsApi"; // ✅ ДОБАВИЛИ

/* ---------------- UI helpers ---------------- */

function LessonCard({ children }) {
    return (
        <div className="relative rounded-[34px] bg-white/92 border border-white/70 shadow-[0_18px_50px_rgba(0,0,0,0.18)] px-6 py-6 overflow-hidden">
            <div className="relative">{children}</div>
        </div>
    );
}

function PrimaryButton({ children, onClick, disabled }) {
    return (
        <motion.button
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="w-full h-[74px] rounded-[30px] text-white text-[30px] font-black disabled:opacity-70"
            style={{
                background: `linear-gradient(to bottom, ${COLORS.auth.buttonGreenTop}, ${COLORS.auth.buttonGreenBottom})`,
                boxShadow: `0 12px 0 ${COLORS.auth.buttonShadowGreen}, 0 26px 60px rgba(0,0,0,0.20)`,
            }}
        >
            {children}
        </motion.button>
    );
}

function ProgressBar({ currentIndex, total }) {
    const percent =
        total <= 0 ? 0 : Math.min(100, Math.round((currentIndex / total) * 100));

    return (
        <div className="w-full h-[12px] rounded-full bg-white/60 overflow-hidden shadow-[inset_0_2px_7px_rgba(0,0,0,0.18)]">
            <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                    width: `${percent}%`,
                    background: `linear-gradient(to bottom, ${COLORS.auth.buttonGreenTop}, ${COLORS.auth.buttonGreenBottom})`,
                }}
            />
        </div>
    );
}

function AnimatedSlide({ children, slideKey }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={slideKey}
                initial={{ opacity: 0, y: 18, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.995 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

/* ---------------- answer builders ---------------- */

function singleSelectedPairs(item) {
    if (!item) return {};
    return { [item.key]: item.value };
}

function normalizeMatchPairs(pairs) {
    return pairs || {};
}

/* ---------------- small utils ---------------- */

function removeOnce(list, value) {
    const idx = list.indexOf(value);
    if (idx === -1) return list;
    const next = list.slice();
    next.splice(idx, 1);
    return next;
}

function uniquePush(list, value) {
    if (!value) return list;
    return list.includes(value) ? list : [...list, value];
}

/* ---------------- main page ---------------- */

export default function LessonTestMobile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { lessonId } = useParams();

    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState("");

    const [question, setQuestion] = useState(null);

    // local answer state
    const [selectedKey, setSelectedKey] = useState(null); // for SINGLE_CHOICE / TRUE_FALSE

    // MATCH state
    const [matchPairs, setMatchPairs] = useState({});
    const [availableRight, setAvailableRight] = useState([]);

    const [answerLocked, setAnswerLocked] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    const [completed, setCompleted] = useState(false);

    // ✅ Завершение урока (API)
    const [completingLesson, setCompletingLesson] = useState(false);

    const [questionNumber, setQuestionNumber] = useState(1);
    const TOTAL_FOR_UI = 10;

    const slideKey = useMemo(() => {
        if (completed) return "completed";
        if (loading) return "loading";
        if (errorText) return "error";
        return `question-${question?.id ?? "none"}`;
    }, [completed, loading, errorText, question]);

    function resetAnswerState() {
        setSelectedKey(null);
        setMatchPairs({});
        setAvailableRight([]);
        setAnswerLocked(false);
        setLastResult(null);
    }

    function initMatchState(q) {
        const values = (q?.items || []).map((x) => x.value);
        setAvailableRight(values);
        setMatchPairs({});
    }

    async function loadRandomQuestion() {
        setLoading(true);
        setErrorText("");
        setQuestion(null);
        resetAnswerState();

        try {
            const q = await getRandomTestQuestion(lessonId);

            // ✅ КОНЕЦ ТЕСТА приходит как DTO { isTestFinished: true }
            if (q && typeof q === "object" && q.isTestFinished === true) {
                setCompleted(true);
                return;
            }

            // валидный вопрос
            if (q && typeof q === "object") {
                setQuestion(q);

                if (q?.type === "MATCH") initMatchState(q);
                return;
            }

            setErrorText("Пустой/некорректный ответ сервера 😿");
        } catch (e) {
            console.error(e);
            setErrorText("Не удалось загрузить вопрос теста 😿");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setCompleted(false);
        setQuestionNumber(1);
        loadRandomQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonId]);

    const canSubmit = useMemo(() => {
        if (!question) return false;
        if (answerLocked) return false;

        if (question.type === "MATCH") {
            const leftKeys = (question.items || []).map((x) => x.key);
            return leftKeys.every((k) => Boolean(matchPairs[k]));
        }

        return Boolean(selectedKey);
    }, [question, selectedKey, matchPairs, answerLocked]);

    async function submitAnswer() {
        if (!question || !canSubmit) return;

        try {
            setAnswerLocked(true);

            let selectedPairs = {};
            if (question.type === "MATCH") {
                selectedPairs = normalizeMatchPairs(matchPairs);
            } else {
                const item = (question.items || []).find((x) => x.key === selectedKey);
                selectedPairs = singleSelectedPairs(item);
            }

            const res = await sendTestAnswer({
                questionId: question.id,
                selectedPairs,
            });

            const ok =
                typeof res === "boolean"
                    ? res
                    : typeof res?.correct === "boolean"
                        ? res.correct
                        : typeof res?.ok === "boolean"
                            ? res.ok
                            : Boolean(res);

            setLastResult(Boolean(ok));

            setTimeout(() => {
                setQuestionNumber((n) => Math.min(TOTAL_FOR_UI, n + 1));
                loadRandomQuestion(); // ✅ тут и закончится тест, если q.isTestFinished === true
            }, 700);
        } catch (e) {
            console.error(e);
            setAnswerLocked(false);
            setErrorText("Не удалось отправить ответ 😿");
        }
    }

    // ✅ Завершить урок: POST /api/user/lessons/{lessonId}/complete
    async function finishLesson() {
        if (completingLesson) return;

        try {
            setErrorText("");
            setCompletingLesson(true);

            const ok = await completeLesson(lessonId);

            if (ok === true) {
                navigate("/app/home", { replace: true });
            } else {
                setErrorText("Не удалось завершить урок 😿");
            }
        } catch (e) {
            console.error(e);
            setErrorText("Ошибка при завершении урока 😿");
        } finally {
            setCompletingLesson(false);
        }
    }

    /* ---------------- MATCH DnD ---------------- */

    function handleDropToLeft(leftKey, droppedValue) {
        if (!droppedValue) return;
        if (answerLocked) return;

        setMatchPairs((prevPairs) => {
            const nextPairs = { ...prevPairs };

            const usedKey = Object.keys(nextPairs).find(
                (k) => nextPairs[k] === droppedValue
            );
            if (usedKey) delete nextPairs[usedKey];

            const prevChosen = nextPairs[leftKey];

            nextPairs[leftKey] = droppedValue;

            setAvailableRight((cur) => {
                let next = cur;
                next = removeOnce(next, droppedValue);
                if (prevChosen) next = uniquePush(next, prevChosen);
                return next;
            });

            return nextPairs;
        });
    }

    function removeMatch(leftKey) {
        if (answerLocked) return;

        setMatchPairs((prevPairs) => {
            const chosen = prevPairs[leftKey];
            if (!chosen) return prevPairs;

            const nextPairs = { ...prevPairs };
            delete nextPairs[leftKey];

            setAvailableRight((cur) => uniquePush(cur, chosen));
            return nextPairs;
        });
    }

    /* ---------------- render: answer UI ---------------- */

    function renderSingleChoice() {
        return (
            <div className="mt-5 space-y-3">
                {(question.items || []).map((it) => {
                    const active = selectedKey === it.key;

                    return (
                        <button
                            key={it.key}
                            type="button"
                            disabled={answerLocked}
                            onClick={() => setSelectedKey(it.key)}
                            className="w-full text-left rounded-[22px] px-4 py-4 font-extrabold border transition-all"
                            style={{
                                background: active
                                    ? "rgba(47,124,200,0.12)"
                                    : "rgba(255,255,255,0.75)",
                                borderColor: active ? "#2F7CC8" : "rgba(255,255,255,0.7)",
                                boxShadow: active
                                    ? "0 18px 40px rgba(0,0,0,0.10)"
                                    : "0 12px 30px rgba(0,0,0,0.06)",
                                color: COLORS.text.dark,
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-black text-[18px]"
                                    style={{
                                        background: active ? "#2F7CC8" : "rgba(0,0,0,0.06)",
                                        color: active ? "#fff" : COLORS.text.dark,
                                    }}
                                >
                                    {String(it.key).toUpperCase()}
                                </div>

                                <div className="text-[18px] leading-snug">{it.value}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    }

    function renderTrueFalse() {
        return (
            <div className="mt-5 grid grid-cols-2 gap-3">
                {(question.items || []).map((it) => {
                    const active = selectedKey === it.key;

                    return (
                        <button
                            key={it.key}
                            type="button"
                            disabled={answerLocked}
                            onClick={() => setSelectedKey(it.key)}
                            className="rounded-[24px] px-4 py-5 border font-black text-[20px]"
                            style={{
                                background: active
                                    ? "rgba(56, 189, 248, 0.18)"
                                    : "rgba(255,255,255,0.78)",
                                borderColor: active ? "#2F7CC8" : "rgba(255,255,255,0.7)",
                                color: COLORS.text.dark,
                            }}
                        >
                            {it.value}
                        </button>
                    );
                })}
            </div>
        );
    }

    function renderMatch() {
        const leftList = question.items || [];

        return (
            <div className="mt-5 space-y-4">
                <div className="space-y-3">
                    {leftList.map((it) => {
                        const chosen = matchPairs[it.key] || null;

                        return (
                            <div
                                key={it.key}
                                className="w-full rounded-[22px] px-4 py-4 border bg-white/75"
                                style={{ borderColor: "rgba(255,255,255,0.7)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-black text-[18px]"
                                        style={{
                                            background: "rgba(0,0,0,0.06)",
                                            color: COLORS.text.dark,
                                        }}
                                    >
                                        {it.key}
                                    </div>

                                    <div className="flex-1">
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const droppedValue =
                                                    e.dataTransfer.getData("text/plain");
                                                handleDropToLeft(it.key, droppedValue);
                                            }}
                                            className="h-[56px] rounded-[18px] flex items-center justify-between px-4 border-2"
                                            style={{
                                                background: "white",
                                                borderColor: chosen
                                                    ? "rgba(34,197,94,0.55)"
                                                    : "rgba(47,124,200,0.35)",
                                            }}
                                        >
                                            <div
                                                className="font-black text-[18px]"
                                                style={{ color: COLORS.text.dark }}
                                            >
                                                {chosen ? chosen : "Перетащите сюда"}
                                            </div>

                                            {chosen ? (
                                                <button
                                                    type="button"
                                                    disabled={answerLocked}
                                                    onClick={() => removeMatch(it.key)}
                                                    className="px-3 py-2 rounded-[14px] font-black text-[14px]"
                                                    style={{
                                                        background: "rgba(239,68,68,0.14)",
                                                        color: "#991b1b",
                                                    }}
                                                >
                                                    Убрать
                                                </button>
                                            ) : null}
                                        </div>

                                        <div className="text-[13px] font-extrabold opacity-60 mt-2">
                                            {chosen
                                                ? `Вы выбрали: ${chosen}`
                                                : "Сопоставьте значение"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-2">
                    <div
                        className="text-[14px] font-black mb-2"
                        style={{ color: COLORS.text.dark }}
                    >
                        Перетащи варианты:
                    </div>

                    <div className="flex flex-wrap gap-6 justify-center">
                        {availableRight.length === 0 ? (
                            <div className="text-[14px] font-extrabold opacity-60">
                                Все варианты использованы
                            </div>
                        ) : (
                            availableRight.map((val, idx) => (
                                <div
                                    key={`${val}-${idx}`}
                                    draggable={!answerLocked}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("text/plain", val);
                                        e.dataTransfer.effectAllowed = "move";
                                    }}
                                    className="rounded-[20px] px-4 py-3 font-black text-[18px] cursor-grab active:cursor-grabbing select-none"
                                    style={{
                                        background: "rgba(47,124,200,0.12)",
                                        border: "2px solid rgba(47,124,200,0.35)",
                                        color: COLORS.text.dark,
                                        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    {val}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    function renderQuestionBody() {
        if (!question) return null;

        if (question.type === "SINGLE_CHOICE") return renderSingleChoice();
        if (question.type === "TRUE_FALSE") return renderTrueFalse();
        if (question.type === "MATCH") return renderMatch();

        return (
            <div className="text-red-600 font-black">
                Unsupported test type: {question.type}
            </div>
        );
    }

    function renderCompleted() {
        return (
            <div className="relative">
                <div className="flex justify-center mb-[-10px] z-20 relative pointer-events-none">
                    <img
                        src={muizzaLike}
                        alt="muizza like"
                        className="w-[180px] h-auto drop-shadow-[0_26px_30px_rgba(0,0,0,0.25)]"
                    />
                </div>

                <LessonCard>
                    <div
                        className="text-[24px] font-black"
                        style={{ color: COLORS.brand.titleBlue }}
                    >
                        🎉 Тест завершён!
                    </div>

                    <div
                        className="mt-3 text-[18px] font-extrabold opacity-70"
                        style={{ color: COLORS.text.dark }}
                    >
                        Молодец! Все вопросы пройдены.
                    </div>

                    {errorText ? (
                        <div className="mt-4 text-center font-black text-[14px] text-red-600">
                            {errorText}
                        </div>
                    ) : null}

                    <div className="mt-6">
                        <PrimaryButton onClick={finishLesson} disabled={completingLesson}>
                            {completingLesson ? "Завершаем..." : "Завершить урок"}
                        </PrimaryButton>
                    </div>
                </LessonCard>
            </div>
        );
    }

    return (
        <div
            className="w-full h-[100dvh] overflow-hidden"
            style={{
                background: `linear-gradient(to bottom, ${COLORS.bg.orangeTop}, ${COLORS.bg.orangeMid}, ${COLORS.bg.orangeBottom})`,
            }}
        >
            <LessonLayout
                header={
                    <div className="rounded-[22px] px-3 py-3 bg-white/15 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-[54px] h-[54px] rounded-[20px] bg-white/90 shadow-[0_10px_25px_rgba(0,0,0,0.18)] font-black"
                                style={{ color: COLORS.brand.titleBlue }}
                            >
                                ←
                            </button>

                            <div className="flex-1">
                                <ProgressBar currentIndex={questionNumber} total={TOTAL_FOR_UI} />
                            </div>
                        </div>
                    </div>
                }
                footer={
                    !loading && !errorText && !completed ? (
                        <div className="rounded-[28px] px-3 py-3 bg-white/15 backdrop-blur-md">
                            <PrimaryButton onClick={submitAnswer} disabled={!canSubmit}>
                                {t("lesson.next")}
                            </PrimaryButton>
                        </div>
                    ) : null
                }
            >
                <AnimatedSlide slideKey={slideKey}>
                    {completed ? (
                        renderCompleted()
                    ) : loading ? (
                        <LessonCard>
                            <div
                                className="text-center font-black text-[22px]"
                                style={{ color: COLORS.brand.titleBlue }}
                            >
                                Загрузка теста...
                            </div>
                        </LessonCard>
                    ) : errorText ? (
                        <LessonCard>
                            <div className="text-center font-black text-[16px] text-red-600">
                                {errorText}
                            </div>

                            <div className="mt-4">
                                <PrimaryButton onClick={loadRandomQuestion}>Повторить</PrimaryButton>
                            </div>
                        </LessonCard>
                    ) : (
                        <div className="relative">
                            <div className="flex justify-center mb-[-10px] z-20 relative pointer-events-none">
                                <img
                                    src={muizzaLike}
                                    alt="muizza like"
                                    className="w-[180px] h-auto drop-shadow-[0_26px_30px_rgba(0,0,0,0.25)]"
                                />
                            </div>

                            <LessonCard>
                                <div
                                    className="text-[22px] font-black"
                                    style={{ color: COLORS.brand.titleBlue }}
                                >
                                    Тест
                                </div>

                                <div
                                    className="mt-2 text-[18px] font-extrabold opacity-70"
                                    style={{ color: COLORS.text.dark }}
                                >
                                    Тип: {question?.type}
                                </div>

                                <div
                                    className="mt-4 text-[20px] font-black leading-snug"
                                    style={{ color: COLORS.text.dark }}
                                >
                                    {question?.text}
                                </div>

                                {renderQuestionBody()}

                                {lastResult !== null ? (
                                    <div className="mt-5">
                                        <div
                                            className="rounded-[22px] px-4 py-4 font-black text-[18px] text-center"
                                            style={{
                                                background: lastResult
                                                    ? "rgba(34,197,94,0.18)"
                                                    : "rgba(239,68,68,0.18)",
                                                color: lastResult ? "#166534" : "#991b1b",
                                                border: `2px solid ${
                                                    lastResult
                                                        ? "rgba(34,197,94,0.40)"
                                                        : "rgba(239,68,68,0.40)"
                                                }`,
                                            }}
                                        >
                                            {lastResult ? "✅ Правильно!" : "❌ Неправильно"}
                                        </div>
                                    </div>
                                ) : null}
                            </LessonCard>
                        </div>
                    )}
                </AnimatedSlide>
            </LessonLayout>
        </div>
    );
}
