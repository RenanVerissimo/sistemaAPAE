import { Pencil, Trash2, Power, FileDown } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface TableActionsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onPower?: () => void;
    onDownload?: () => void;
    onLaudo?: () => void;
}

export function TableActions({
    onEdit,
    onDelete,
    onPower,
    onDownload,
    onLaudo
}: TableActionsProps) {
    return (
        <div className="flex justify-center gap-2">

            {onDownload && (
                <Button variant="ghost" size="sm" onClick={onDownload}>
                    <FileDown className="w-4 h-4" />
                </Button>
            )}

            {onPower && (
                <Button variant="ghost" size="sm" onClick={onPower}>
                    <Power className="w-4 h-4" />
                </Button>
            )}

            {onEdit && (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )}

            {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            )}

            {onLaudo && (
                <Button variant="ghost" size="sm" onClick={onLaudo}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            )}


        </div>
    );
}