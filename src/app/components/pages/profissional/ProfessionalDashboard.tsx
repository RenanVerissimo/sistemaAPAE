import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  LogOut,
  PlusCircle,
  ChevronRight,
  Calendar,
  FileText,
  Users,
  ClipboardList,
} from "lucide-react";
import { Snackbar, Alert } from "@mui/material";

import { CadastroAtendimento } from "./CadastroAtendimento";
import { getAtendimentos, getQtdPacientes } from "@/app/services/api";

import Laudos from "./Laudos";
import { EvolucaoPacientesPage } from "./EvolucaoPacientesPage";

import { HistoricoAtendimentos } from "./HistoricoAtendimentos";
import { User } from "../../interfaces/interfaces";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface ProfessionalDashboardProps {
  user: User;
  onLogout: () => void;
}

export function ProfessionalDashboard({
  user,
  onLogout,
}: ProfessionalDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [atendimentosMes, setAtendimentosMes] = useState(0);
  const [totalPacientes, setTotalPacientes] = useState(0);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const carregarStats = useCallback(async () => {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
      const [atendimentos, qtdPac] = await Promise.all([
        getAtendimentos({
          especialidade: user.especialidade,
          dataInicio: inicioMes,
          dataFim: fimMes,
        }),
        getQtdPacientes(),
      ]);
      setAtendimentosMes(atendimentos.length);
      setTotalPacientes(qtdPac);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  }, [user.especialidade]);

  useEffect(() => {
    if (
      location.pathname === "/ProfissionalDashboard" ||
      location.pathname === "/ProfissionalDashboard/"
    ) {
      carregarStats();
    }
  }, [location.pathname, carregarStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{user.nome}</h1>
            <p className="text-sm text-gray-500 capitalize">
              {user.especialidade}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <Routes>
        {/* DASHBOARD HOME */}
        <Route
          path="/"
          element={
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
              {/* CARD CRIAR NOVO ATENDIMENTO */}
              <Card
                onClick={() => navigate("CadastroAtendimento")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className="w-full flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <PlusCircle className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">Criar Novo Atendimento</h3>
                      <p className="text-sm text-blue-100">
                        Registre um NOVO atendimento
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              {/* CARDS DE ESTATÍSTICAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Atendimentos no mês</p>
                        <p className="text-2xl font-bold">{atendimentosMes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total de pacientes</p>
                        <p className="text-2xl font-bold">{totalPacientes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AÇÕES */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Ações</h2>
                <div className="space-y-4">
                  <Card
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate("HistoricoAtendimentos")}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              Ver Histórico de Atendimentos
                            </p>
                            <p className="text-sm text-gray-500">
                              Visualize todos os atendimentos já criados
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate("LaudosPaciente")}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Laudos</p>
                            <p className="text-sm text-gray-500">
                              Visualize os laudos dos pacientes
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* REGISTRO DE EVOLUÇÃO */}
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Registro de Evolução
                </h2>
                <Card
                  onClick={() => navigate("EvolucaoPaciente")}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg cursor-pointer"
                >
                  <CardContent className="pt-6">
                    <div className="w-full flex items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          Registrar Evolução do Paciente
                        </h3>
                        <p className="text-sm text-emerald-100">
                          Acompanhe o progresso e desenvolvimento do paciente
                        </p>
                      </div>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          }
        />

        {/* SUB-ROTAS */}
        <Route
          path="CadastroAtendimento"
          element={<CadastroAtendimento user={user} setSnackbar={setSnackbar} />}
        />
        <Route
          path="HistoricoAtendimentos"
          element={<HistoricoAtendimentos user={user} />}
        />
        <Route
          path="LaudosPaciente"
          element={
            <Laudos
              onBack={() => navigate("/ProfissionalDashboard")}
              setSnackbar={setSnackbar}
            />
          }
        />
        <Route
          path="EvolucaoPaciente"
          element={
            <EvolucaoPacientesPage
              user={user}
              onBack={() => navigate("/ProfissionalDashboard")}
            />
          }
        />
      </Routes>

      {/* SNACKBAR GLOBAL */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}