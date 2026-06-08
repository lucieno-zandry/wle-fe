import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { openDispute } from "~/api/http-requests";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Transaction } from "wle-core";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction;
    onSuccess: () => void;
}

export function DisputeDialog({ open, onOpenChange, transaction, onSuccess }: Props) {
    const { t } = useTranslation("order-details");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await openDispute(transaction.uuid, { reason });
            toast.success(t("disputeDialog.toast.openedTitle"), { description: t("disputeDialog.toast.openedDescription") });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(t("common.error"), { description: t("disputeDialog.toast.openFailed") });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("disputeDialog.title")}</DialogTitle>
                    <DialogDescription>
                        {t("disputeDialog.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="reason">{t("disputeDialog.reasonLabel")}</Label>
                        <Textarea
                            id="reason"
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("disputeDialog.reasonPlaceholder")}
                            rows={4}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t("disputeDialog.opening") : t("disputeDialog.open")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}