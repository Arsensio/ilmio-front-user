import { getCurrentUserInfo } from "../api/user/userApi";
import { changeAppLanguage } from "../i18n/changeAppLanguage";
import { setStoredLang } from "../utils/langStorage";

export async function syncUserLanguageFromBackend(i18n) {
    const user = await getCurrentUserInfo(); // <-- тут важно авторизация

    const lang = user?.language;
    if (!lang) return;

    setStoredLang(lang);
    await changeAppLanguage(i18n, lang);
}