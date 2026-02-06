import React, {useEffect, useMemo, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";

import {getUserLessons} from "../../api/user/lessonsApi";
import murziya from "../../assets/images/murziya.png";
import {COLORS} from "../../theme/colors";

/* ================= CONFIG ================= */
const STEP_GAP = 130;
const CENTER_X = 150;
const START_Y = 80;

/* ================= ICONS ================= */
const PlayIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M8 5v14l11-7z"/>
    </svg>
);

const CheckIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const LockIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
            d="M7 10V8.5C7 6 9 4 11.5 4h1C15 4 17 6 17 8.5V10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
            stroke="white"
            strokeWidth="2"
        />
    </svg>
);

/* ================= STYLES ================= */
function lessonStyle(status) {
    if (status === "ACTIVE") {
        return {
            bg: "bg-gradient-to-b from-green-300 to-green-600",
            glow: "shadow-[0_0_35px_rgba(34,197,94,0.9)] ring-4 ring-green-200",
        };
    }

    if (status === "COMPLETED") {
        return {
            bg: "bg-gradient-to-b from-yellow-200 to-yellow-400",
            glow: "shadow-[0_18px_36px_rgba(234,179,8,0.6)]",
        };
    }

    return {
        bg: "bg-gradient-to-b from-gray-200 to-gray-300",
        glow: "opacity-95",
    };
}

/* ================= POSITION ENGINE ================= */
function getNodePosition(index, type) {
    const y = START_Y + index * STEP_GAP;

    if (type === "THEME") {
        return {x: CENTER_X, y};
    }

    const offset = index % 2 === 0 ? 70 : -70;
    return {x: CENTER_X + offset, y};
}

/* ================= PATH ================= */
function WavyPath({nodes}) {
    if (nodes.length < 2) return null;

    const points = nodes.map((n, i) =>
        getNodePosition(i, n.type)
    );

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midY = (prev.y + curr.y) / 2;

        d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }

    return (
        <svg
            className="absolute left-1/2 -translate-x-1/2 top-0"
            width="300"
            height={points[points.length - 1].y + 200}
        >
            <path
                d={d}
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="22"
                strokeLinecap="round"
            />

            <motion.path
                d={d}
                fill="none"
                stroke="url(#grad)"
                strokeWidth="16"
                strokeLinecap="round"
                initial={{pathLength: 0}}
                animate={{pathLength: 1}}
                transition={{duration: 1.4, ease: "easeInOut"}}
            />

            <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FACC15"/>
                    <stop offset="50%" stopColor="#22C55E"/>
                    <stop offset="100%" stopColor="#60A5FA"/>
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ================= NODE ================= */
function Node({ node, index, navigate, activeRef }) {
    const { x, y } = getNodePosition(index, node.type);
    const finalY =
        node.type === "LESSON" ? y - 50 : y - 15;

    if (node.type === "THEME") {
        return (
            <div
                className="absolute left-1/2"
                style={{ top: finalY, transform: "translateX(-50%)" }}
            >
                <div className="px-8 py-3 rounded-full text-white font-black bg-orange-400 shadow-lg">
                    {node.orderIndex} {node.title}
                </div>
            </div>
        );
    }

    const style = lessonStyle(node.status);

    return (
        <div
            ref={node.status === "ACTIVE" ? activeRef : null}
            className="absolute left-1/2"
            style={{
                top: finalY,
                transform: `translateX(${x - CENTER_X}px) translateX(-50%)`,
            }}
        >
            {/* КНОПКА — ЯКОРЬ */}
            <div className="relative w-[86px] h-[86px] flex items-center justify-center">
                <button
                    disabled={node.status === "LOCKED"}
                    onClick={() => navigate(`/lesson/${node.id}`)}
                    className={`w-[86px] h-[86px] rounded-full flex items-center justify-center
                        ${style.bg} ${style.glow}`}
                >
                    {node.status === "ACTIVE" && <PlayIcon />}
                    {node.status === "COMPLETED" && <CheckIcon />}
                    {node.status === "LOCKED" && <LockIcon />}
                </button>

                {/* ТЕКСТ — НЕ ВЛИЯЕТ НА ЦЕНТР */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2
                                text-white font-bold text-sm text-center w-[120px] line-clamp-2">
                    {node.orderIndex} {node.title}
                </div>
            </div>
        </div>
    );
}

function ScreenGlares() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {/* Блик 1 */}
            <motion.div
                className="absolute w-[300px] h-[300px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)",
                    top: "10%",
                    left: "-10%",
                }}
                animate={{
                    opacity: [0.15, 0.35, 0.15],
                    x: [0, 40, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Блик 2 */}
            <motion.div
                className="absolute w-[220px] h-[220px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
                    bottom: "20%",
                    right: "-5%",
                }}
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5,
                }}
            />

            {/* Блик 3 — мягкий */}
            <motion.div
                className="absolute w-[180px] h-[180px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
                    top: "45%",
                    left: "60%",
                }}
                animate={{
                    opacity: [0.1, 0.25, 0.1],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}



/* ================= PAGE ================= */
export default function HomeMobile() {
    const navigate = useNavigate();
    const activeRef = useRef(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        getUserLessons().then(setData);
    }, []);

    const nodes = useMemo(() => {
        const res = [];

        data.forEach(({theme, lessons}) => {
            res.push({type: "THEME", id: theme.id, orderIndex: theme.orderIndex, title: theme.title});

            lessons.forEach((l) =>
                res.push({
                    type: "LESSON",
                    id: l.id,
                    title: l.title,          // 👈 ВОТ ЭТО
                    orderIndex: l.orderIndex,
                    status: l.lessonStatus,
                })
            );
        });

        return res;
    }, [data]);

    const activeIndex = useMemo(() => {
        return nodes.findIndex(
            (n) => n.type === "LESSON" && n.status === "ACTIVE"
        );
    }, [nodes]);

    useEffect(() => {
        if (activeIndex === -1) return;

        const timer = setTimeout(() => {
            if (!activeRef.current) return;

            window.scrollTo({
                top: activeRef.current.offsetTop - 180, // 👈 смещение от верха
                behavior: "smooth",
            });
        }, 200);

        return () => clearTimeout(timer);
    }, [activeIndex]);

    return (
        <div
            className="relative"
            style={{
                background: `linear-gradient(${COLORS.bg.orangeTop}, ${COLORS.bg.orangeBottom})`,
            }}
        >
            <ScreenGlares/>
            <div
                className="max-w-[420px] mx-auto px-4 pt-6 relative"
                style={{
                    minHeight: "100vh",
                    paddingBottom: nodes.length * STEP_GAP + 120, // запас под таббар
                }}
            >
                <img
                    src={murziya}
                    alt="cat"
                    className="absolute left-4 top-4 w-[140px]"
                />

                <div className="relative mt-40">
                    <WavyPath nodes={nodes} />

                    {nodes.map((node, i) => (
                        <Node
                            key={`${node.type}-${node.id}`}
                            node={node}
                            index={i}
                            navigate={navigate}
                            activeRef={activeRef}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
