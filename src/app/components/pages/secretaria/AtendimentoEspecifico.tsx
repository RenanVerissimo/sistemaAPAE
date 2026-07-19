import { PacientesTableAtendimentoEspecifico } from "@/app/components/PacientesTableAtendimentoEspecifico";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AtendimentoEspecifico() {

    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <h2 className="text-lg font-semibold">Atendimentos Específicos - PROFISSIONAL</h2>
            </div>
            <PacientesTableAtendimentoEspecifico />
        </div>
    );
}
