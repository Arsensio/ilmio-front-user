import React, {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {AnimatePresence, motion} from "framer-motion";

import {
    getUserLessonById,
    completeLesson,
} from "../../api/user/lessonsApi";

import {
    getRandomLessonBlockQuestion,
    sendTestAnswer,
} from "../../api/user/testsApi";

import LessonLayout from "../../layouts/LessonLayout";
import BlockRenderer from "./BlockRenderer";
import BlockTest from "./BlockTest";

import {COLORS} from "../../theme/colors";
import muizzaHello from "../../assets/images/muizza_hello.png";
import muizzaLike from "../../assets/images/muizza_like.png";

/* ---------------- UI ---------------- */

function ProgressBar({currentIndex, total}) {
    const percent = total ? Math.round((currentIndex / total) * 100) : 0;

    return (
        <div className="w-full h-[12px] rounded-full bg-white/60 overflow-hidden">
            <div
                className="h-full transition-all"
                style={{
                    width: `${percent}%`,
                    background: `linear-gradient(${COLORS.auth.buttonGreenTop}, ${COLORS.auth.buttonGreenBottom})`,
                }}
            />
        </div>
    );
}

function PrimaryButton({children, onClick}) {
    return (
        <motion.button
            whileTap={{scale: 0.97}}
            onClick={onClick}
            className="w-full h-[74px] rounded-[30px] text-white text-[28px] font-black"
            style={{
                background: `linear-gradient(${COLORS.auth.buttonGreenTop}, ${COLORS.auth.buttonGreenBottom})`,
            }}
        >
            {children}
        </motion.button>
    );
}

function LessonCard({children}) {
    return (
        <div
            className="relative rounded-[34px] bg-white/95 border border-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] px-6 py-6">
            {children}
        </div>
    );
}

/* ---------------- MAIN ---------------- */

export default function LessonMobile() {
    const {lessonId} = useParams();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState("");
    const [lesson, setLesson] = useState(null);

    const [step, setStep] = useState(0);
    const [mode, setMode] = useState("CONTENT"); // CONTENT | BLOCK_TEST

    const [question, setQuestion] = useState(null);
    const [answerLocked, setAnswerLocked] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [testPayload, setTestPayload] = useState(null);
    const [testReady, setTestReady] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    /* ---------- LOAD LESSON ---------- */

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const data = await getUserLessonById(lessonId);
                const blocks = (data.blocks || []).sort(
                    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
                );

                setLesson({...data, blocks});
                setStep(0);
            } catch {
                setErrorText(t("lesson.loadFailed"));
            } finally {
                setLoading(false);
            }
        })();
    }, [lessonId, t]);

    const blocks = lesson?.blocks || [];
    const totalSteps = blocks.length + 2;

    const isIntro = step === 0;
    const isFinish = step === blocks.length + 1;
    const currentBlock = !isIntro && !isFinish ? blocks[step - 1] : null;

    /* ---------- COMPLETE LESSON ---------- */


    /* ---------- TEST FLOW ---------- */

    async function loadBlockTest(blockId) {
        try {
            setLoading(true);
            setQuestion(null);
            setAnswerLocked(false);
            setLastResult(null);

            const q = await getRandomLessonBlockQuestion(blockId);

            if (!q || q.isTestFinished) {
                setMode("CONTENT");
                setStep((s) => s + 1);
                return;
            }

            setQuestion(q);
            setMode("BLOCK_TEST");
        } catch {
            setErrorText("Ошибка загрузки теста");
        } finally {
            setLoading(false);
        }
    }

    async function submitTestAnswer() {
        if (!testReady || !testPayload) return;

        try {
            setAnswerLocked(true);

            const res = await sendTestAnswer({
                questionId: question.id,
                selectedPairs: testPayload,
            });

            const ok = typeof res === "boolean" ? res : res?.correct;
            setLastResult(ok);

            setTimeout(() => loadBlockTest(currentBlock.id), 700);
        } catch {
            setAnswerLocked(false);
        }
    }

    async function handleFinish() {
        try {
            await completeLesson(lessonId);
        } catch (e) {
            console.error("Failed to complete lesson", e);
            // при желании можно показать toast
        } finally {
            navigate("/app/lessons", {replace: true});
        }
    }


    /* ---------- NAV ---------- */

    const next = () => {
        if (isIntro) {
            setStep(1);
            return;
        }

        if (currentBlock) {
            loadBlockTest(currentBlock.id);
            return;
        }

        setStep(blocks.length + 1);
    };

    const slideKey = useMemo(() => {
        if (isIntro) return "intro";
        if (isFinish) return "finish";
        if (mode === "BLOCK_TEST") return `test-${question?.id}`;
        return `block-${currentBlock?.id}`;
    }, [isIntro, isFinish, mode, question, currentBlock]);

    /* ---------- RENDER ---------- */

    return (
        <div
            className="w-full h-[100dvh]"
            style={{
                background: `linear-gradient(${COLORS.bg.orangeTop}, ${COLORS.bg.orangeBottom})`,
            }}
        >
            <LessonLayout
                header={
                    <div className="flex gap-3 items-center px-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-[54px] h-[54px] bg-white rounded-[20px] flex items-center justify-center text-[26px] font-black"
                        >
                            ✕
                        </button>

                        <ProgressBar currentIndex={step + 1} total={totalSteps}/>
                    </div>
                }
                footer={
                    !loading && !errorText && !isFinish ? (
                        <PrimaryButton
                            onClick={
                                mode === "BLOCK_TEST"
                                    ? submitTestAnswer
                                    : next
                            }
                            disabled={
                                mode === "BLOCK_TEST" && !testReady
                            }
                        >
                            {t("lesson.next")}
                        </PrimaryButton>
                    ) : isFinish ? (
                        <PrimaryButton onClick={handleFinish}>
                            {t("lesson.finishGoHome")}
                        </PrimaryButton>
                    ) : null
                }
            >
                <AnimatePresence mode="wait">
                    <motion.div key={slideKey} initial={{opacity: 0}} animate={{opacity: 1}}>

                        {isIntro && (
                            <div className="relative text-center">
                                <img
                                    src={muizzaHello}
                                    className="mx-auto w-[220px] mb-[-11px] z-10 relative"
                                />

                                <LessonCard>
                                    <h1 className="text-[28px] font-black mb-3">
                                        {lesson?.title}
                                    </h1>

                                    {lesson?.description && (
                                        <p className="text-[18px] font-semibold opacity-80">
                                            {lesson.description}
                                        </p>
                                    )}
                                </LessonCard>
                            </div>
                        )}

                        {mode === "CONTENT" && currentBlock && (
                            <LessonCard>
                                <BlockRenderer block={currentBlock}/>
                            </LessonCard>
                        )}

                        {mode === "BLOCK_TEST" && question && (
                            <BlockTest
                                question={question}
                                answerLocked={answerLocked}
                                lastResult={lastResult}
                                onChange={({ready, payload}) => {
                                    setTestReady(ready);
                                    setTestPayload(payload);
                                }}
                            />
                        )}


                        {isFinish && (
                            <div className="relative text-center">
                                <img
                                    src={muizzaLike}
                                    className="mx-auto w-[220px] mb-[-12px] z-10 relative"
                                />

                                <LessonCard>
                                    <h2 className="text-[26px] font-black">
                                        {t("lesson.finishCongrats")}
                                    </h2>
                                </LessonCard>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </LessonLayout>
        </div>
    );
}
