export function parseCookies(cookieString: string | null): Record<string, string | undefined> {
    if (!cookieString) return {};

    return cookieString.split(";").reduce((acc, part) => {
        const [key, ...valueParts] = part.trim().split("=");
        if (!key) return acc;

        const value = valueParts.join("=");

        acc[key] = decodeURIComponent(value ?? "");
        return acc;
    }, {} as Record<string, string>);
}

export function getCookie(name: string, cookies: string | null): string | undefined {
    if (!cookies) return;
    return parseCookies(cookies)[name];
}

export function parseClientCookies() {
    return document.cookie
        .split("; ")
        .reduce<Record<string, string>>((acc, cookie) => {
            const [key, value] = cookie.split("=");
            acc[key] = decodeURIComponent(value);
            return acc;
        }, {});
}