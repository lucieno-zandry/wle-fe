import { Link } from "react-router";
import { Calendar, ChevronLeft } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import appPathname from "~/lib/app-pathname";
import { useTranslation } from "react-i18next";
import formatDate from "~/lib/format-date";
import type { Order } from "wle-core";

function OrderHeader({ order, statusConfig }: { order: Order; statusConfig: any }) {
    const { t, i18n } = useTranslation("order-details");
    const locale = i18n.resolvedLanguage === "fr" ? "fr-FR" : "en-US";

    return (
        <div className="flex flex-col gap-4">
            <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-muted-foreground">
                <Link to={appPathname(`/orders`)}><ChevronLeft className="w-4 h-4 mr-1" /> {t("header.backToOrders")}</Link>
            </Button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("header.orderNumber", { id: order.uuid.split("-")[0] })}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{t("header.placedOn", { date: formatDate(order.created_at) })}</span>
                    </div>
                </div>
                <Badge className="w-fit px-4 py-1 text-sm flex items-center gap-2" variant={statusConfig.variant}>
                    <statusConfig.icon className="w-4 h-4" />
                    {t(statusConfig.labelKey)}
                </Badge>
            </div>
        </div>
    );
}

export default OrderHeader;