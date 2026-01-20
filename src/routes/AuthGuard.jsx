import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredToken } from "../utils/tokenStorage";

export default function AuthGuard({ children }) {
    const token = getStoredToken();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}
