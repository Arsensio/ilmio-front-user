import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import murziya from "../assets/images/murziya.png";
import { containsAccountField } from "../api/auth/accountApi";
import { registerUser } from "../api/auth/registerApi";
import { getStoredLang } from "../utils/langStorage";

const PawIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
            d="M8.2 11.8c.8 0 1.5-.9 1.5-2s-.7-2-1.5-2-1.5.9-1.5 2 .7 2 1.5 2Zm7.6 0c.8 0 1.5-.9 1.5-2s-.7-2-1.5-2-1.5.9-1.5 2 .7 2 1.5 2ZM12 11.5c.8 0 1.4-1 1.4-2.1 0-1.2-.6-2.1-1.4-2.1s-1.4 1-1.4 2.1c0 1.2.6 2.1 1.4 2.1Zm0 8.4c-2.4 0-6-1.1-6-3.5 0-1.6 1.6-2.6 3.2-2.6 1.1 0 1.9.5 2.8.5s1.7-.5 2.8-.5c1.6 0 3.2 1 3.2 2.6 0 2.4-3.6 3.5-6 3.5Z"
            fill="#FFE39B"
            opacity="0.95"
        />
    </svg>
);

const InputField = ({
                        label,
                        placeholder,
                        type = "text",
                        value,
                        onChange,
                        onBlur,
                    }) => (
    <div className="space-y-2">
        <div className="text-[22px] font-black text-[#2F2F2F]">{label}</div>

        <div className="h-[54px] rounded-[18px] bg-[#E6D5B0] flex items-center gap-3 px-4 shadow-[inset_0_4px_14px_rgba(0,0,0,0.16)]">
            <input
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className="w-full bg-transparent outline-none text-[18px] font-semibold text-[#4A3A13] placeholder:text-[#8A7A55]"
            />
        </div>
    </div>
);

// ✅ Username: только латиница/цифры/_
const LATIN_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,32}$/;

// ✅ Email: формат + только латиница
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ONLY_LATIN_REGEX = /^[\x00-\x7F]+$/;

export default function RegisterMobile() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // form
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [birthDate, setBirthDate] = useState("");

    // availability checks
    const [nickCheck, setNickCheck] = useState({ status: "idle", message: "" });
    const [emailCheck, setEmailCheck] = useState({ status: "idle", message: "" });

    const nickAbortRef = useRef(null);
    const emailAbortRef = useRef(null);

    const nickTimerRef = useRef(null);
    const emailTimerRef = useRef(null);

    // submit
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ---------------------------
    // REMOTE VALIDATION
    // ---------------------------

    const validateNicknameRemote = async (value) => {
        const nick = value.trim();
        setFormError("");

        if (!nick) {
            setNickCheck({ status: "idle", message: "" });
            return;
        }

        // ✅ локальная валидация никнейма (латиница)
        if (!LATIN_USERNAME_REGEX.test(nick)) {
            setNickCheck({
                status: "error",
                message: t("register.validation.usernameLatin"),
            });
            return;
        }

        if (nickAbortRef.current) nickAbortRef.current.abort();
        const controller = new AbortController();
        nickAbortRef.current = controller;

        try {
            setNickCheck({
                status: "checking",
                message: t("register.validation.checking"),
            });

            const exists = await containsAccountField({
                accountField: "USERNAME",
                account: nick,
                signal: controller.signal,
            });

            if (exists === true) {
                setNickCheck({
                    status: "taken",
                    message: t("register.validation.nicknameTaken"),
                });
            } else {
                setNickCheck({
                    status: "ok",
                    message: t("register.validation.nicknameFree"),
                });
            }
        } catch (e) {
            if (e?.name === "AbortError" || e?.name === "CanceledError") return;

            console.error("Nickname contains error", e);
            setNickCheck({
                status: "error",
                message: t("register.validation.checkError"),
            });
        }
    };

    const validateEmailRemote = async (value) => {
        const em = value.trim();
        setFormError("");

        if (!em) {
            setEmailCheck({ status: "idle", message: "" });
            return;
        }

        // ✅ локальная валидация email
        if (!EMAIL_REGEX.test(em)) {
            setEmailCheck({
                status: "error",
                message: t("register.validation.emailInvalid"),
            });
            return;
        }
        if (!ONLY_LATIN_REGEX.test(em)) {
            setEmailCheck({
                status: "error",
                message: t("register.validation.emailLatin"),
            });
            return;
        }

        if (emailAbortRef.current) emailAbortRef.current.abort();
        const controller = new AbortController();
        emailAbortRef.current = controller;

        try {
            setEmailCheck({
                status: "checking",
                message: t("register.validation.checking"),
            });

            const exists = await containsAccountField({
                accountField: "EMAIL",
                account: em,
                signal: controller.signal,
            });

            if (exists === true) {
                setEmailCheck({
                    status: "taken",
                    message: t("register.validation.emailTaken"),
                });
            } else {
                setEmailCheck({
                    status: "ok",
                    message: t("register.validation.emailFree"),
                });
            }
        } catch (e) {
            if (e?.name === "AbortError" || e?.name === "CanceledError") return;

            console.error("Email contains error", e);
            setEmailCheck({
                status: "error",
                message: t("register.validation.checkError"),
            });
        }
    };

    const debounceNickCheck = (value) => {
        if (nickTimerRef.current) clearTimeout(nickTimerRef.current);
        nickTimerRef.current = setTimeout(() => validateNicknameRemote(value), 450);
    };

    const debounceEmailCheck = (value) => {
        if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
        emailTimerRef.current = setTimeout(() => validateEmailRemote(value), 450);
    };

    useEffect(() => {
        return () => {
            if (nickTimerRef.current) clearTimeout(nickTimerRef.current);
            if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
            if (nickAbortRef.current) nickAbortRef.current.abort();
            if (emailAbortRef.current) emailAbortRef.current.abort();
        };
    }, []);

    const statusColor = (status) => {
        if (status === "ok") return "text-green-600";
        if (status === "taken") return "text-red-600";
        if (status === "checking") return "text-[#2E88C7]";
        if (status === "error") return "text-red-600";
        return "text-transparent";
    };

    // ---------------------------
    // LOCAL FULL VALIDATION
    // ---------------------------
    const validateFormLocal = () => {
        setFormError("");

        const nick = nickname.trim();
        const em = email.trim();
        const pass = password.trim();
        const bd = birthDate.trim();

        if (!nick || !em || !pass || !bd) {
            setFormError(t("register.validation.requiredFields"));
            return false;
        }

        if (!LATIN_USERNAME_REGEX.test(nick)) {
            setFormError(t("register.validation.usernameLatin"));
            return false;
        }

        if (!EMAIL_REGEX.test(em)) {
            setFormError(t("register.validation.emailInvalid"));
            return false;
        }

        if (!ONLY_LATIN_REGEX.test(em)) {
            setFormError(t("register.validation.emailLatin"));
            return false;
        }

        if (pass.length < 6) {
            setFormError(t("register.validation.passwordMin"));
            return false;
        }

        return true;
    };

    // ---------------------------
    // SUBMIT REGISTER
    // ---------------------------
    const onSubmitRegister = async () => {
        // 1) local validate
        if (!validateFormLocal()) return;

        // 2) remote validate status
        if (nickCheck.status === "taken" || emailCheck.status === "taken") {
            setFormError(t("register.validation.fixErrorsAbove"));
            return;
        }

        // 3) If checking — ask user wait
        if (nickCheck.status === "checking" || emailCheck.status === "checking") {
            setFormError(t("register.validation.waitChecking"));
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError("");

            const lang = getStoredLang() || "RU";

            const payload = {
                username: nickname.trim(),
                email: email.trim(),
                password: password.trim(),
                language: lang,
                birthDate: birthDate, // yyyy-mm-dd
            };

            const data = await registerUser(payload); // { uuid, secondsLeft }

            navigate("/verify-otp", {
                replace: true,
                state: {
                    uuid: data?.uuid,
                    secondsLeft: data?.secondsLeft ?? 600,
                    email: payload.email,
                },
            });
        } catch (e) {
            console.error("Register error", e);
            setFormError(t("register.validation.registerFailed"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#F7B338] via-[#F0A23B] to-[#E38D2F]">
            <div className="max-w-[420px] mx-auto min-h-screen px-4 pt-8 pb-10">
                {/* LOGO */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center justify-center px-7 py-3 rounded-[30px] bg-white/85 shadow-[0_18px_45px_rgba(0,0,0,0.18)] border border-white/70">
                        <div
                            className="text-[68px] leading-none font-black tracking-wide text-[#5AC0FF]"
                            style={{
                                textShadow:
                                    "0 6px 0 rgba(255,255,255,0.90), 0 18px 45px rgba(0,0,0,0.18)",
                            }}
                        >
                            {t("app.name")}
                        </div>
                    </div>
                </div>

                <div className="mt-5 relative">
                    <img
                        src={murziya}
                        alt={t("auth.murziyaName")}
                        className="absolute -left-6 top-1 w-[260px] h-[260px] object-contain drop-shadow-[0_28px_34px_rgba(0,0,0,0.25)] z-10"
                    />

                    <div className="ml-[170px] relative z-30">
                        <div className="relative rounded-[26px] bg-[#F4F4F4] px-5 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] border border-white/70">
                            <div className="text-[#2F7CC8] font-black text-[20px] leading-tight">
                                {t("register.murziyaHello")}
                            </div>
                            <div className="mt-1 text-[#8B6B20] font-extrabold text-[17px]">
                                {t("auth.murziyaName")}
                            </div>
                            <div className="absolute left-[-10px] top-[42px] w-6 h-6 bg-[#F4F4F4] rotate-45 border-l border-b border-white/70" />
                        </div>
                    </div>

                    <div className="mt-10 relative z-20 rounded-[34px] bg-gradient-to-b from-[#4FB8F3] to-[#2E89C8] shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-[14px] overflow-hidden">
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                            <div className="absolute -left-10 top-10 w-72 h-40 rounded-full bg-white blur-2xl" />
                            <div className="absolute right-[-60px] top-28 w-80 h-44 rounded-full bg-white blur-2xl" />
                        </div>

                        <div className="relative rounded-[30px] bg-[#F7EBD6] shadow-[0_18px_55px_rgba(0,0,0,0.20)] px-5 py-6">
                            <div
                                className="text-center font-black whitespace-nowrap overflow-hidden text-ellipsis text-[26px] sm:text-[30px] md:text-[34px]"
                                style={{
                                    color: "#FFFFFF",
                                    textShadow:
                                        "0 4px 0 rgba(0,0,0,0.22), 0 14px 36px rgba(0,0,0,0.25)",
                                }}
                            >
                                {t("register.titleTop")}
                            </div>

                            <div
                                className="mt-1 flex items-center justify-center gap-2 text-center font-black whitespace-nowrap overflow-hidden text-[16px] sm:text-[18px] md:text-[22px]"
                                style={{
                                    color: "#FFE07A",
                                    textShadow:
                                        "0 3px 0 rgba(0,0,0,0.18), 0 12px 28px rgba(0,0,0,0.18)",
                                }}
                            >
                                <span className="truncate">{t("register.subtitle")}</span>
                                <PawIcon />
                            </div>

                            <div className="mt-6 space-y-4">
                                {/* Nickname */}
                                <div>
                                    <InputField
                                        label={t("register.nicknameLabel")}
                                        placeholder={t("register.nicknamePlaceholder")}
                                        value={nickname}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setNickname(v);
                                            debounceNickCheck(v);
                                        }}
                                        onBlur={() => validateNicknameRemote(nickname)}
                                    />
                                    {nickCheck.status !== "idle" ? (
                                        <div
                                            className={`mt-2 text-[15px] font-black ${statusColor(
                                                nickCheck.status
                                            )}`}
                                        >
                                            {nickCheck.message}
                                        </div>
                                    ) : null}
                                </div>

                                {/* Email */}
                                <div>
                                    <InputField
                                        label={t("register.emailLabel")}
                                        placeholder={t("register.emailPlaceholder")}
                                        value={email}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setEmail(v);
                                            debounceEmailCheck(v);
                                        }}
                                        onBlur={() => validateEmailRemote(email)}
                                    />
                                    {emailCheck.status !== "idle" ? (
                                        <div
                                            className={`mt-2 text-[15px] font-black ${statusColor(
                                                emailCheck.status
                                            )}`}
                                        >
                                            {emailCheck.message}
                                        </div>
                                    ) : null}
                                </div>

                                {/* Password */}
                                <InputField
                                    label={t("register.passwordLabel")}
                                    placeholder={t("register.passwordPlaceholder")}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                {/* BirthDate */}
                                <div className="space-y-2">
                                    <div className="text-[22px] font-black text-[#2F2F2F]">
                                        {t("register.birthDateLabel")}
                                    </div>

                                    <div className="h-[54px] rounded-[18px] bg-[#E6D5B0] flex items-center px-4 shadow-[inset_0_4px_14px_rgba(0,0,0,0.16)]">
                                        <input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[18px] font-semibold text-[#4A3A13]"
                                        />
                                    </div>
                                </div>

                                {/* ✅ Общая ошибка формы */}
                                {formError ? (
                                    <div className="pt-2 text-center text-[15px] font-black text-red-600">
                                        {formError}
                                    </div>
                                ) : null}
                            </div>

                            {/* BUTTON */}
                            <div className="mt-6 relative group">
                                <div className="absolute -top-3 -bottom-2 -left-2 -right-2 rounded-[34px] bg-[#2F7CC8] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_18px_55px_rgba(0,0,0,0.20)]" />

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={onSubmitRegister}
                                    className="relative w-full h-[64px] rounded-[28px] bg-gradient-to-b from-[#78D82D] to-[#4EA61D] text-white text-[30px] font-black shadow-[0_12px_0_#2F7C12,0_26px_60px_rgba(0,0,0,0.20)] cursor-pointer disabled:opacity-70"
                                >
                                    {isSubmitting
                                        ? t("register.sending")
                                        : t("register.registerButton")}
                                </motion.button>
                            </div>

                            {/* back to login */}
                            <div className="mt-5 text-center">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-[#2E88C7] underline font-black cursor-pointer"
                                >
                                    {t("register.backToLogin")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* end wrapper */}
            </div>
        </div>
    );
}
