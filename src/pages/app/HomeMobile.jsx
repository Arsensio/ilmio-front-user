import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import murziya from "../../assets/images/murziya.png";
import { getUserLessons } from "../../api/user/lessonsApi";

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

const LockIcon = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path
            d="M7 10V8.5C7 6 9 4 11.5 4h1C15 4 17 6 17 8.5V10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.92"
        />
        <path
            d="M6.5 10h11c1 0 1.8.8 1.8 1.8v6.7c0 1-.8 1.8-1.8 1.8h-11c-1 0-1.8-.8-1.8-1.8v-6.7c0-1 .8-1.8 1.8-1.8Z"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.92"
        />
    </svg>
);

const ArrowCircle = ({ locked }) => (
    <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-white/90">
        {locked ? (
            <LockIcon />
        ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                    d="M10 7l5 5-5 5"
                    stroke="#1A1A1A"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.75"
                />
            </svg>
        )}
    </div>
);

function getCardStyle(lessonStatus) {
    if (lessonStatus === "ACTIVE") {
        return {
            wrap: "bg-gradient-to-b from-[#7FE02E] to-[#4EA61D]",
            shadow:
                "shadow-[0_18px_0_rgba(0,0,0,0.18),0_40px_70px_rgba(0,0,0,0.18)]",
        };
    }

    // LOCKED
    return {
        wrap: "bg-gradient-to-b from-[#52B9F4] to-[#2E89C8]",
        shadow:
            "shadow-[0_18px_0_rgba(0,0,0,0.18),0_40px_70px_rgba(0,0,0,0.18)]",
    };
}

export default function HomeMobile() {
    const { t } = useTranslation();

    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getUserLessons();
                const list = Array.isArray(data) ? data : [];
                list.sort((a, b) => (a?.orderIndex ?? 0) - (b?.orderIndex ?? 0));
                setLessons(list);
            } catch (e) {
                console.error("Failed to load lessons", e);
                setLessons([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const activeIndex = useMemo(() => {
        const idx = lessons.findIndex((l) => l.lessonStatus === "ACTIVE");
        return idx >= 0 ? idx + 1 : 1;
    }, [lessons]);

    const total = lessons.length || 0;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#F7B338] via-[#F0A23B] to-[#E38D2F]">
            {/* ⚠️ pb-32 важно чтобы список не залез под bottom menu */}
            <div className="max-w-[420px] mx-auto min-h-screen px-4 pt-6 pb-32 relative">
                {/* CAT */}
                <div className="mt-2 relative flex justify-center">
                    <img
                        src={murziya}
                        alt="Murziya"
                        className="w-[170px] h-[170px] object-contain drop-shadow-[0_28px_34px_rgba(0,0,0,0.25)]"
                    />
                </div>

                {/* LESSONS */}
                <div className="mt-4 space-y-5">
                    {loading ? (
                        <div className="rounded-[28px] bg-white/80 border border-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-6">
                            <div className="text-center font-black text-[#2F7CC8] text-[22px]">
                                Loading...
                            </div>
                        </div>
                    ) : lessons.length === 0 ? (
                        <div className="rounded-[28px] bg-white/80 border border-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-6">
                            <div className="text-center font-black text-[#2F7CC8] text-[22px]">
                                No lessons
                            </div>
                        </div>
                    ) : (
                        lessons.map((lesson) => {
                            const ui = getCardStyle(lesson.lessonStatus);
                            const locked = lesson.lessonStatus !== "ACTIVE";
                            const isFirst = (lesson.orderIndex ?? 1) === 1;

                            return (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    disabled={locked}
                                    className={[
                                        "w-full",
                                        "rounded-[30px]",
                                        ui.wrap,
                                        ui.shadow,
                                        "px-5 py-5",
                                        "text-left",
                                        "relative",
                                        "disabled:opacity-80 disabled:cursor-not-allowed",
                                        "transition-transform duration-150 active:scale-[0.99]",
                                    ].join(" ")}
                                    onClick={() => console.log("Open lesson", lesson.id)}
                                >
                                    {/* icon */}
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                        {isFirst ? <HeartIcon /> : <ShieldIcon />}
                                    </div>

                                    {/* content */}
                                    <div className="pl-[70px] pr-[60px]">
                                        <div className="text-white/95 font-semibold text-[18px]">
                                            Урок {lesson.orderIndex}
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
