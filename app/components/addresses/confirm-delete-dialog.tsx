import { Form } from "react-router";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "~/components/ui/dialog";
import Button from "../custom-components/button";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

type ConfirmDeleteDialogProps = {
    ids: number[];
    trigger: React.ReactNode;
    isLoading: boolean;
    paragraph?: string;
    cancelText?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export default function ConfirmDeleteDialog({
    ids,
    trigger,
    isLoading = false,
    open,
    onOpenChange,
}: ConfirmDeleteDialogProps) {
    const { t } = useTranslation('addresses');

    const intent = ids.length > 1 ? "bulk-delete" : "delete";
    const itemCount = ids.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent aria-describedby="delete-dialog-description" className="sm:max-w-[425px]">
                <DialogHeader className="gap-2 sm:text-left">
                    <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <DialogTitle className="text-xl">{t('dialog.delete_title')}</DialogTitle>
                    <DialogDescription id="delete-dialog-description" className="text-base">
                        {t('dialog.delete_description')}
                        {itemCount > 1 && (
                            <span className="block mt-2 font-medium text-foreground">
                                {t('dialog.delete_paragraph', itemCount.toString())}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <Form method="post" className="mt-2">
                    <input type="hidden" name="_intent" value={intent} />

                    {ids.length === 1 ? (
                        <input type="hidden" name="id" value={ids[0]} />
                    ) : (
                        ids.map((id) => (
                            <input key={id} type="hidden" name="ids[]" value={id} />
                        ))
                    )}

                    <DialogFooter className="gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="ghost" className="w-full sm:w-auto">{t('cancel')}</Button>
                        </DialogClose>

                        <Button
                            type="submit"
                            variant="destructive"
                            isLoading={isLoading}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? t('dialog.deleting') : t('dialog.confirm_delete')}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}