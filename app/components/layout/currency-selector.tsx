import { useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import { defaultPreference, usePreferencesStore } from '~/hooks/use-user-preference-store';
import { useUserStore } from '~/hooks/use-user';
import { CircleDollarSign } from 'lucide-react';

const CURRENCIES = [
    { code: 'USD', label: 'US Dollar' },
    { code: 'EUR', label: 'Euro' },
    { code: 'GBP', label: 'British Pound' },
    { code: 'JPY', label: 'Japanese Yen' },
    { code: 'CAD', label: 'Canadian Dollar' },
    { code: 'AUD', label: 'Australian Dollar' },
    { code: 'CHF', label: 'Swiss Franc' },
    { code: 'CNY', label: 'Chinese Yuan' },
    { code: 'INR', label: 'Indian Rupee' },
    { code: 'BRL', label: 'Brazilian Real' },
    { code: 'MGA', label: 'Ariary' }
];

interface CurrencySelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const DropdownCurrencySelect = ({ value, onChange, disabled }: CurrencySelectProps) => {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Currency</span>
            </div>
            <Select
                value={value || defaultPreference.currency}
                onValueChange={onChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-[80px] h-8">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                            <span className="font-medium">{curr.code}</span>
                            <span className="text-muted-foreground text-xs ml-1 hidden sm:inline">
                                - {curr.label}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

const CurrencySelect = ({ value, onChange, disabled }: CurrencySelectProps) => (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-[80px] sm:w-[110px] h-9 flex items-center gap-2 bg-transparent">
            <CircleDollarSign className="w-4 h-4 text-muted-foreground hidden sm:block shrink-0" />
            <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
            {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{curr.code}</span>
                        <span className="text-muted-foreground text-xs hidden sm:inline-block">
                            - {curr.label}
                        </span>
                    </div>
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

export const CurrencySelector = ({ type = 'navbar' }: { type?: 'navbar' | 'dropdown' }) => {
    const { authStatus } = useUserStore();
    const { preferences, updatePreferences } = usePreferencesStore();

    const handleCurrencyChange = (newCurrency: string) => {
        updatePreferences({ currency: newCurrency });
    };

    const Component = type === 'dropdown' ? DropdownCurrencySelect : CurrencySelect;

    return (
        <Component
            value={preferences.currency}
            onChange={handleCurrencyChange}
            disabled={authStatus === 'unknown'}
        />
    );
};