import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { useCallback } from "react";

type BackButtonProps = {
    path?: string,
    withLabel?: boolean,
}

export default function ({ path, withLabel }: BackButtonProps) {

    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        if (path) {
            navigate(path);
        } else {
            window.history.back();
        }
    }, [path, navigate]);

    return <div className="mb-6">
        <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2"
            onClick={handleClick}
        >
            <ArrowLeft className="w-4 h-4" />
            {withLabel &&
                "Back"}
        </Button>
    </div>
}