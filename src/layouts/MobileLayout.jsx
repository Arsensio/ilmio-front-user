import React from "react";
import {NavLink, Outlet} from "react-router-dom";
import {Home, NotebookPen, User} from "lucide-react";

const tabs = [
    { to: "/app/home", label: "Home", icon: Home },
    { to: "/app/notes", label: "Notes", icon: NotebookPen },
    { to: "/app/profile", label: "Profile", icon: User },
];

export default function MobileLayout() {
    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#F7B338] via-[#F0A23B] to-[#E38D2F]">
            {/* CONTENT */}
            <div className="max-w-[420px] mx-auto min-h-[100dvh] px-4 pt-8 pb-[110px]">
                {/* LOGO как на картинке */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center justify-center px-7 py-3 rounded-[30px] bg-white/85 shadow-[0_10px_10px_rgba(0,0,0,0.18)] border border-white/70">
                        <div
                            className="text-[64px] leading-none font-black tracking-wide text-[#5AC0FF]"
                            style={{
                                textShadow:
                                    "0 6px 0 rgba(255,255,255,0.90), 0 18px 45px rgba(0,0,0,0.18)",
                            }}
                        >
                            ilmio
                        </div>
                    </div>
                </div>

                {/* MAIN PAGE CONTENT */}
                <div className="mt-6">
                    <Outlet />
                </div>
            </div>

            {/* ✅ BOTTOM MENU */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="max-w-[420px] mx-auto px-4 pb-5">
                    <div className="rounded-[28px] bg-[#EAA02E]/75 backdrop-blur border border-white/40 shadow-[0_16px_50px_rgba(0,0,0,0.25)] px-4 py-3">
                        <div className="grid grid-cols-3 gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;

                                return (
                                    <NavLink
                                        key={tab.to}
                                        to={tab.to}
                                        className={({ isActive }) =>
                                            [
                                                "h-[64px] rounded-[20px]",
                                                "flex flex-col items-center justify-center gap-1",
                                                "font-black text-[12px]",
                                                "transition-all duration-150",
                                                isActive
                                                    ? "bg-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                                                    : "bg-white/30 hover:bg-white/45",
                                            ].join(" ")
                                        }
                                    >
                                        <Icon size={24} />
                                        <div>{tab.label}</div>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
