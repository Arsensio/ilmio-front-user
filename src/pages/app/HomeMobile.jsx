import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import murziya from "../../assets/images/murziya.png";
import { getUserLessons } from "../../api/user/lessonsApi";
import { COLORS } from "../../theme/colors";
import { getLessonCardUi } from "./homeLessonUi";

/* ---------------- ICONS ---------------- */

const HeartIcon = () => (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
        <path
            d="M24 42s-14-8.8-18.6-18.1C2.4 17.9 5.3 10 13 10c4.5 0 7.3 2.7 11 7 3.7-4.3 6.5-7 11-7 7.7 0 10.6 7.9 7.6 13.9C38 33.2 24 42 24 42z"
            fill="white"
            opacity="0.95"
        />
        <circle cx="18" cy="22" r="2.5" fill="#79D82E" opacity="0.9" />
        <circle cx="30" cy="22" r="2.5" fill="#79D82E" opacity="0.9" />
        <path
            d="M18 28c1.8 1.4 3.8 2.1 6 2.1s4.2-.7 6-2.1"
            stroke="#79D82E"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.9"
        />
    </svg>
);

const ShieldIcon = () => (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
        <path
            d="M24 6c6 4 12 4 16 6v13c0 10-7 16-16 19C15 41 8 35 8 25V12c4-2 10-2 16-6z"
            fill="white"
            opacity="0.95"
        />
        <path
            d="M18.5 24.5l4 4 8-10"
            stroke="#2F7CC8"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
        />
    </svg>
);

const LockIcon = ({ size = 30, stroke = "white" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
            d="M7 10V8.5C7 6 9 4 11.5 4h1C15 4 17 6 17 8.5V10"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.92"
        />
        <path
            d="M6.5 10h11c1 0 1.8.8 1.8 1.8v6.7c0 1-.8 1.8-1.8 1.8h-11c-1 0-1.8-.8-1.8-1.8v-6.7c0-1 .8-1.8 1.8-1.8Z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.92"
        />
    </svg>
);

const ArrowCircle = ({ locked }) => (
    <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-white/90">
        {locked ? (
            <LockIcon size={22} stroke={COLORS.lockStroke} />
        ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                    d="M10 7l5 5-5 5"
                    stroke={COLORS.black}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.75"
                />
            </svg>
        )}
    </div>
);

function getLessonIcon(category) {
    if (category === "HARD_SKILL") return <ShieldIcon />;
    if (category === "SOFT_SKILL") return <HeartIcon />;
    return <HeartIcon />;
}

/* ---------------- PAGE ---------------- */

export default function HomeMobile() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    const activeLessonRef = useRef(null);
    const didScrollRef = useRef(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const data = await getUserLessons();
                const list = Array.isArray(data) ? data : [];
                list.sort((a, b) => (a?.orderIndex ?? 0) - (b?.orderIndex ?? 0));

                console.log("Try to get lessons");
                setLessons(list);
            } catch (e) {
                console.error("Failed to load lessons", e);
                setLessons([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // ✅ автоскролл к ACTIVE (в центр)
    useEffect(() => {
        if (loading) return;
        if (didScrollRef.current) return;

        const hasActive = lessons.some((l) => l.lessonStatus === "ACTIVE");
        if (!hasActive) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (activeLessonRef.current) {
                    activeLessonRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest",
                    });
                    didScrollRef.current = true;
                }
            });
        });
    }, [loading, lessons]);

    return (
        <div
            className="min-h-screen w-full"
            style={{
                background: `linear-gradient(to bottom, ${COLORS.bg.orangeTop}, ${COLORS.bg.orangeMid}, ${COLORS.bg.orangeBottom})`,
            }}
        >
            <div className="max-w-[420px] mx-auto min-h-screen px-4 pt-6 pb-32 relative">
                {/* CAT */}
                <div className="mt-2 relative flex justify-center">
                    <img
                        src={murziya}
                        alt="Murziya"
                        className="w-[170px] h-[170px] object-contain"
                        style={{
                            WebkitMaskImage:
                                "radial-gradient(circle, black 60%, transparent 72%)",
                            maskImage: "radial-gradient(circle, black 60%, transparent 72%)",
                        }}
                    />
                </div>

                {/* LESSONS */}
                <div className="mt-4 space-y-5">
                    {loading ? (
                        <div className="rounded-[28px] bg-white/80 border border-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-6">
                            <div className="text-center font-black text-[#2F7CC8] text-[22px]">
                                {t("home.loading")}
                            </div>
                        </div>
                    ) : lessons.length === 0 ? (
                        <div className="rounded-[28px] bg-white/80 border border-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-6">
                            <div className="text-center font-black text-[#2F7CC8] text-[22px]">
                                {t("home.empty")}
                            </div>
                        </div>
                    ) : (
                        lessons.map((lesson) => {
                            const ui = getLessonCardUi(lesson.lessonStatus);

                            const locked = lesson.lessonStatus === "LOCKED";
                            const isActive = lesson.lessonStatus === "ACTIVE";

                            return (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    disabled={locked}
                                    ref={isActive ? activeLessonRef : null}
                                    className={[
                                        "w-full",
                                        "rounded-[30px]",
                                        ui.shadowClass,
                                        "px-5 py-5",
                                        "text-left",
                                        "relative",
                                        locked ? "opacity-75 grayscale cursor-not-allowed" : "",
                                        "transition-transform duration-150 active:scale-[0.99]",
                                    ].join(" ")}
                                    style={ui.wrapStyle}
                                    onClick={() => {
                                        if (locked) return;

                                        // ✅ переход на страницу урока
                                        navigate(`/lesson/${lesson.id}`);
                                    }}
                                >
                                    {/* icon left */}
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                        {locked ? (
                                            <LockIcon size={36} stroke="white" />
                                        ) : (
                                            getLessonIcon(lesson.category)
                                        )}
                                    </div>

                                    {/* content */}
                                    <div className="pl-[70px] pr-[60px]">
                                        <div className="text-white/95 font-semibold text-[18px]">
                                            {t("home.lessonLabel", { number: lesson.orderIndex })}
                                        </div>

                                        <div className="text-white font-black text-[28px] leading-tight">
                                            {lesson.title}
                                        </div>

                                        {lesson.description ? (
                                            <div className="mt-1 text-white/90 text-[14px] font-semibold line-clamp-2">
                                                {lesson.description}
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* arrow/lock */}
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                        <ArrowCircle locked={locked} />
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
