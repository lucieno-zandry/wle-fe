export const ALLOWED_LANGUAGES = [
    'fr',
    'en'
];


export function extractLang(url: string): string | null {
    try {
        const parsed = new URL(url);
        // pathname starts with "/", so split and filter
        const segments = parsed.pathname.split("/").filter(Boolean);
        // assume the first segment is the language code
        return segments.length > 0 ? segments[0] : null;
    } catch {
        return null; // invalid URL
    }
}

export function langIsValid(lang: string) {
    if (lang.length === 2 && ALLOWED_LANGUAGES.includes(lang)) {
        return true;
    }

    return false;
}