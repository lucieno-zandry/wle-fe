import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

type Props = {
  message: string;
  onRetry: () => void;
};

export function NotificationsErrorView({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
        <AlertTriangle className="h-7 w-7 text-rose-500" />
      </div>

      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          Failed to load notifications
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="gap-2"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}