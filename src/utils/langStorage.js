const LANG_KEY = "ilmio_lang";
const LANG_SELECTED_KEY = "ilmio_lang_selected";

export function getStoredLang() {
    try {
        return localStorage.getItem(LANG_KEY);
    } catch (e) {
        return null;
    }
}

export function setStoredLang(lang) {
    try {
        localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
}

/** ✅ пользователь реально выбрал язык? */
export function isLangSelected() {
    try {
        return localStorage.getItem(LANG_SELECTED_KEY) === "true";
    } catch (e) {
        return false;
    }
}

export function setLangSelected() {
    try {
        localStorage.setItem(LANG_SELECTED_KEY, "true");
    } catch (e) {}
}

export function clearLangSelection() {
    try {
        localStorage.removeItem(LANG_KEY);
        localStorage.removeItem(LANG_SELECTED_KEY);
    } catch (e) {}
}
