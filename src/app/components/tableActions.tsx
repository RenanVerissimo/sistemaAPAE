import { FileText, Pencil, Trash2, Power, FileDown } from "lucide-react";
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
                <Button
                    variant="ghost"
                    size="sm"
                    title="Download/Visualizar Laudo"
                    onClick={onDownload}
                    className="cursor-pointer border border-transparent transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm hover:scale-105"
                >
                    <FileDown className="w-4 h-4 text-blue-600" />
                </Button>
            )}

            {onPower && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Ativar/Desativar"
                    onClick={onPower}
                    className="cursor-pointer border border-transparent transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm hover:scale-105"
                >
                    <Power className="w-4 h-4 text-emerald-600" />
                </Button>
            )}

            {onEdit && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Editar"
                    onClick={onEdit}
                    className="cursor-pointer border border-transparent transition-all hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-sm hover:scale-105"
                >
                    <Pencil className="w-4 h-4 text-yellow-600" />
                </Button>
            )}

            {onDelete && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Excluir"
                    onClick={onDelete}
                    className="cursor-pointer border border-transparent transition-all hover:border-red-200 hover:bg-red-50 hover:shadow-sm hover:scale-105"
                >
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            )}

            {onLaudo && (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Enviar Laudo"
                    onClick={onLaudo}
                    className="cursor-pointer border border-transparent transition-all hover:border-purple-200 hover:bg-purple-50 hover:shadow-sm hover:scale-105"
                >
                    <FileText className="w-4 h-4 text-purple-600" />
                </Button>
            )}


        </div>
    );
}
