import { setStoredLang } from "../utils/langStorage";

export async function changeAppLanguage(i18n, lang) {
    setStoredLang(lang);              // ✅ сохраняем выбор пользователя
    await i18n.changeLanguage(lang);  // ✅ меняем язык
}
