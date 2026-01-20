import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


import { clearStoredToken } from "../../utils/tokenStorage";

export default function ProfileMobile() {
    const { t} = useTranslation();

    const navigate = useNavigate();

    const onLogout = () => {
        clearStoredToken();
        navigate("/login", { replace: true });
    };

    return (
        <div className="rounded-[28px] bg-white/80 border border-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-6">
            <div className="text-center font-black text-[30px] text-[#2F7CC8]">
                PROFILE
            </div>

            <div className="mt-3 text-center font-bold text-[#8B6B20]">
                This is the Profile page
            </div>

            {/* ✅ LOGOUT */}
            <div className="mt-8">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onLogout}
                    className="w-full h-[64px] rounded-[28px] bg-gradient-to-b from-[#FF5A5A] to-[#D62828] text-white text-[26px] font-black shadow-[0_12px_0_#8B1010,0_26px_60px_rgba(0,0,0,0.20)]"
                >
                    {t("profile.logout")}
                </motion.button>
            </div>
        </div>
    );
}
