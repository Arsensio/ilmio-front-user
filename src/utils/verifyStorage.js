const VERIFY_UUID_KEY = "ilmio_verify_uuid";
const VERIFY_EMAIL_KEY = "ilmio_verify_email";

export function setVerifyUuid(uuid) {
    try {
        sessionStorage.setItem(VERIFY_UUID_KEY, uuid);
    } catch (e) {}
}

export function getVerifyUuid() {
    try {
        return sessionStorage.getItem(VERIFY_UUID_KEY);
    } catch (e) {
        return null;
    }
}

export function clearVerifyUuid() {
    try {
        sessionStorage.removeItem(VERIFY_UUID_KEY);
    } catch (e) {}
}

export function setVerifyEmail(email) {
    try {
        sessionStorage.setItem(VERIFY_EMAIL_KEY, email);
    } catch (e) {}
}

export function getVerifyEmail() {
    try {
        return sessionStorage.getItem(VERIFY_EMAIL_KEY);
    } catch (e) {
        return null;
    }
}

export function clearVerifyEmail() {
    try {
        sessionStorage.removeItem(VERIFY_EMAIL_KEY);
    } catch (e) {}
}
