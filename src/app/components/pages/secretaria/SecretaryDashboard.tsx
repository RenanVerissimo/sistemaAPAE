import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { AlertTriangle, DatabaseBackup, LogOut, Stethoscope, Users as UsersIcon, FileText } from "lucide-react";
import ProfissionalCard from "./ProfissionalCard";
import { executarBackupManual, getQtdPacientes, getQtdProfissionais } from "@/app/services/api";
import { useEffect, useState } from "react";
import { CadastroProfissionais } from "./CadastroProfissionais";
import { PacienteCard } from "./PacienteCard";
import { CadastroPacientes } from "./CadastroPacientes";
import { VerAtendimentos } from "./VerAtendimentos";
import SnackbarComponent from "../../SnackbarComponent";



interface SecretaryDashboardProps {
  user: any;
  onLogout: () => void;
}

export function SecretaryDashboard({
  user,
  onLogout,
}: SecretaryDashboardProps) {


  const navigate = useNavigate();
  const location = useLocation();

  const [qtdProfissionais, setQtdProfissionais] = useState<number>(0);
  const [qtdPacientes, setQtdPacientes] = useState<number>(0);
  const [fazendoBackup, setFazendoBackup] = useState(false);
  const [modalBackup, setModalBackup] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });


  useEffect(() => {
    const fetchQtd = async () => {
      try {
        const totalPro = await getQtdProfissionais();
        const totalPac = await getQtdPacientes();
        setQtdProfissionais(totalPro);
        setQtdPacientes(totalPac);
      } catch (error) {
        console.error("Erro ao buscar qtd profissionais:", error);
      }
    };

    fetchQtd();
 }, [location.pathname]);

  const handleBackupManual = async () => {
    setModalBackup(false);
    setFazendoBackup(true);
    try {
      await executarBackupManual();
      setSnackbar({
        open: true,
        message: "Backup realizado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao executar backup:", error);
      setSnackbar({
        open: true,
        message: "Erro ao executar backup. Verifique se a pasta de backup esta acessivel.",
        severity: "error",
      });
    } finally {
      setFazendoBackup(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{user.nome}</h1>
            <p className="text-sm text-gray-500">Secretaria</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="cursor-pointer border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <Routes>

        {/* DASHBOARD HOME */}
        <Route
          path="/"
          element={
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 ">

              <h2 className="text-lg font-semibold">
                Visão Geral
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

                {/* CARD PROFISSIONAIS */}
                <Card
                  onClick={() => navigate("ProfissionalCard")}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300"
                >
                  <CardContent className="pt-7 pb-7">
                    <div className="flex items-center justify-between gap-6">

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center shadow-sm">
                          <Stethoscope className="w-6 h-6 text-green-600" />
                        </div>

                        <div>
                          <p className="text-2xl font-bold">{qtdProfissionais}</p>
                          <p className="text-sm text-gray-500">Profissionais</p>
                        </div>
                      </div>

                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* CARD PACIENTES */}
                <Card
                  onClick={() => navigate("PacienteCard")}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300"
                >
                  <CardContent className="pt-7 pb-7">
                    <div className="flex items-center justify-between gap-6">

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                          <UsersIcon className="w-8 h-8 text-purple-600" />
                        </div>

                        <div>
                          <p className="text-2xl font-bold">{qtdPacientes}</p>
                          <p className="text-sm text-gray-500">Pacientes</p>
                        </div>
                      </div>

                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

              </div>

              <div className="pt-64 space-y-4">
                <h2 className="text-lg font-semibold">
                  Backup
                </h2>

                <div className="max-w-3xl mx-auto">
                  <Card className="border-2 border-blue-100 bg-white">
                    <CardContent className="pt-6 pb-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
                            <DatabaseBackup className="w-6 h-6 text-blue-600" />
                          </div>

                          <div>
                            <h3 className="text-base font-semibold">Backup do sistema</h3>
                            <p className="text-sm text-gray-500">
                              Salva dados e laudos na pasta configurada.
                            </p>
                          </div>
                        </div>

                        <Button
                          onClick={() => setModalBackup(true)}
                          disabled={fazendoBackup}
                          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70"
                        >
                          <DatabaseBackup className="w-4 h-4 mr-2" />
                          {fazendoBackup ? "Fazendo backup..." : "Fazer backup"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          }
        />


        <Route path="ProfissionalCard" element={<ProfissionalCard />} />
        <Route path="PacienteCard" element={<PacienteCard />} />
        <Route path="ProfissionalCard/CadastroProfissional" element={<CadastroProfissionais />} />
        <Route path="PacienteCard/CadastroPaciente" element={<CadastroPacientes />} />
        <Route path="PacienteCard/VerAtendimentos" element={<VerAtendimentos />} />
        <Route path="ProfissionalCard/VerAtendimentos" element={<VerAtendimentos />} />

      </Routes>

      {modalBackup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-center mb-3">
              <AlertTriangle className="text-yellow-500 w-12 h-12" />
            </div>

            <h2 className="text-lg font-semibold mb-4 text-center">
              Confirmar backup manual?
            </h2>

            <div className="text-center text-gray-700 border border-yellow-300 rounded-lg px-4 py-3 bg-yellow-50 space-y-2">
              <p>
                O sistema vai salvar uma copia atual dos dados, do banco MySQL e dos laudos.
              </p>
              <p className="font-semibold text-yellow-800">
                Se ja existir backup de hoje, ele sera substituido pelo novo.
              </p>
            </div>

            <div className="text-sm text-gray-600 mt-5 space-y-2">
              <p>Antes de continuar, confirme que:</p>
              <p>- A pasta de backup esta acessivel.</p>
              <p>- O Google Drive esta sincronizando normalmente.</p>
              <p>- O computador nao sera desligado durante o processo.</p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setModalBackup(false)}
                disabled={fazendoBackup}
              >
                Cancelar
              </Button>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleBackupManual}
                disabled={fazendoBackup}
              >
                <DatabaseBackup className="w-4 h-4 mr-2" />
                {fazendoBackup ? "Fazendo backup..." : "Confirmar backup"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </div>
  );
}
