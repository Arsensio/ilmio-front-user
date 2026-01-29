// AppRoutes.jsx
import React from "react";
import {Navigate, Route, Routes} from "react-router-dom";

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

import LessonMobile from "./pages/app/LessonMobile";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/choose-language" element={<ChooseLanguage />} />

            {/* AUTH */}
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

            {/* ✅ LESSON отдельный экран, без MobileLayout */}
            <Route
                path="/lesson/:lessonId"
                element={
                    <AuthGuard>
                        <LanguageGate>
                            <LessonMobile />
                        </LanguageGate>
                    </AuthGuard>
                }
            />

            {/* APP (with bottom menu) */}
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
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<HomeMobile />} />
                <Route path="notes" element={<NotesMobile />} />
                <Route path="profile" element={<ProfileMobile />} />
            </Route>

            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
