import { useEffect, useState } from "react";
import { ChevronLeft, FileText, UserPlus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

import { PacientesTable } from "@/app/components/PacientesTable";
import SnackbarComponent from "@/app/components/SnackbarComponent";

export function PacienteCard() {
    const navigate = useNavigate();
    const location = useLocation();

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    useEffect(() => {
        const state = location.state as { snackbar?: { message: string; severity: any } } | null;
        if (state?.snackbar) {
            setSnackbar({
                open: true,
                message: state.snackbar.message,
                severity: state.snackbar.severity,
            });
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const handleVoltar = () => {
        navigate("/SecretariaDashboard");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleVoltar}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">Pacientes</h2>
                </div>

                <div className="flex gap-2">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate("/SecretariaDashboard/PacienteCard/VerAtendimentos")}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Atendimentos
                    </Button>

                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => navigate("/SecretariaDashboard/PacienteCard/CadastroPaciente")}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Cadastrar
                    </Button>
                </div>
            </div>

            <PacientesTable />

            <SnackbarComponent
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
}