import type { Transaction } from "wle-core";
import { TransactionCard } from "./transaction-card";
import { useTranslation } from "react-i18next";

interface TransactionListProps {
    transactions: Transaction[];
    onActionComplete: () => void; // to refresh data
}

export function TransactionList({ transactions, onActionComplete }: TransactionListProps) {
    const { t } = useTranslation("order-details");
    if (!transactions.length) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("transactions.title")}</h3>
            {transactions.map((tx) => (
                <TransactionCard
                    key={tx.uuid}
                    transaction={tx}
                    onActionComplete={onActionComplete}
                />
            ))}
        </div>
    );
}