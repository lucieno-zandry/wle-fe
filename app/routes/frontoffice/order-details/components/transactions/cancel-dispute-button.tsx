import { Button } from "~/components/ui/button";
import { cancelDispute } from "~/api/http-requests";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Transaction } from "wle-core";

export function CancelDisputeButton({ transaction, onComplete }: { transaction: Transaction; onComplete: () => void }) {
    const { t } = useTranslation("order-details");
    const [isLoading, setIsLoading] = useState(false);

    const handleCancel = async () => {
        setIsLoading(true);
        try {
            await cancelDispute(transaction.uuid);
            toast.success(t("cancelDispute.toast.cancelledTitle"), { description: t("cancelDispute.toast.cancelledDescription") });
            onComplete();
        } catch (error) {
            toast(t("common.error"), { description: t("cancelDispute.toast.cancelFailed") });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button size="sm" variant="outline" onClick={handleCancel} disabled={isLoading}>
            {isLoading ? t("cancelDispute.cancelling") : t("cancelDispute.cancel")}
        </Button>
    );
}