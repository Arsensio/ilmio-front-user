import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { verifyOtp, getVerifyStatus } from "../api/auth/registerApi";
import { setStoredToken } from "../utils/tokenStorage";
import {
    clearVerifyEmail,
    clearVerifyUuid,
    getVerifyEmail,
    getVerifyUuid,
    setVerifyEmail,
    setVerifyUuid,
} from "../utils/verifyStorage";

import { COLORS } from "../theme/colors";

export default function VerifyOtpMobile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ uuid может прилететь через navigate state ИЛИ лежать в sessionStorage
    const uuidFromState = location.state?.uuid;
    const uuidStored = getVerifyUuid();
    const uuid = uuidFromState || uuidStored;

    const emailFromState = location.state?.email;
    const emailStored = getVerifyEmail();
    const email = emailFromState || emailStored;

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [secondsLeft, setSecondsLeft] = useState(0);
    const [loadingTimer, setLoadingTimer] = useState(true);

    const timerRef = useRef(null);

    // ✅ 1) если зашёл без uuid — назад
    useEffect(() => {
        if (!uuid) {
            navigate("/register", { replace: true });
            return;
        }

        // ✅ сохраняем uuid/email чтобы при refresh не терялось
        setVerifyUuid(uuid);
        if (email) setVerifyEmail(email);
    }, [uuid, email, navigate]);

    // ✅ 2) при входе на verify обязательно берём secondsLeft с сервера
    useEffect(() => {
        if (!uuid) return;

        (async () => {
            try {
                setError("");
                setLoadingTimer(true);

                const data = await getVerifyStatus(uuid); // { uuid, secondsLeft }

                // сервер может вернуть uuid обратно - сохраним его
                if (data?.uuid) setVerifyUuid(data.uuid);

                setSecondsLeft(Number(data?.secondsLeft ?? 0));
            } catch (e) {
                console.error("Failed to load verify status", e);
                setError(t("verify.validation.verifyFailed"));
            } finally {
                setLoadingTimer(false);
            }
        })();
    }, [uuid, t]);

    // ✅ 3) timer interval
    useEffect(() => {
        if (!uuid) return;
        if (loadingTimer) return;

        if (secondsLeft <= 0) return;

        // ✅ если таймер уже запущен — НЕ трогаем
        if (timerRef.current) return;

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [uuid, loadingTimer, secondsLeft]);

    const mmss = useMemo(() => {
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    }, [secondsLeft]);

    const onVerify = async () => {
        setError("");

        const clean = otp.trim();

        if (!clean) {
            setError(t("verify.validation.otpRequired"));
            return;
        }
        if (!/^\d{4,8}$/.test(clean)) {
            setError(t("verify.validation.otpInvalid"));
            return;
        }
        if (secondsLeft <= 0) {
            setError(t("verify.validation.expired"));
            return;
        }

        try {
            setLoading(true);

            const data = await verifyOtp({
                uuid,
                otp: clean,
            });

            // ✅ token store
            setStoredToken(data.token);

            // ✅ удалить uuid/email из sessionStorage после успешного OTP
            clearVerifyUuid();
            clearVerifyEmail();

            // ✅ clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // ✅ IMPORTANT: после успеха ведём в приложение
            navigate("/app/home", { replace: true });
        } catch (e) {
            console.error("Verify error", e);
            setError(t("verify.validation.verifyFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full"
            style={{
                background: `linear-gradient(to bottom, ${COLORS.bg.orangeTop}, ${COLORS.bg.orangeMid}, ${COLORS.bg.orangeBottom})`,
            }}
        >
            <div className="max-w-[420px] mx-auto min-h-screen px-4 pt-8 pb-10">
                {/* ✅ LOGO */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center justify-center px-7 py-3 rounded-[30px] bg-white/85 shadow-[0_18px_45px_rgba(0,0,0,0.18)] border border-white/70">
                        <div
                            className="text-[68px] leading-none font-black tracking-wide"
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

                {/* ✅ CARD */}
                <div className="mt-6 rounded-[28px] bg-white/90 px-6 py-4 pb-8 shadow-[0_16px_38px_rgba(0,0,0,0.18)] border border-white/70">
                    <div
                        className="text-center font-black text-[28px]"
                        style={{ color: COLORS.brand.titleBlue2 }}
                    >
                        {t("verify.title")}
                    </div>

                    {email ? (
                        <div
                            className="mt-2 text-center font-bold text-[14px]"
                            style={{ color: COLORS.brand.brown }}
                        >
                            {t("verify.sentTo")} {email}
                        </div>
                    ) : null}

                    <div
                        className="mt-4 text-center font-black text-[16px]"
                        style={{ color: COLORS.brand.titleBlue }}
                    >
                        {t("verify.timer")} {loadingTimer ? t("auth.loadingDots") : mmss}
                    </div>

                    <div className="mt-6">
                        <div
                            className="text-[20px] font-black"
                            style={{ color: COLORS.text?.dark ?? "#2F2F2F" }}
                        >
                            {t("verify.otpLabel")}
                        </div>

                        <div
                            className="mt-2 h-[54px] rounded-[18px] flex items-center px-4 shadow-[inset_0_4px_14px_rgba(0,0,0,0.16)]"
                            style={{ background: COLORS.brand.inputBg }}
                        >
                            <input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ""))}
                                inputMode="numeric"
                                placeholder={t("verify.otpPlaceholder")}
                                className="w-full bg-transparent outline-none text-[22px] tracking-[0.3em] font-extrabold"
                                style={{
                                    color: COLORS.brand.inputText,
                                }}
                            />
                        </div>

                        {error ? (
                            <div className="mt-2 text-[15px] font-black text-red-600">
                                {error}
                            </div>
                        ) : null}
                    </div>

                    {/* ✅ BUTTON */}
                    <div className="mt-8">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={loading || loadingTimer}
                            onClick={onVerify}
                            className="w-full h-[64px] rounded-[28px] text-white text-[26px] font-black disabled:opacity-70"
                            style={{
                                background: `linear-gradient(to bottom, ${COLORS.auth.buttonGreenTop}, ${COLORS.auth.buttonGreenBottom})`,
                                boxShadow: `0 12px 0 ${COLORS.auth.buttonShadowGreen}, 0 26px 60px rgba(0,0,0,0.20)`,
                            }}
                        >
                            {loading ? t("verify.checking") : t("verify.confirm")}
                        </motion.button>
                    </div>

                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
}
