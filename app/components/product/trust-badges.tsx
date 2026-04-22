import { Truck, ShieldCheck } from "lucide-react";

type Props = {
    t: (key: string) => string;
};

export function TrustBadges({ t }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <div className="text-[11px] leading-tight font-bold text-foreground">
                    {t("freeShipping")}
                    <br />
                    <span className="text-muted-foreground font-medium">{t("freeShippingDesc")}</span>
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
                <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                <div className="text-[11px] leading-tight font-bold text-foreground">
                    {t("warranty")}
                    <br />
                    <span className="text-muted-foreground font-medium">{t("warrantyDesc")}</span>
                </div>
            </div>
        </div>
    );
}