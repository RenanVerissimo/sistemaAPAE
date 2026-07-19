import { FileDown, FileUp, Pencil, Power, Trash2 } from "lucide-react";
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
        <div className="flex items-center justify-center gap-0.5 whitespace-nowrap">

            {onLaudo && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Inserir laudo"
                    aria-label="Inserir laudo"
                    onClick={onLaudo}
                    className="h-7 w-6 shrink-0 cursor-pointer border border-transparent p-0 transition-all hover:border-purple-200 hover:bg-purple-50 hover:shadow-sm"
                >
                    <FileUp className="w-4 h-4 text-purple-600" />
                </Button>
            )}

            {onDownload && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Ver e baixar laudos"
                    aria-label="Ver e baixar laudos"
                    onClick={onDownload}
                    className="h-7 w-6 shrink-0 cursor-pointer border border-transparent p-0 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
                >
                    <FileDown className="w-4 h-4 text-blue-600" />
                </Button>
            )}

            {onPower && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Ativar/Desativar"
                    aria-label="Ativar/Desativar"
                    onClick={onPower}
                    className="h-7 w-6 shrink-0 cursor-pointer border border-transparent p-0 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm"
                >
                    <Power className="w-4 h-4 text-emerald-600" />
                </Button>
            )}

            {onEdit && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Editar"
                    aria-label="Editar"
                    onClick={onEdit}
                    className="h-7 w-6 shrink-0 cursor-pointer border border-transparent p-0 transition-all hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-sm"
                >
                    <Pencil className="w-4 h-4 text-yellow-600" />
                </Button>
            )}

            {onDelete && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Excluir"
                    aria-label="Excluir"
                    onClick={onDelete}
                    className="h-7 w-6 shrink-0 cursor-pointer border border-transparent p-0 transition-all hover:border-red-200 hover:bg-red-50 hover:shadow-sm"
                >
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            )}
        </div>
    );
}
