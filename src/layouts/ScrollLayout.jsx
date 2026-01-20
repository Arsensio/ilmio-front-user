import React from "react";

export default function ScrollLayout({ children }) {
    return (
        <div className="h-[100dvh] w-full overflow-y-auto overscroll-none bg-gradient-to-b from-[#F7B338] via-[#F0A23B] to-[#E38D2F]">
            {children}
        </div>
    );
}
