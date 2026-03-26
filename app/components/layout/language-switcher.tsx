// components/language-switcher.tsx
import { useParams, useNavigate, useLocation } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Globe } from "lucide-react";

// Dumb presentational component
interface LanguageSelectProps {
    value: string | undefined;
    onChange: (value: string) => void;
}

const LanguageSelect = ({ value, onChange }: LanguageSelectProps) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[70px] sm:w-[100px] h-9 flex items-center gap-2 bg-transparent">
            <Globe className="w-4 h-4 text-muted-foreground hidden sm:block shrink-0" />
            <SelectValue placeholder="Lang" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="en">EN <span className="text-muted-foreground text-xs hidden sm:inline-block ml-1">(English)</span></SelectItem>
            <SelectItem value="fr">FR <span className="text-muted-foreground text-xs hidden sm:inline-block ml-1">(Français)</span></SelectItem>
            <SelectItem value="es">ES <span className="text-muted-foreground text-xs hidden sm:inline-block ml-1">(Español)</span></SelectItem>
        </SelectContent>
    </Select>
);

// Smart component that handles routing
export function LanguageSwitcher() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { pathname, search } = useLocation();

    function switchLang(nextLang: string) {
        if (nextLang === lang) return;

        // Safely replace only the first segment (the language code)
        const segments = pathname.split("/");
        segments[1] = nextLang;
        const newPath = segments.join("/") + search;

        navigate(newPath, { replace: true });
    }

    return <LanguageSelect value={lang} onChange={switchLang} />;
}