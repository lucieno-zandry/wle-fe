import { useParams, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { defaultPreference, usePreferencesStore, type StorePreference } from "~/hooks/use-user-preference-store";

export function getPreferencesFromLoaderFunctionArgs(loaderFunctionArgs: LoaderFunctionArgs): StorePreference {
    const { params, request } = loaderFunctionArgs;

    const searchParams = new URLSearchParams(request.url);

    const language = params.lang || 'en';
    const currency = searchParams.get('currency') || defaultPreference.currency;
    const theme = searchParams.get('theme') || defaultPreference.theme;
    const timezone = defaultPreference.timezone;

    return {
        language,
        currency,
        theme,
        timezone
    } as StorePreference
}

export default function appPathname(pathname: string, preferences?: StorePreference) {
    let { preferences: prefs } = usePreferencesStore.getState()

    if (preferences) {
        prefs = preferences;
    }

    const to = pathnameWithPreference({ pathname, preferences: prefs });
    return `/${prefs.language}${to}`;
}

export function useAppPathname() {
    const [searchParams] = useSearchParams();
    const { lang: language = 'en' } = useParams()

    const currency = searchParams.get('currency') || defaultPreference.currency;
    const theme = (searchParams.get('theme') || defaultPreference.theme) as StorePreference['theme'];

    const getPathname = (pathname: string) => appPathname(pathname, {
        ...defaultPreference,
        currency,
        language,
        theme,
    });

    return getPathname;
}

export function pathnameWithPreference({ pathname, preferences }: { pathname: string, preferences: StorePreference }) {
    const to = `${pathname}${pathname.includes('?') ? '&' : '?'}currency=${preferences.currency}&theme=${preferences.theme}`;
    return to;
}