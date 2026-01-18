import { useTranslation } from "react-i18next";

export default function LanguageSwitch() {
    const { i18n } = useTranslation();

    return (
        <div className="flex gap-2 justify-center mt-3">
            {["RU", "KZ", "EN"].map((lng) => (
                <button
                    key={lng}
                    onClick={() => i18n.changeLanguage(lng)}
                    className={[
                        "px-3 py-2 rounded-xl font-extrabold",
                        i18n.language === lng ? "bg-white text-black" : "bg-white/20 text-white"
                    ].join(" ")}
                >
                    {lng}
                </button>
            ))}
        </div>
    );
}
