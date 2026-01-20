import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import murziya from "../assets/images/murziya.png";
import { getLanguages } from "../api/dictionary/dictionaryApi";
import { changeAppLanguage } from "../i18n/changeAppLanguage";
import {
    getStoredLang,
    isLangSelected,
    setLangSelected,
    setStoredLang,
} from "../utils/langStorage";

import { COLORS } from "../theme/colors";

export default function ChooseLanguage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [langs, setLangs] = useState([]);
    const [loading, setLoading] = useState(false);

    const defaultLang = useMemo(() => getStoredLang() || "RU", []);
    const [selected, setSelected] = useState(defaultLang);

    const didInitRef = useRef(false);

    // ✅ если язык уже выбирали — не показываем
    useEffect(() => {
        if (isLangSelected()) {
            navigate("/register", { replace: true });
        }
    }, [navigate]);

    // ✅ грузим языки
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const data = await getLanguages();
                const list = Array.isArray(data) ? data : [];
                setLangs(list);

                if (!didInitRef.current) {
                    const codes = list.map((x) => x.code);

                    const preferred = codes.includes(defaultLang)
                        ? defaultLang
                        : codes.includes("RU")
                            ? "RU"
                            : codes[0];

                    if (preferred) {
                        setSelected(preferred);
                        await changeAppLanguage(i18n, preferred);
                    }

                    didInitRef.current = true;
                }
            } catch (e) {
                console.error("Failed to load languages", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [defaultLang, i18n]);

    const onSelectLang = async (langCode) => {
        setSelected(langCode);
        await changeAppLanguage(i18n, langCode);
    };

    const onContinue = async () => {
        setStoredLang(selected);
        setLangSelected();

        await changeAppLanguage(i18n, selected);
        navigate("/login", { replace: true });
    };

    return (
        <div
            className="w-full overflow-x-hidden min-h-[100dvh]"
            style={{
                background: `linear-gradient(to bottom, ${COLORS.bg.orangeTop}, ${COLORS.bg.orangeMid}, ${COLORS.bg.orangeBottom})`,
            }}
        >
            <div className="max-w-[420px] mx-auto w-full min-h-[100dvh] px-4 pt-8 pb-10">
                {/* ✅ LOGO */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center justify-center px-7 py-3 rounded-[30px] bg-white/85 shadow-[0_18px_45px_rgba(0,0,0,0.18)] border border-white/70">
                        <div
                            className="text-[62px] leading-none font-black tracking-wide"
                            style={{
                                color: COLORS.brand.logoBlue,
                                textShadow:
                                    "0 6px 0 rgba(255,255,255,0.90), 0 18px 45px rgba(0,0,0,0.18)",
                            }}
                        >
                            {t("app.name")}
                        </div>
                    </div>
                </div>

                {/* CAT + bubble */}
                <div className="relative mt-6 flex items-start gap-3 w-full">
                    <img
                        src={murziya}
                        alt="Murziya"
                        className="w-[135px] h-[135px] object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)] shrink-0"
                    />

                    <div className="relative flex-1 pt-3 min-w-0">
                        <div className="relative w-full">
                            {/* Tail border */}
                            <div
                                className={[
                                    "absolute left-[-14px] top-[34px]",
                                    "w-0 h-0",
                                    "border-y-[14px] border-y-transparent",
                                    "border-r-[16px]",
                                    "opacity-90",
                                ].join(" ")}
                                style={{ borderRightColor: "rgba(255,255,255,0.7)" }}
                            />

                            {/* Tail body */}
                            <div
                                className={[
                                    "absolute left-[-12px] top-[36px]",
                                    "w-0 h-0",
                                    "border-y-[12px] border-y-transparent",
                                    "border-r-[14px]",
                                    "drop-shadow-[0_6px_10px_rgba(0,0,0,0.12)]",
                                ].join(" ")}
                                style={{ borderRightColor: "rgba(255,255,255,0.95)" }}
                            />

                            <div
                                className="relative border-2 rounded-[22px] px-5 py-3 shadow-[0_14px_30px_rgba(0,0,0,0.18)] overflow-hidden"
                                style={{
                                    background: "rgba(255,255,255,0.95)",
                                    borderColor: "rgba(255,255,255,0.7)",
                                }}
                            >
                                <div
                                    className="text-left font-black text-[18px] leading-tight break-words"
                                    style={{ color: COLORS.brand.titleBlue }}
                                >
                                    {t("chooseLanguage.bubbleTitle")}
                                </div>

                                <div
                                    className="mt-1 text-left font-extrabold text-[15px] break-words"
                                    style={{ color: COLORS.brand.brown }}
                                >
                                    {t("chooseLanguage.bubbleName")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="mt-6 flex justify-center w-full">
                    <div className="max-w-full rounded-[28px] bg-white/90 px-8 py-3 shadow-[0_16px_38px_rgba(0,0,0,0.18)] border border-white/70">
                        <div
                            className="text-[34px] font-black leading-none text-center break-words"
                            style={{ color: COLORS.brand.titleBlue2 }}
                        >
                            {t("chooseLanguage.title")}
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                    {(langs || []).map((l) => {
                        const active = l.code === selected;

                        return (
                            <button
                                key={l.code}
                                type="button"
                                disabled={loading}
                                onClick={() => onSelectLang(l.code)}
                                className={[
                                    "h-[92px] w-full rounded-[22px] border-4",
                                    "shadow-[0_14px_0_rgba(0,0,0,0.18)]",
                                    "flex items-center justify-center",
                                    "text-[28px] font-black",
                                    "bg-white/90",
                                    active ? "scale-[1.02]" : "scale-100",
                                    "transition-transform duration-150",
                                    loading ? "opacity-70" : "",
                                ].join(" ")}
                                style={{
                                    borderColor: active
                                        ? COLORS.brand.greenActive
                                        : "rgba(255,255,255,0.7)",
                                }}
                            >
                                {l.label}
                            </button>
                        );
                    })}
                </div>

                {/* Continue */}
                <div className="mt-8 w-full">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={onContinue}
                        disabled={loading || !selected}
                        className="w-full h-[74px] rounded-[30px] text-white text-[34px] font-black disabled:opacity-70"
                        style={{
                            background: `linear-gradient(to bottom, ${COLORS.auth.buttonGreenTop}, ${COLORS.auth.buttonGreenBottom})`,
                            boxShadow: `0 12px 0 ${COLORS.auth.buttonShadowGreen}, 0 26px 60px rgba(0,0,0,0.22)`,
                        }}
                    >
                        {t("chooseLanguage.continue")}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
