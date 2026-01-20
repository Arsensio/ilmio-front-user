import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import ScrollLayout from "./layouts/ScrollLayout";

export default function App() {
    return (
        <BrowserRouter>
            <ScrollLayout>
                <AppRoutes />
            </ScrollLayout>
        </BrowserRouter>
    );
}
