import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getStoredToken } from "../utils/tokenStorage";
import { syncUserLanguageFromBackend } from "../services/syncUserLanguage";

export default function AuthGuard({ children }) {
    const token = getStoredToken();
    const location = useLocation();
    const { i18n } = useTranslation();

    const [syncLoading, setSyncLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!token) {
                setSyncLoading(false);
                return;
            }

            try {
                console.log("[AuthGuard] syncing language from backend...");
                await syncUserLanguageFromBackend(i18n);
                console.log("[AuthGuard] language sync done");
            } catch (e) {
                console.warn("[AuthGuard] language sync failed:", e);
            } finally {
                if (!cancelled) setSyncLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, i18n]);

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // пока грузим язык — можно показать null или loader/splash
    if (syncLoading) {
        return null;
    }

    return children;
}
