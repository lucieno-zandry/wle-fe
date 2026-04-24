import * as LucideIcons from "lucide-react";

interface LucideIconProps {
    name: string;
    className?: string;
    strokeWidth?: number;
}

export const LucideIcon = ({ name, className, strokeWidth = 1.5 }: LucideIconProps) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) {
        console.warn(`Icon "${name}" not found, falling back to Sprout`);
        return <LucideIcons.Sprout className={className} strokeWidth={strokeWidth} />;
    }
    return <IconComponent className={className} strokeWidth={strokeWidth} />;
};