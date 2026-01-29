import React, { useMemo } from "react";
import { COLORS } from "../../theme/colors";

import murziya from "../../assets/images/muizza_sit.png";

/* ---------------- HELPERS ---------------- */

function sortByOrderIndex(a, b) {
    return (a?.orderIndex ?? 0) - (b?.orderIndex ?? 0);
}

function extractYoutubeId(url) {
    if (!url) return null;

    try {
        const u = new URL(url);

        const v = u.searchParams.get("v");
        if (v) return v;

        if (u.hostname.includes("youtu.be")) {
            return u.pathname.split("/").filter(Boolean)[0] || null;
        }

        if (u.pathname.startsWith("/shorts/")) {
            return u.pathname.replace("/shorts/", "").split("/")[0] || null;
        }

        if (u.pathname.startsWith("/embed/")) {
            return u.pathname.replace("/embed/", "").split("/")[0] || null;
        }

        return null;
    } catch {
        return null;
    }
}

function isYoutubeShorts(url) {
    try {
        return new URL(url).pathname.startsWith("/shorts/");
    } catch {
        return false;
    }
}

/* ---------------- UI ---------------- */

function CatSpeechBubble({ text }) {
    if (!text) return null;

    return (
        <div className="relative">
            <div className="absolute left-[34px] -top-[8px] w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-b-[#2F7CC8]/30 border-l-transparent border-r-transparent" />
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

/* ---------------- MAIN ---------------- */

export default function BlockRenderer({ block }) {
    const items = useMemo(
        () => (block?.items || []).slice().sort(sortByOrderIndex),
        [block]
    );

    if (!block) return null;

    /* ---------- TEXT BLOCK ---------- */
    if (block.type === "TEXT") {
        const textItems = items.filter((x) => x.itemType === "TEXT");
        const title = textItems[0]?.content;
        const rest = textItems.slice(1);

        return (
            <div className="space-y-4">
                {title && (
                    <div
                        className="text-[26px] font-black"
                        style={{ color: COLORS.brand.titleBlue }}
                    >
                        {title}
                    </div>
                )}

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

    /* ---------- IMAGE BLOCK ---------- */
    if (block.type === "IMAGE") {
        const imageItem = items.find((x) => x.itemType === "IMAGE");
        const textItems = items.filter((x) => x.itemType === "TEXT");

        const phrase = textItems.map((x) => x.content).join("\n\n");

        return (
            <div className="space-y-5">
                {imageItem?.mediaUrl && (
                    <div className="rounded-[26px] overflow-hidden border border-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.14)] bg-black/5">
                        <img
                            src={imageItem.mediaUrl}
                            alt="lesson"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                {phrase && (
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
                )}
            </div>
        );
    }

    /* ---------- VIDEO BLOCK ---------- */
    if (block.type === "VIDEO") {
        const videoItem = items.find((x) => x.itemType === "VIDEO");
        const textItems = items.filter((x) => x.itemType === "TEXT");

        const youtubeId = extractYoutubeId(videoItem?.mediaUrl);
        const embedUrl = youtubeId
            ? `https://www.youtube.com/embed/${youtubeId}`
            : null;

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
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-red-600 font-black">
                        VIDEO URL invalid 😿
                    </div>
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
            Unsupported block type: {block.type}
        </div>
    );
}
