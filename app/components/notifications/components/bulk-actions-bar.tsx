import { useNotificationsStore } from "../stores/use-notifications-store";
import {
    bulkMarkAsRead,
    bulkDelete,
    selectAll,
    clearSelection,
} from "../actions/notification-actions";

import { Trash2, MailOpen, X, CheckSquare } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type Props = {
    selectedCount: number;
    allSelected: boolean;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onBulkMarkRead: () => void;
    onBulkDelete: () => void;
    isVisible: boolean;
};

export function BulkActionsBarView({
    selectedCount,
    allSelected,
    onSelectAll,
    onClearSelection,
    onBulkMarkRead,
    onBulkDelete,
    isVisible,
}: Props) {
    return (
        <div
            className={cn(
                "overflow-hidden border-b border-border/50 bg-violet-500/5 px-3 transition-all duration-200",
                isVisible ? "max-h-20 py-2 opacity-100" : "max-h-0 py-0 opacity-0"
            )}
        >
            {/* Row 1 */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onClearSelection}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                >
                    <X className="h-3.5 w-3.5" />
                </button>

                <span className="text-xs font-medium">
                    {selectedCount} selected
                </span>

                <button
                    onClick={onSelectAll}
                    className="ml-auto text-xs text-violet-600 hover:underline"
                >
                    {allSelected ? "Deselect all" : "Select all"}
                </button>
            </div>

            {/* Row 2 */}
            <div className="mt-2 flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs"
                    onClick={onBulkMarkRead}
                >
                    <MailOpen className="mr-1 h-3 w-3" />
                    Read
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs text-rose-600 border-rose-500/30"
                    onClick={onBulkDelete}
                >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                </Button>
            </div>
        </div>
    );
}

export function BulkActionsBar() {
    const { selectedIds, notifications } = useNotificationsStore();
    const selectedArray = Array.from(selectedIds);

    const selectedCount = selectedIds.size;
    const allSelected = !!notifications &&
        notifications.length > 0 && notifications.every((n) => selectedIds.has(n.id));

    function handleSelectAll() {
        if (allSelected) {
            clearSelection();
        } else {
            selectAll();
        }
    }

    function handleBulkMarkRead() {
        bulkMarkAsRead(selectedArray);
    }

    function handleBulkDelete() {
        bulkDelete(selectedArray);
    }

    return (
        <BulkActionsBarView
            selectedCount={selectedCount}
            allSelected={allSelected}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onBulkMarkRead={handleBulkMarkRead}
            onBulkDelete={handleBulkDelete}
            isVisible={selectedCount > 0}
        />
    );
}