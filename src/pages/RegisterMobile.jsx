import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import murziya from "../assets/images/murziya.png";
import { containsAccountField } from "../api/auth/accountApi";
import { registerUser } from "../api/auth/registerApi";
import { getStoredLang } from "../utils/langStorage";

import { COLORS } from "../theme/colors";
import { ACCOUNT_FIELD, LANG_DEFAULT } from "../constants/auth";

/* ---------------- ICONS ---------------- */

const PawIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
            d="M8.2 11.8c.8 0 1.5-.9 1.5-2s-.7-2-1.5-2-1.5.9-1.5 2 .7 2 1.5 2Zm7.6 0c.8 0 1.5-.9 1.5-2s-.7-2-1.5-2-1.5.9-1.5 2 .7 2 1.5 2ZM12 11.5c.8 0 1.4-1 1.4-2.1 0-1.2-.6-2.1-1.4-2.1s-1.4 1-1.4 2.1c0 1.2.6 2.1 1.4 2.1Zm0 8.4c-2.4 0-6-1.1-6-3.5 0-1.6 1.6-2.6 3.2-2.6 1.1 0 1.9.5 2.8.5s1.7-.5 2.8-.5c1.6 0 3.2 1 3.2 2.6 0 2.4-3.6 3.5-6 3.5Z"
            fill={COLORS.brand.paw}
            opacity="0.95"
        />
    </svg>
);

const EyeIcon = ({ closed }) => {
    return closed ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
                d="M3 3l18 18"
                stroke={COLORS.brand.brown}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-.6"
                stroke={COLORS.brand.brown}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6.2 6.2C4.3 7.6 2.9 9.6 2 12c1.7 4.2 5.5 7 10 7 2 0 3.9-.6 5.4-1.6"
                stroke={COLORS.brand.brown}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9.2 4.5A10.7 10.7 0 0112 4c4.5 0 8.3 2.8 10 8a11.2 11.2 0 01-2.3 3.7"
                stroke={COLORS.brand.brown}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
                d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8Z"
                stroke={COLORS.brand.brown}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M12 15a3 3 0 100-6 3 3 0 000 6Z"
                stroke={COLORS.brand.brown}
                strokeWidth="2"
            />
        </svg>
    );
};

/* ---------------- UI ---------------- */

const InputField = ({
                        label,
                        placeholder,
                        type = "text",
                        value,
                        onChange,
                        onBlur,
                        rightSlot, // ✅ NEW
                    }) => (
    <div className="space-y-2">
        <div className="text-[22px] font-black" style={{ color: COLORS.text.dark }}>
            {label}
        </div>

        <div
            className="h-[54px] rounded-[18px] flex items-center gap-3 px-4 shadow-[inset_0_4px_14px_rgba(0,0,0,0.16)]"
            style={{ background: COLORS.brand.inputBg }}
        >
            <input
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-[18px] font-semibold"
                style={{ color: COLORS.brand.inputText }}
            />

            {/* ✅ right slot (например глаз) */}
            {rightSlot ? (
                <div className="w-10 h-10 flex items-center justify-center">{rightSlot}</div>
            ) : null}
        </div>
    </div>
);

/* ---------------- VALIDATION REGEX ---------------- */

const LATIN_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,32}$/;
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

    const [showPassword, setShowPassword] = useState(false); // ✅ NEW

    // availability
    const [nickCheck, setNickCheck] = useState({ status: "idle", message: "" });
    const [emailCheck, setEmailCheck] = useState({ status: "idle", message: "" });

    const nickAbortRef = useRef(null);
    const emailAbortRef = useRef(null);

    const nickTimerRef = useRef(null);
    const emailTimerRef = useRef(null);

    // submit
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ---------------- REMOTE VALIDATION ---------------- */

    const validateNicknameRemote = async (value) => {
        const nick = value.trim();
        setFormError("");

        if (!nick) {
            setNickCheck({ status: "idle", message: "" });
            return;
        }

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
                accountField: ACCOUNT_FIELD.USERNAME,
                account: nick,
                signal: controller.signal,
            });

            setNickCheck(
                exists
                    ? { status: "taken", message: t("register.validation.nicknameTaken") }
                    : { status: "ok", message: t("register.validation.nicknameFree") }
            );
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
                accountField: ACCOUNT_FIELD.EMAIL,
                account: em,
                signal: controller.signal,
            });

            setEmailCheck(
                exists
                    ? { status: "taken", message: t("register.validation.emailTaken") }
                    : { status: "ok", message: t("register.validation.emailFree") }
            );
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
        if (status === "checking") return "text-blue-700";
        if (status === "error") return "text-red-600";
        return "text-transparent";
    };

    /* ---------------- LOCAL VALIDATION ---------------- */

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

    /* ---------------- SUBMIT ---------------- */

    const onSubmitRegister = async () => {
        if (!validateFormLocal()) return;

        if (nickCheck.status === "taken" || emailCheck.status === "taken") {
            setFormError(t("register.validation.fixErrorsAbove"));
            return;
        }

        if (nickCheck.status === "checking" || emailCheck.status === "checking") {
            setFormError(t("register.validation.waitChecking"));
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError("");

            const lang = getStoredLang() || LANG_DEFAULT;

            const payload = {
                username: nickname.trim(),
                email: email.trim(),
                password: password.trim(),
                language: lang,
                birthDate,
            };

            const data = await registerUser(payload);

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
        <div
            className="min-h-screen w-full"
            style={{
                background: `linear-gradient(to bottom, ${COLORS.bg.orangeTop}, ${COLORS.bg.orangeMid}, ${COLORS.bg.orangeBottom})`,
            }}
        >
            <div className="max-w-[420px] mx-auto min-h-screen px-4 pt-8 pb-10">
                {/* LOGO */}
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

                <div className="mt-5 relative">
                    {/* CAT */}
                    <img
                        src={murziya}
                        alt={t("auth.murziyaName")}
                        className="absolute -left-6 top-1 w-[260px] h-[260px] object-contain drop-shadow-[0_28px_34px_rgba(0,0,0,0.25)] z-10"
                    />

                    {/* bubble */}
                    <div className="ml-[170px] relative z-30">
                        <div
                            className="relative rounded-[26px] px-5 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] border border-white/70"
                            style={{ background: COLORS.brand.bubble }}
                        >
                            <div
                                className="font-black text-[20px] leading-tight"
                                style={{ color: COLORS.brand.titleBlue }}
                            >
                                {t("register.murziyaHello")}
                            </div>

                            <div
                                className="mt-1 font-extrabold text-[17px]"
                                style={{ color: COLORS.brand.brown }}
                            >
                                {t("auth.murziyaName")}
                            </div>

                            <div
                                className="absolute left-[-10px] top-[42px] w-6 h-6 rotate-45 border-l border-b border-white/70"
                                style={{ background: COLORS.brand.bubble }}
                            />
                        </div>
                    </div>

                    {/* FORM */}
                    <div
                        className="mt-10 relative z-20 rounded-[34px] shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-[14px] overflow-hidden"
                        style={{
                            background: `linear-gradient(to bottom, ${COLORS.auth.formBlueTop}, ${COLORS.auth.formBlueBottom})`,
                        }}
                    >
                        {/* soft highlights */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                            <div className="absolute -left-10 top-10 w-72 h-40 rounded-full bg-white blur-2xl" />
                            <div className="absolute right-[-60px] top-28 w-80 h-44 rounded-full bg-white blur-2xl" />
                        </div>

                        <div
                            className="relative rounded-[30px] shadow-[0_18px_55px_rgba(0,0,0,0.20)] px-5 py-6"
                            style={{ background: COLORS.brand.milk }}
                        >
                            <div
                                className="text-center font-black whitespace-nowrap overflow-hidden text-ellipsis text-[26px] sm:text-[30px] md:text-[34px]"
                                style={{
                                    color: COLORS.white,
                                    textShadow:
                                        "0 4px 0 rgba(0,0,0,0.22), 0 14px 36px rgba(0,0,0,0.25)",
                                }}
                            >
                                {t("register.titleTop")}
                            </div>

                            <div
                                className="mt-1 flex items-center justify-center gap-2 text-center font-black whitespace-nowrap overflow-hidden text-[16px] sm:text-[18px] md:text-[22px]"
                                style={{
                                    color: COLORS.brand.subtitleYellow,
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

                                {/* ✅ Password WITH EYE */}
                                <InputField
                                    label={t("register.passwordLabel")}
                                    placeholder={t("register.passwordPlaceholder")}
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    rightSlot={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="active:scale-[0.95] transition-transform"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <EyeIcon closed={!showPassword} />
                                        </button>
                                    }
                                />

                                {/* BirthDate */}
                                <div className="space-y-2">
                                    <div
                                        className="text-[22px] font-black"
                                        style={{ color: COLORS.text.dark }}
                                    >
                                        {t("register.birthDateLabel")}
                                    </div>

                                    <div
                                        className="h-[54px] rounded-[18px] flex items-center px-4 shadow-[inset_0_4px_14px_rgba(0,0,0,0.16)]"
                                        style={{ background: COLORS.brand.inputBg }}
                                    >
                                        <input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[18px] font-semibold"
                                            style={{ color: COLORS.brand.inputText }}
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {formError ? (
                                    <div className="pt-2 text-center text-[15px] font-black text-red-600">
                                        {formError}
                                    </div>
                                ) : null}
                            </div>

                            {/* BUTTON */}
                            <div className="mt-6 relative group">
                                <div
                                    className="absolute -top-3 -bottom-2 -left-2 -right-2 rounded-[34px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_18px_55px_rgba(0,0,0,0.20)]"
                                    style={{ background: COLORS.auth.hoverBlue }}
                                />

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={onSubmitRegister}
                                    className="relative w-full h-[64px] rounded-[28px] text-white text-[30px] font-black cursor-pointer disabled:opacity-70"
                                    style={{
                                        background: `linear-gradient(to bottom, ${COLORS.auth.buttonGreenTop}, ${COLORS.auth.buttonGreenBottom})`,
                                        boxShadow: `0 12px 0 ${COLORS.auth.buttonShadowGreen}, 0 26px 60px rgba(0,0,0,0.20)`,
                                    }}
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
                                    className="underline font-black cursor-pointer"
                                    style={{ color: COLORS.auth.formBlueBottom }}
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
