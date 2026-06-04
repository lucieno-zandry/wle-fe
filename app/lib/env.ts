import isCsr from "./is-csr";

// app/utils/env.ts
declare global {
    interface Window {
        __env?: {
            API_BASE_URL: string;
            SERVER_API_BASE_URL: string;
            API_URL: string;

            // …other variables
        };
    }
}

function getEnv() {
    // In the browser, use the embedded object
    if (typeof window !== "undefined" && window.__env) {
        return window.__env;
    }

    const clientApiBaseUrl = process.env.API_BASE_URL || "http://localhost:8000";
    const serverApiBaseUrl = process.env.SERVER_API_BASE_URL || clientApiBaseUrl;

    const apiBaseUrl = isCsr() ? clientApiBaseUrl : serverApiBaseUrl
    // On the server, fall back to process.env (or a safe default)
    return {
        API_BASE_URL: apiBaseUrl,
        API_URL: apiBaseUrl + '/api',
    };
}

export const env = getEnv();