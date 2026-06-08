import { useState } from "react";
import { useFetcher } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { requestRefund } from "~/api/http-requests";
import { toast } from "sonner";
import { Textarea } from "~/components/ui/textarea";
import { useTranslation } from "react-i18next";
import type { Transaction } from "wle-core";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction;
    onSuccess: () => void;
}

export function RefundRequestDialog({ open, onOpenChange, transaction, onSuccess }: Props) {
    const { t } = useTranslation("order-details");
    const fetcher = useFetcher();
    const [amount, setAmount] = useState<string>(transaction.amount.toString());
    const [reason, setReason] = useState("");

    const isSubmitting = fetcher.state === "submitting";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await requestRefund(transaction.uuid, {
                amount: amount ? parseFloat(amount) : undefined,
                reason,
            });
            toast.success(t("refundDialog.toast.submittedTitle"), { description: t("refundDialog.toast.submittedDescription") });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(t("common.error"), { description: t("refundDialog.toast.submitFailed") });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("refundDialog.title")}</DialogTitle>
                    <DialogDescription>
                        {t("refundDialog.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="amount">{t("refundDialog.amountLabel")}</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={transaction.amount}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={t("refundDialog.amountPlaceholder", { amount: transaction.amount })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{t("refundDialog.amountHint")}</p>
                    </div>
                    <div>
                        <Label htmlFor="reason">{t("refundDialog.reasonLabel")}</Label>
                        <Textarea
                            id="reason"
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("refundDialog.reasonPlaceholder")}
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t("refundDialog.submitting") : t("refundDialog.submit")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}