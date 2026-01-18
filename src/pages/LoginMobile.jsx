import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import murziya from "../assets/images/murziya.png";
import { login } from "../api/auth/authApi";
import { setStoredToken } from "../utils/tokenStorage"; // ✅ ДОБАВИЛИ

const MailIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
            d="M4 6.8H20V17.2H4V6.8Z"
            stroke="#8A6A24"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M4.5 7.2L12 13L19.5 7.2"
            stroke="#8A6A24"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
    </svg>
);

const LockIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
            d="M7 10V8.4C7 6.3 8.6 4.6 10.7 4.6H13.3C15.4 4.6 17 6.3 17 8.4V10"
            stroke="#8A6A24"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <path
            d="M6.8 10H17.2C18.2 10 19 10.8 19 11.8V18.2C19 19.2 18.2 20 17.2 20H6.8C5.8 20 5 19.2 5 18.2V11.8C5 10.8 5.8 10 6.8 10Z"
            stroke="#8A6A24"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
    </svg>
);

const InputField = ({
                        label,
                        placeholder,
                        type = "text",
                        icon,
                        value,
                        onChange,
                    }) => {
    return (
        <div className="space-y-2">
            <div className="text-[22px] font-black text-[#2F2F2F]">{label}</div>

            <div className="h-[54px] rounded-[18px] bg-[#E6D5B0] flex items-center gap-3 px-4 shadow-[inset_0_4px_14px_rgba(0,0,0,0.16)]">
                <div className="w-10 h-10 flex items-center justify-center">{icon}</div>

                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-[18px] font-semibold text-[#4A3A13] placeholder:text-[#8A7A55]"
                />
            </div>
        </div>
    );
};

export default function LoginMobile() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState("");

    const onLogin = async () => {
        try {
            setErrorText("");
            setIsLoading(true);

            const data = await login({
                username: username.trim(),
                password,
            });

            // ✅ 1) сохраняем токен
            setStoredToken(data.token);

            // ✅ 2) кидаем на home
            navigate("/app/home", { replace: true });
        } catch (e) {
            console.error("Login error", e);
            setErrorText("Неверный логин или пароль 😿");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#F7B338] via-[#F0A23B] to-[#E38D2F]">
            <div className="max-w-[420px] mx-auto min-h-screen px-4 pt-8 pb-10">
                {/* LOGO */}
                <div className="flex justify-center">
                    <div
                        className={[
                            "inline-flex items-center justify-center",
                            "px-7 py-3",
                            "rounded-[30px]",
                            "bg-white/85",
                            "shadow-[0_18px_45px_rgba(0,0,0,0.18)]",
                            "border border-white/70",
                        ].join(" ")}
                    >
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

                {/* TOP + CARD WRAPPER */}
                <div className="mt-5 relative">
                    {/* CAT */}
                    <img
                        src={murziya}
                        alt={t("auth.murziyaName")}
                        className={[
                            "absolute",
                            "-left-6 top-1",
                            "w-[250px] h-[250px]",
                            "object-contain",
                            "drop-shadow-[0_28px_34px_rgba(0,0,0,0.25)]",
                            "z-10",
                        ].join(" ")}
                    />

                    {/* bubble */}
                    <div className="ml-[170px] relative z-30">
                        <div className="relative rounded-[26px] bg-[#F4F4F4] px-5 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] border border-white/70">
                            <div className="text-[#2F7CC8] font-black text-[20px] leading-tight">
                                {t("auth.murziyaHello")}
                            </div>
                            <div className="mt-1 text-[#8B6B20] font-extrabold text-[17px]">
                                {t("auth.murziyaName")}
                            </div>

                            <div className="absolute left-[-10px] top-[42px] w-6 h-6 bg-[#F4F4F4] rotate-45 border-l border-b border-white/70" />
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="mt-10 relative z-20 rounded-[34px] bg-gradient-to-b from-[#4FB8F3] to-[#2E89C8] shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-[14px]">
                        <div className="rounded-[30px] bg-[#F7EBD6] shadow-[0_18px_55px_rgba(0,0,0,0.20)] px-5 py-6">
                            <div
                                className="text-center text-[44px] font-black mb-4 text-[#FFFFFF]"
                                style={{
                                    textShadow:
                                        "0 5px 0 rgba(0,0,0,0.18), 0 16px 40px rgba(0,0,0,0.18)",
                                }}
                            >
                                {t("auth.loginTitle")}
                            </div>

                            <div className="space-y-5">
                                <InputField
                                    label={t("auth.emailLabel")}
                                    placeholder={t("auth.emailPlaceholder")}
                                    icon={<MailIcon />}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />

                                <InputField
                                    label={t("auth.passwordLabel")}
                                    placeholder={t("auth.passwordPlaceholder")}
                                    type="password"
                                    icon={<LockIcon />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {/* BUTTON */}
                            <div className="mt-6 relative group">
                                <div
                                    className={[
                                        "absolute",
                                        "-top-3 -bottom-2 -left-2 -right-2",
                                        "rounded-[34px]",
                                        "bg-[#2F7CC8]",
                                        "opacity-0 group-hover:opacity-100",
                                        "transition-opacity duration-200",
                                        "shadow-[0_18px_55px_rgba(0,0,0,0.20)]",
                                    ].join(" ")}
                                />

                                <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onLogin}
                                    disabled={isLoading}
                                    className={[
                                        "relative",
                                        "w-full h-[64px]",
                                        "rounded-[28px]",
                                        "bg-gradient-to-b from-[#78D82D] to-[#4EA61D]",
                                        "text-white text-[34px] font-black",
                                        "shadow-[0_12px_0_#2F7C12,0_26px_60px_rgba(0,0,0,0.20)]",
                                        "cursor-pointer",
                                        "disabled:opacity-70 disabled:cursor-not-allowed",
                                    ].join(" ")}
                                >
                                    {isLoading ? "..." : t("auth.loginButton")}
                                </motion.button>
                            </div>

                            {/* ERROR */}
                            {errorText ? (
                                <div className="mt-4 text-center text-[16px] font-black text-red-600">
                                    {errorText}
                                </div>
                            ) : null}

                            {/* Register */}
                            <div className="mt-5 text-center text-[18px] text-[#5A4A25] font-semibold">
                                {t("auth.noAccount")}{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="text-[#2E88C7] underline font-black cursor-pointer"
                                >
                                    {t("auth.register")}
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
