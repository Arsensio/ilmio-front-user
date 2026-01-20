import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginMobile from "./pages/LoginMobile";
import RegisterMobile from "./pages/RegisterMobile";
import ChooseLanguage from "./pages/ChooseLanguage";
import VerifyOtpMobile from "./pages/VerifyOtpMobile";

import LanguageGate from "./routes/LanguageGate";
import AuthGuard from "./routes/AuthGuard";

import MobileLayout from "./layouts/MobileLayout";
import HomeMobile from "./pages/app/HomeMobile";
import NotesMobile from "./pages/app/NotesMobile";
import ProfileMobile from "./pages/app/ProfileMobile";

export default function AppRoutes() {
    return (
        <Routes>
            {/* choose language отдельно */}
            <Route path="/choose-language" element={<ChooseLanguage />} />

            {/* ---------- AUTH ---------- */}
            <Route
                path="/login"
                element={
                    <LanguageGate>
                        <LoginMobile />
                    </LanguageGate>
                }
            />

            <Route
                path="/register"
                element={
                    <LanguageGate>
                        <RegisterMobile />
                    </LanguageGate>
                }
            />

            <Route
                path="/verify-otp"
                element={
                    <LanguageGate>
                        <VerifyOtpMobile />
                    </LanguageGate>
                }
            />

            {/* ---------- APP (private) ---------- */}
            <Route
                path="/app"
                element={
                    <AuthGuard>
                        <LanguageGate>
                            <MobileLayout />
                        </LanguageGate>
                    </AuthGuard>
                }
            >
                {/* ✅ default route /app -> /app/home */}
                <Route index element={<Navigate to="home" replace />} />

                <Route path="home" element={<HomeMobile />} />
                <Route path="notes" element={<NotesMobile />} />
                <Route path="profile" element={<ProfileMobile />} />
            </Route>

            {/* default */}
            <Route path="/" element={<Navigate to="/app" replace />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
