import tailwindAnimate from "tailwindcss-animate";

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    orangeTop: "#F7B338",
                    orangeMid: "#F0A23B",
                    orangeBottom: "#E38D2F",
                    blue: "#5AC0FF",
                    blueCard: "#36A3E8",
                    green: "#5AC12E",
                    milk: "#FFF7E7",
                    grayLocked: "#9CA3AF",
                    grayLockedDark: "#6B7280",
                },
            },
            borderRadius: {
                card: "28px",
            },
            boxShadow: {
                card: "0 20px 60px rgba(0,0,0,0.20)",
                soft: "0 10px 30px rgba(0,0,0,0.15)",
            },
        },
    },
    plugins: [tailwindAnimate],
};
