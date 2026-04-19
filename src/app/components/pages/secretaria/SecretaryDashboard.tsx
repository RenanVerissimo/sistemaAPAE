import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { LogOut, Stethoscope, Users as UsersIcon, FileText } from "lucide-react";
import ProfissionalCard from "./ProfissionalCard";
import { getAllPacientes, getAllProfissionais, getQtdPacientes, getQtdProfissionais } from "@/app/services/api";
import { useEffect, useState } from "react";
import { CadastroProfissionais } from "./CadastroProfissionais";
import { PacienteCard } from "./PacienteCard";
import { CadastroPacientes } from "./CadastroPacientes";
import { VerRelatorios } from "./VerRelatorios";



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


  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{user.nome}</h1>
            <p className="text-sm text-gray-500">Secretaria</p>
          </div>

          <Button variant="ghost" size="sm" onClick={onLogout}>
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
            </div>
          }
        />


        <Route path="ProfissionalCard" element={<ProfissionalCard />} />
        <Route path="PacienteCard" element={<PacienteCard />} />
        <Route path="ProfissionalCard/CadastroProfissional" element={<CadastroProfissionais />} />
        <Route path="PacienteCard/CadastroPaciente" element={<CadastroPacientes />} />
        <Route path="PacienteCard/VerRelatorios" element={<VerRelatorios />} />
        <Route path="ProfissionalCard/VerRelatorios" element={<VerRelatorios />} />

      </Routes>
    </div>
  );
}