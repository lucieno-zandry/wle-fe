import { useParams, useNavigate, useLocation } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Globe } from "lucide-react";

const LANGUAGES = [
    { code: "en", label: "English", native: "English" },
    { code: "fr", label: "Français", native: "Français" },
    { code: "es", label: "Español", native: "Español" },
];

const NavbarLanguageSelect = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[70px] sm:w-[100px] h-9 flex items-center gap-2 bg-transparent">
            <Globe className="w-4 h-4 text-muted-foreground hidden sm:block shrink-0" />
            <SelectValue placeholder="Lang" />
        </SelectTrigger>
        <SelectContent>
            {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                    {lang.code.toUpperCase()}{" "}
                    <span className="text-muted-foreground text-xs hidden sm:inline-block ml-1">
                        ({lang.native})
                    </span>
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

const DropdownLanguageSelect = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>Language</span>
        </div>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                        {lang.code.toUpperCase()} ({lang.native})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

export const LanguageSwitcher = ({ type = "navbar" }: { type?: "navbar" | "dropdown" }) => {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { pathname, search } = useLocation();

    const switchLang = (nextLang: string) => {
        if (nextLang === lang) return;
        const segments = pathname.split("/");
        segments[1] = nextLang;
        const newPath = segments.join("/") + search;
        navigate(newPath, { replace: true });
    };

    const Component = type === "dropdown" ? DropdownLanguageSelect : NavbarLanguageSelect;
    return <Component value={lang || "en"} onChange={switchLang} />;
};