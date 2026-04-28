import { useRouteLoaderData } from "react-router";
import { usePreferencesStore } from "~/hooks/use-user-preference-store";
import type { loader } from "~/routes/config/config-boundary";

function base(currency: string, language: string, n?: number, fractionDigits: number = 2) {
    if (n === undefined || n === null) return "-";

    try {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(n);
    } catch (error) {
        // Fallback to a basic format if the currency code is unsupported
        return `${currency} ${Number(n).toFixed(fractionDigits)}`;
    }
}

function currencySymbol(language: string, currency: string) {
    try {
        // Format a dummy value and extract the symbol
        const parts = new Intl.NumberFormat(language, {
            style: "currency",
            currency,
        }).formatToParts(0);

        const symbolPart = parts.find(p => p.type === "currency");
        return symbolPart ? symbolPart.value : currency;
    } catch (error) {
        // Fallback: just return the currency code itself
        return currency;
    }
}

/**
 * Formats a number as a currency string using the user's preferred currency and language.
 */
export default function formatMoney(n?: number, fractionDigits: number = 2) {
    const { currency, language } = usePreferencesStore.getState().preferences;

    return base(currency, language, n, fractionDigits);
};

export function useFormatMoney() {
    const boundaryData = useRouteLoaderData<typeof loader>("routes/config/config-boundary");
    const preferenseStore = usePreferencesStore();

    const currency = boundaryData?.preferences.currency || preferenseStore.preferences.currency;
    const language = boundaryData?.preferences.language || preferenseStore.preferences.language;

    const formatMoney: ((n?: number | undefined, fractionDigits?: number) => string) & {
        currency: string,
        language: string,
    } = (n?: number, fractionDigits: number = 2) => base(currency, language, n, fractionDigits)

    formatMoney.currency = currency;
    formatMoney.language = language;

    return formatMoney;
}

export function useCurrencySymbol() {
    const { currency, language } = useFormatMoney();
    return currencySymbol(language, currency);
}

export function getCurrencySymbol(): string {
    const { currency, language } = usePreferencesStore.getState().preferences;
    return currencySymbol(language, currency);
}