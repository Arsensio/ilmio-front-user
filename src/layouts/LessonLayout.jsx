import React from "react";

/**
 * Proper floating layout:
 * - header/footer are overlay (absolute) -> always fixed visually
 * - only content scrolls
 * - content has paddingTop/paddingBottom so it never hides under header/footer
 */
export default function LessonLayout({ header, children, footer }) {
    return (
        <div className="max-w-[420px] mx-auto h-[100dvh] relative px-4 overflow-hidden">
            {/* HEADER overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 pt-6 px-4 pointer-events-none">
                {/* allow clicks only inside header */}
                <div className="pointer-events-auto">{header}</div>
            </div>

            {/* FOOTER overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-50 pb-6 px-4 pointer-events-none">
                <div className="pointer-events-auto">{footer}</div>
            </div>

            {/* CONTENT scroll */}
            <div className="h-full overflow-y-auto">
                {/* reserve spaces so content can go UNDER overlays */}
                <div className="pt-[110px] pb-[140px] min-h-full flex items-center justify-center">
                    <div className="w-full">{children}</div>
                </div>
            </div>
        </div>
    );
}
