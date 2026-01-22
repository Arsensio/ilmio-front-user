import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

import { getUserLessonById } from "../../api/user/lessonsApi";
import { COLORS } from "../../theme/colors";

import murziya from "../../assets/images/muizza_sit.png";
import muizzaHello from "../../assets/images/muizza_hello.png";
import muizzaLike from "../../assets/images/muizza_like.png";

import LessonLayout from "../../layouts/LessonLayout";

/* ---------------- HELPERS ---------------- */

function extractYoutubeId(url) {
    if (!url) return null;

    try {
        const u = new URL(url);

        const v = u.searchParams.get("v");
        if (v) return v;

        if (u.hostname.includes("youtu.be")) {
            const id = u.pathname.split("/").filter(Boolean)[0];
            return id || null;
        }

        if (u.pathname.startsWith("/shorts/")) {
            const id = u.pathname.replace("/shorts/", "").split("/")[0];
            return id || null;
        }

        if (u.pathname.startsWith("/embed/")) {
            const id = u.pathname.replace("/embed/", "").split("/")[0];
            return id || null;
        }

        return null;
    } catch {
        return null;
    }
}

function isYoutubeShorts(url) {
    if (!url) return false;
    try {
        const u = new URL(url);
        return u.pathname.startsWith("/shorts/");
    } catch {
        return false;
    }
}

function sortByOrderIndex(a, b) {
    return (a?.orderIndex ?? 0) - (b?.orderIndex ?? 0);
}

function normalizeMediaUrl(mediaUrl) {
    return mediaUrl;
}

/* ---------------- UI PARTS ---------------- */

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

function CatSpeechBubble({ text }) {
    if (!text) return null;

    return (
        <div className="relative">
            {/* tail shadow */}
            <div className="absolute left-[34px] -top-[8px] w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-b-[#2F7CC8]/30 border-l-transparent border-r-transparent" />
            {/* tail */}
            <div className="absolute left-[34px] -top-[6px] w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-b-white border-l-transparent border-r-transparent" />

            <div
                className="rounded-[26px] bg-white border-[3px] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
                style={{ borderColor: "#2F7CC8" }}
            >
                <div
                    className="text-[20px] font-extrabold leading-relaxed"
                    style={{ color: COLORS.text.dark }}
                >
                    {text}
                </div>
            </div>
        </div>
    );
}

function LessonCard({ children }) {
    return (
        <div className="relative rounded-[34px] bg-white/92 border border-white/70 shadow-[0_18px_50px_rgba(0,0,0,0.18)] px-6 py-6 overflow-hidden z-10">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute left-[-60px] top-10 w-80 h-48 rounded-full bg-white blur-2xl" />
                <div className="absolute right-[-60px] top-24 w-80 h-52 rounded-full bg-white blur-2xl" />
            </div>

            <div className="relative">{children}</div>
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

/* ---------------- BLOCK RENDER ---------------- */

function BlockRenderer({ block }) {
    const items = useMemo(
        () => (block?.items || []).slice().sort(sortByOrderIndex),
        [block]
    );
    if (!block) return null;

    if (block.type === "TEXT") {
        const textItems = items.filter((x) => x.itemType === "TEXT");
        const title = textItems[0]?.content;
        const rest = textItems.slice(1);

        return (
            <div className="space-y-4">
                {title ? (
                    <div className="text-[26px] font-black" style={{ color: COLORS.brand.titleBlue }}>
                        {title}
                    </div>
                ) : null}

                {rest.map((it) => (
                    <div
                        key={it.id}
                        className="text-[19px] font-semibold leading-relaxed"
                        style={{ color: COLORS.text.dark }}
                    >
                        {it.content}
                    </div>
                ))}
            </div>
        );
    }

    if (block.type === "IMAGE") {
        const imageItem = items.find((x) => x.itemType === "IMAGE");
        const textItems = items.filter((x) => x.itemType === "TEXT");

        const imageUrl = normalizeMediaUrl(imageItem?.mediaUrl);
        const phrase = textItems.map((x) => x.content).join("\n\n");

        return (
            <div className="space-y-5">
                {imageUrl ? (
                    <div className="rounded-[26px] overflow-hidden border border-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.14)] bg-black/5">
                        <img src={imageUrl} alt="lesson" className="w-full h-auto object-cover" />
                    </div>
                ) : null}

                {phrase ? (
                    <div className="relative pt-4">
                        <div className="absolute left-0 -top-1 z-10">
                            <img
                                src={murziya}
                                alt="murziya"
                                className="w-[130px] h-[130px] object-contain drop-shadow-[0_20px_26px_rgba(0,0,0,0.20)]"
                            />
                        </div>

                        <div className="pl-[110px]">
                            <CatSpeechBubble text={phrase} />
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    if (block.type === "VIDEO") {
        const videoItem = items.find((x) => x.itemType === "VIDEO");
        const textItems = items.filter((x) => x.itemType === "TEXT");

        const youtubeId = extractYoutubeId(videoItem?.mediaUrl);
        const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;
        const shorts = isYoutubeShorts(videoItem?.mediaUrl);

        return (
            <div className="space-y-4">
                {embedUrl ? (
                    <div className="rounded-[26px] overflow-hidden bg-black border border-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
                        {shorts ? (
                            <div className="w-full flex justify-center bg-black">
                                <div className="w-[88%] max-w-[330px] aspect-[9/16]">
                                    <iframe
                                        className="w-full h-full"
                                        src={embedUrl}
                                        title="YouTube shorts"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-video">
                                <iframe
                                    className="w-full h-full"
                                    src={embedUrl}
                                    title="YouTube video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-red-600 font-black">VIDEO URL invalid 😿</div>
                )}

                {textItems.map((it) => (
                    <div
                        key={it.id}
                        className="text-[19px] font-semibold leading-relaxed"
                        style={{ color: COLORS.text.dark }}
                    >
                        {it.content}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="text-red-600 font-black">
            Unsupported block type: {String(block.type)}
        </div>
    );
}

/* ---------------- MAIN PAGE ---------------- */

export default function LessonMobile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { lessonId } = useParams();

    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState("");
    const [lesson, setLesson] = useState(null);

    const [step, setStep] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                setErrorText("");
                setLoading(true);

                const data = await getUserLessonById(lessonId);

                const blocksSorted = (data?.blocks || []).slice().sort(sortByOrderIndex);
                const normalized = {
                    ...data,
                    blocks: blocksSorted.map((b) => ({
                        ...b,
                        items: (b.items || []).slice().sort(sortByOrderIndex),
                    })),
                };

                setLesson(normalized);
                setStep(0);
            } catch (e) {
                console.error("Failed to load lesson:", e);
                setErrorText(t("lesson.loadFailed"));
            } finally {
                setLoading(false);
            }
        })();
    }, [lessonId, t]);

    const blocks = lesson?.blocks || [];
    const totalSteps = blocks.length + 2;
    const currentIndexForProgress = Math.min(step + 1, totalSteps);

    const isIntro = step === 0;
    const isFinish = step === blocks.length + 1;
    const currentBlock = !isIntro && !isFinish ? blocks[step - 1] : null;

    const next = () => setStep((s) => Math.min(s + 1, blocks.length + 1));
    const back = () => {
        if (step === 0) navigate(-1);
        else setStep((s) => Math.max(0, s - 1));
    };

    const slideKey = useMemo(() => {
        if (loading) return "loading";
        if (errorText) return "error";
        if (isIntro) return `intro-${lessonId}`;
        if (isFinish) return `finish-${lessonId}`;
        return `block-${lessonId}-${currentBlock?.id ?? step}`;
    }, [loading, errorText, isIntro, isFinish, lessonId, currentBlock, step]);

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
                                onClick={back}
                                className="w-[54px] h-[54px] rounded-[20px] bg-white/90 shadow-[0_10px_25px_rgba(0,0,0,0.18)] font-black"
                                style={{ color: COLORS.brand.titleBlue }}
                            >
                                ←
                            </button>

                            <div className="flex-1">
                                <ProgressBar currentIndex={currentIndexForProgress} total={totalSteps} />
                            </div>
                        </div>
                    </div>
                }
                footer={
                    !loading && !errorText ? (
                        <div className="rounded-[28px] px-3 py-3 bg-white/15 backdrop-blur-md">
                            {isFinish ? (
                                <PrimaryButton
                                    onClick={() => navigate(`/lesson/${lessonId}/test`, { replace: true })}
                                >
                                    {t("lesson.startTest")}
                                </PrimaryButton>
                            ) : (
                                <PrimaryButton onClick={next}>
                                    {t("lesson.next")}
                                </PrimaryButton>
                            )}
                        </div>
                    ) : null
                }
            >
                <AnimatedSlide slideKey={slideKey}>
                    {loading ? (
                        <LessonCard>
                            <div className="text-center font-black text-[22px]" style={{ color: COLORS.brand.titleBlue }}>
                                {t("lesson.loading")}
                            </div>
                        </LessonCard>
                    ) : errorText ? (
                        <LessonCard>
                            <div className="text-center font-black text-[16px] text-red-600">
                                {errorText}
                            </div>
                        </LessonCard>
                    ) : (
                        <>
                            {/* INTRO */}
                            {isIntro ? (
                                <div className="relative">
                                    <div className="flex justify-center mb-[-12px] z-20 relative pointer-events-none">
                                        <img
                                            src={muizzaHello}
                                            alt="muizza hello"
                                            className="w-[230px] h-auto drop-shadow-[0_26px_30px_rgba(0,0,0,0.25)]"
                                        />
                                    </div>

                                    <LessonCard>
                                        <div className="text-[30px] font-black" style={{ color: COLORS.brand.titleBlue }}>
                                            {t("lesson.introTitle", { number: lesson?.orderIndex ?? lessonId })}
                                        </div>

                                        <div className="mt-3 text-[30px] font-black leading-tight" style={{ color: COLORS.brand.titleBlue }}>
                                            {lesson?.title}
                                        </div>

                                        {lesson?.description ? (
                                            <div className="mt-4 text-[20px] font-extrabold leading-relaxed" style={{ color: COLORS.text.dark }}>
                                                {lesson.description}
                                            </div>
                                        ) : null}
                                    </LessonCard>
                                </div>
                            ) : null}

                            {/* BLOCK */}
                            {currentBlock ? (
                                <LessonCard>
                                    <BlockRenderer block={currentBlock} />
                                </LessonCard>
                            ) : null}

                            {/* FINISH */}
                            {isFinish ? (
                                <div className="relative">
                                    <div className="flex justify-center mb-[-12px] z-20 relative pointer-events-none">
                                        <img
                                            src={muizzaLike}
                                            alt="muizza like"
                                            className="w-[230px] h-auto drop-shadow-[0_26px_30px_rgba(0,0,0,0.25)]"
                                        />
                                    </div>

                                    <LessonCard>
                                        <div className="text-[28px] font-black" style={{ color: COLORS.brand.titleBlue }}>
                                            {t("lesson.finishCongrats")}
                                        </div>

                                        <div className="mt-3 text-[20px] font-extrabold" style={{ color: COLORS.text.dark }}>
                                            {t("lesson.finishLessonName")}{" "}
                                            <span className="font-black">{lesson?.title}</span>
                                        </div>
                                    </LessonCard>
                                </div>
                            ) : null}
                        </>
                    )}
                </AnimatedSlide>
            </LessonLayout>
        </div>
    );
}
