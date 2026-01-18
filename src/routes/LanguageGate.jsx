import React from "react";
import { Navigate } from "react-router-dom";
import { isLangSelected } from "../utils/langStorage";

export default function LanguageGate({ children }) {
    const selected = isLangSelected();

    if (!selected) {
        return <Navigate to="/choose-language" replace />;
    }

    return children;
}
