import { Button } from "../ui/button";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-destructive">{message}</p>
            {onRetry && (
                <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </div>
    );
}