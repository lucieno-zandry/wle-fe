import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import { usePreferencesStore } from '~/hooks/use-user-preference-store';
import { useUserStore } from '~/hooks/use-user';
import { Sun, Moon, Laptop } from 'lucide-react';

// Dumb presentational component
interface ThemeSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const ThemeSelect = ({ value, onChange, disabled }: ThemeSelectProps) => {


    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-[80px] sm:w-[110px] h-9 flex items-center gap-2 bg-transparent">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">
                    <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">Light</span>
                    </div>
                </SelectItem>
                <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">Dark</span>
                    </div>
                </SelectItem>
                <SelectItem value="system">
                    <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize hidden sm:inline-block">System</span>
                        <span className="capitalize sm:hidden">Sys</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
};

// Smart component that reads/writes from the preferences store
export const ThemeSelector = () => {
    const { authStatus } = useUserStore();
    const { preferences, updatePreferences } = usePreferencesStore();

    const handleThemeChange = (newTheme: string) => {
        updatePreferences({ theme: newTheme as 'light' | 'dark' | 'system' });
    };

    return (
        <ThemeSelect
            value={preferences?.theme || 'system'}
            onChange={handleThemeChange}
            disabled={authStatus === 'unknown'}
        />
    );
};