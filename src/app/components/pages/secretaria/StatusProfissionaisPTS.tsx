import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card } from "@mui/material";
import { getRelatorioPTS, getStatusProfissionaisPTS, StatusProfissionalPTS } from "@/app/services/api";
import { generateAlunoRelatorioPDF } from "@/utils/generateAlunoRelatorioPDF";
import { CheckCircle2, ChevronLeft, Clock, Download, XCircle } from "lucide-react";

type FiltroStatus = "todos" | "concluido" | "parcial" | "pendente";
const PACIENTES_POR_PAGINA = 10;

interface PacienteComStatusPTS {
  pacienteId: number;
  pacienteNome: string;
  profissionais: StatusProfissionalPTS[];
}

function statusFinalizado(status: StatusProfissionalPTS["statusProfPts"]) {
  return Number(status) === 1;
}

function getStatusPaciente(profissionais: StatusProfissionalPTS[]): Exclude<FiltroStatus, "todos"> {
  const totalConcluidos = profissionais.filter((prof) => statusFinalizado(prof.statusProfPts)).length;

  if (totalConcluidos === profissionais.length) return "concluido";
  if (totalConcluidos > 0) return "parcial";
  return "pendente";
}

function getEspecialidadeBadgeColor(especialidade?: string) {
  if (!especialidade) return "bg-gray-100 text-gray-800";

  switch (especialidade.toLowerCase()) {
    case "psiquiatra":
      return "bg-purple-100 text-purple-800";
    case "psicologo":
    case "psicólogo":
      return "bg-blue-100 text-blue-800";
    case "fonoaudiologo":
    case "fonoaudiólogo":
      return "bg-green-100 text-green-800";
    case "to":
      return "bg-orange-100 text-orange-800";
    case "assistente social":
      return "bg-pink-100 text-pink-800";
    case "fisioterapeuta":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function StatusProfissionaisPTS() {
  const navigate = useNavigate();
  const [registrosPTS, setRegistrosPTS] = useState<StatusProfissionalPTS[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("todos");
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [buscaProfissional, setBuscaProfissional] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [baixandoRelatorio, setBaixandoRelatorio] = useState<string | null>(null);
  const [erroRelatorio, setErroRelatorio] = useState<string | null>(null);

  useEffect(() => {
    const carregarStatus = async () => {
      setCarregando(true);
      try {
        const data = await getStatusProfissionaisPTS();
        setRegistrosPTS(data);
      } finally {
        setCarregando(false);
      }
    };

    carregarStatus();
  }, []);

  const pacientesAgrupadosTodos = useMemo(() => {
    const grupos = new Map<number, PacienteComStatusPTS>();

    registrosPTS.forEach((registro) => {
      const grupoExistente = grupos.get(registro.pacienteId);

      if (grupoExistente) {
        grupoExistente.profissionais.push(registro);
        return;
      }

      grupos.set(registro.pacienteId, {
        pacienteId: registro.pacienteId,
        pacienteNome: registro.pacienteNome,
        profissionais: [registro],
      });
    });

    return Array.from(grupos.values());
  }, [registrosPTS]);

  const resumoStatus = useMemo(() => {
    return pacientesAgrupadosTodos.reduce(
      (acc, paciente) => {
        const statusPaciente = getStatusPaciente(paciente.profissionais);
        acc[statusPaciente] += 1;
        return acc;
      },
      { concluido: 0, parcial: 0, pendente: 0 }
    );
  }, [pacientesAgrupadosTodos]);

  const pacientesAgrupados = useMemo(() => {
    const termoPaciente = buscaPaciente.trim().toLowerCase();
    const termoProfissional = buscaProfissional.trim().toLowerCase();

    return pacientesAgrupadosTodos.filter((paciente) => {
      const statusPaciente = getStatusPaciente(paciente.profissionais);
      const pacienteEncontrado = paciente.pacienteNome.toLowerCase().includes(termoPaciente);
      const profissionalEncontrado = paciente.profissionais.some((profissional) =>
        profissional.profissionalNome.toLowerCase().includes(termoProfissional)
      );

      return (filtro === "todos" || statusPaciente === filtro) && pacienteEncontrado && profissionalEncontrado;
    });
  }, [buscaPaciente, buscaProfissional, filtro, pacientesAgrupadosTodos]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaPaciente, buscaProfissional, filtro]);

  const totalPaginas = Math.max(1, Math.ceil(pacientesAgrupados.length / PACIENTES_POR_PAGINA));
  const pacientesPaginados = pacientesAgrupados.slice(
    (paginaAtual - 1) * PACIENTES_POR_PAGINA,
    paginaAtual * PACIENTES_POR_PAGINA
  );

  const baixarRelatorioPTS = async (pacienteId: number, profissionalId: number) => {
    const downloadKey = `${pacienteId}-${profissionalId}`;
    setBaixandoRelatorio(downloadKey);
    setErroRelatorio(null);

    try {
      const relatorio = await getRelatorioPTS(pacienteId, profissionalId);
      generateAlunoRelatorioPDF(relatorio);
    } catch (error) {
      console.error("Erro ao baixar relatorio PTS:", error);
      setErroRelatorio(
        error instanceof Error ? error.message : "Nao foi possivel baixar o relatorio PTS."
      );
    } finally {
      setBaixandoRelatorio(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/SecretariaDashboard/ProfissionalCard")}
          title="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div>
          <h2 className="text-lg font-semibold"> Controle de PTS dos Profissionais</h2>
          <p className="text-sm text-gray-500">
            Controle de PTS por paciente e profissional responsável.
          </p>
        </div>
      </div>

      <div className="flex max-w-full flex-col gap-3 rounded-lg border border-gray-300 bg-white px-3 py-3 shadow-sm">
        <span className="inline-flex w-fit rounded-md bg-blue-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Filtros:
        </span>
        <div className="grid gap-3">
          <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
            <p className="mb-3 inline-flex rounded-md bg-gray-800 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Busca
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
                value={buscaPaciente}
                onChange={(e) => setBuscaPaciente(e.target.value)}
                placeholder="Filtrar por paciente"
              />
              <input
                className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
                value={buscaProfissional}
                onChange={(e) => setBuscaProfissional(e.target.value)}
                placeholder="Filtrar por profissional"
              />
            </div>
          </div>

          <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
            <p className="mb-3 inline-flex rounded-md bg-gray-800 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Status do paciente
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filtro === "todos" ? "default" : "outline"}
                onClick={() => setFiltro("todos")}
              >
                Todos ({pacientesAgrupadosTodos.length})
              </Button>
              <Button
                variant={filtro === "concluido" ? "default" : "outline"}
                onClick={() => setFiltro("concluido")}
                className={filtro === "concluido" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Concluido ({resumoStatus.concluido})
              </Button>
              <Button
                variant={filtro === "parcial" ? "default" : "outline"}
                onClick={() => setFiltro("parcial")}
                className={filtro === "parcial" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
              >
                <Clock className="w-4 h-4 mr-2" />
                Concluido parcialmente ({resumoStatus.parcial})
              </Button>
              <Button
                variant={filtro === "pendente" ? "default" : "outline"}
                onClick={() => setFiltro("pendente")}
                className={filtro === "pendente" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Pendente ({resumoStatus.pendente})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {erroRelatorio && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {erroRelatorio}
        </div>
      )}

      <Card className="rounded-xl overflow-hidden shadow-md border border-gray-200">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed text-sm">
            <thead className="bg-gray-300 border-b">
              <tr>
                <th className="w-[28%] px-3 py-2 text-left font-semibold">Paciente</th>
                <th className="w-[72%] px-3 py-2 text-left font-semibold">Status PTS por profissional</th>
              </tr>
            </thead>
            <tbody>
              {carregando && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    Carregando status dos PTS...
                  </td>
                </tr>
              )}

              {!carregando && pacientesAgrupados.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    Nenhum PTS encontrado para este filtro.
                  </td>
                </tr>
              )}

              {!carregando &&
                pacientesPaginados.map((paciente) => (
                  <tr key={paciente.pacienteId} className="border-b hover:bg-gray-100 align-top">
                    <td className="px-3 py-3 text-left font-semibold text-gray-800 break-words">
                      {paciente.pacienteNome}
                    </td>
                    <td className="px-3 py-3">
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {paciente.profissionais.map((profissional) => {
                          const finalizado = statusFinalizado(profissional.statusProfPts);

                          return (
                            <div
                              key={`${paciente.pacienteId}-${profissional.profissionalId}`}
                              className={`flex min-h-[78px] items-start gap-2 rounded-md border px-3 py-2 ${
                                finalizado
                                  ? "border-green-200 bg-green-50"
                                  : "border-red-200 bg-red-50"
                              }`}
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  {finalizado ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-700" />
                                  ) : (
                                    <XCircle className="h-4 w-4 shrink-0 text-red-700" />
                                  )}
                                  <span className="font-medium text-gray-800 break-words">
                                    {profissional.profissionalNome}
                                  </span>
                                  <span
                                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${getEspecialidadeBadgeColor(
                                      profissional.especialidade
                                    )}`}
                                  >
                                    {profissional.especialidade || "-"}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  <span>{profissional.registroProfissional || "Sem registro"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${
                                      finalizado
                                        ? "border-green-300 bg-green-100 text-green-800"
                                        : "border-red-300 bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {finalizado ? "Concluido" : "Pendente"}
                                  </span>
                                  {finalizado && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 border-green-300 bg-white p-0 text-green-700 hover:bg-green-100"
                                      disabled={
                                        baixandoRelatorio ===
                                        `${paciente.pacienteId}-${profissional.profissionalId}`
                                      }
                                      onClick={() =>
                                        baixarRelatorioPTS(
                                          paciente.pacienteId,
                                          profissional.profissionalId
                                        )
                                      }
                                      title="Baixar relatorio PTS"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {!carregando && pacientesAgrupados.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-gray-600">
            Mostrando {pacientesPaginados.length} de {pacientesAgrupados.length} pacientes
          </span>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
              disabled={paginaAtual === 1}
            >
              Anterior
            </Button>
            <span className="min-w-[96px] text-center font-medium text-gray-700">
              Pagina {paginaAtual} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
              disabled={paginaAtual === totalPaginas}
            >
              Proxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
