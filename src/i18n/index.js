import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ru from "./locales/ru.json";
import kz from "./locales/kz.json";
import en from "./locales/en.json";

i18n
    .use(LanguageDetector) // ✅ умеет брать язык из localStorage
    .use(initReactI18next)
    .init({
        resources: {
            RU: { translation: ru },
            KZ: { translation: kz },
            EN: { translation: en },
        },

        fallbackLng: "RU",

        // важно: чтобы i18next искал именно в localStorage
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
            lookupLocalStorage: "ilmio_lang",
        },

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
