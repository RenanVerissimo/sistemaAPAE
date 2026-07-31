import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card } from "@mui/material";
import {
  ControlePTSRegistro,
  RelatorioPTSData,
  getControlePTS,
  getRelatorioPTS,
  iniciarNovoCicloPTS,
} from "@/app/services/api";
import { generateAlunoRelatorioPDF, generateAlunoRelatoriosPDF } from "@/utils/generateAlunoRelatorioPDF";
import { AlertTriangle, CheckCircle2, ChevronLeft, Clock, Download, XCircle } from "lucide-react";

type FiltroStatus = "todos" | "concluido" | "parcial" | "pendente";
const PACIENTES_POR_PAGINA = 10;

interface PacienteComControlePTS {
  pacienteId: number;
  pacienteNome: string;
  profissionais: ControlePTSRegistro[];
}

function statusFinalizado(status: ControlePTSRegistro["statusProfPts"]) {
  return Number(status) === 1;
}

function getStatusPaciente(profissionais: ControlePTSRegistro[]): Exclude<FiltroStatus, "todos"> {
  const totalConcluidos = profissionais.filter((prof) => statusFinalizado(prof.statusProfPts)).length;

  if (totalConcluidos === profissionais.length) return "concluido";
  if (totalConcluidos > 0) return "parcial";
  return "pendente";
}

function contarRelatoriosConcluidos(profissionais: ControlePTSRegistro[]) {
  return profissionais.filter((profissional) => statusFinalizado(profissional.statusProfPts)).length;
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

function formatarNomeArquivo(valor?: string) {
  return (valor || "sem_nome")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export default function ControlePTS() {
  const navigate = useNavigate();
  const [registrosPTS, setRegistrosPTS] = useState<ControlePTSRegistro[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("todos");
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [baixandoRelatorio, setBaixandoRelatorio] = useState<string | null>(null);
  const [erroRelatorio, setErroRelatorio] = useState<string | null>(null);
  const [anoReferencia, setAnoReferencia] = useState(new Date().getFullYear());
  const [modalNovoCiclo, setModalNovoCiclo] = useState(false);
  const [iniciandoCiclo, setIniciandoCiclo] = useState(false);
  const [mensagemCiclo, setMensagemCiclo] = useState<string | null>(null);
  const anoAtual = new Date().getFullYear();
  const proximoAnoReferencia = anoReferencia + 1;
  const podeIniciarNovoCiclo = anoReferencia === anoAtual;

  useEffect(() => {
    const carregarStatus = async () => {
      setCarregando(true);
      try {
        const data = await getControlePTS(anoReferencia);
        setRegistrosPTS(data);
      } finally {
        setCarregando(false);
      }
    };

    carregarStatus();
  }, [anoReferencia]);

  const pacientesAgrupadosTodos = useMemo(() => {
    const grupos = new Map<number, PacienteComControlePTS>();

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

    return pacientesAgrupadosTodos.filter((paciente) => {
      const statusPaciente = getStatusPaciente(paciente.profissionais);
      const pacienteEncontrado = paciente.pacienteNome.toLowerCase().includes(termoPaciente);

      return (filtro === "todos" || statusPaciente === filtro) && pacienteEncontrado;
    });
  }, [buscaPaciente, filtro, pacientesAgrupadosTodos]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaPaciente, filtro]);

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
      const dataFormatada = new Date().toISOString().split("T")[0];
      generateAlunoRelatorioPDF({
        ...relatorio,
        nomeArquivo: `relatorio_pts_${formatarNomeArquivo(relatorio.aluno?.nome)}_${formatarNomeArquivo(
          relatorio.profissional?.nome
        )}_${dataFormatada}.pdf`,
      });
    } catch (error) {
      console.error("Erro ao baixar relatorio PTS:", error);
      setErroRelatorio(
        error instanceof Error ? error.message : "Nao foi possivel baixar o relatorio PTS."
      );
    } finally {
      setBaixandoRelatorio(null);
    }
  };

  const baixarRelatoriosPaciente = async (paciente: PacienteComControlePTS) => {
    const profissionaisConcluidos = paciente.profissionais.filter((profissional) =>
      statusFinalizado(profissional.statusProfPts)
    );

    if (profissionaisConcluidos.length === 0) {
      setErroRelatorio("Este paciente ainda nao possui relatorios PTS concluidos para download.");
      return;
    }

    const downloadKey = `paciente-${paciente.pacienteId}`;
    setBaixandoRelatorio(downloadKey);
    setErroRelatorio(null);

    try {
      const dataFormatada = new Date().toISOString().split("T")[0];
      const relatorios: RelatorioPTSData[] = [];

      for (const profissional of profissionaisConcluidos) {
        const relatorio = await getRelatorioPTS(paciente.pacienteId, profissional.profissionalId);
        relatorios.push(relatorio);
      }

      generateAlunoRelatoriosPDF(
        relatorios,
        `relatorios_pts_${formatarNomeArquivo(paciente.pacienteNome)}_${dataFormatada}.pdf`
      );
    } catch (error) {
      console.error("Erro ao baixar relatorios PTS do paciente:", error);
      setErroRelatorio(
        error instanceof Error ? error.message : "Nao foi possivel baixar todos os relatorios PTS."
      );
    } finally {
      setBaixandoRelatorio(null);
    }
  };

  const confirmarNovoCiclo = async () => {
    setIniciandoCiclo(true);
    setMensagemCiclo(null);

    try {
      await iniciarNovoCicloPTS(proximoAnoReferencia);
      setAnoReferencia(proximoAnoReferencia);
      setFiltro("todos");
      setBuscaPaciente("");
      setPaginaAtual(1);
      setModalNovoCiclo(false);
      setMensagemCiclo(`Ciclo PTS ${proximoAnoReferencia} iniciado com sucesso.`);
    } catch (error) {
      setMensagemCiclo(
        error instanceof Error ? error.message : "Nao foi possivel iniciar o novo ciclo PTS."
      );
    } finally {
      setIniciandoCiclo(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
              Controle de PTS por paciente e profissional responsável. Ciclo {anoReferencia}.
            </p>
          </div>
        </div>

        {podeIniciarNovoCiclo && (
          <Button
            type="button"
            className="bg-blue-700 text-white hover:bg-blue-800"
            onClick={() => {
              setMensagemCiclo(null);
              setModalNovoCiclo(true);
            }}
          >
            Iniciar novo ciclo PTS
          </Button>
        )}
      </div>

      {mensagemCiclo && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
          {mensagemCiclo}
        </div>
      )}

      <div className="flex max-w-full flex-col gap-3 rounded-lg border border-gray-300 bg-white px-3 py-3 shadow-sm">
        <span className="inline-flex w-fit rounded-md bg-blue-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Filtros:
        </span>
        <div className="grid gap-3">
          <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
            <p className="mb-3 inline-flex rounded-md bg-gray-800 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Busca
            </p>
            <div className="grid gap-2">
              <input
                className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
                value={buscaPaciente}
                onChange={(e) => setBuscaPaciente(e.target.value)}
                placeholder="Filtrar por paciente"
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
          <table className="w-full min-w-[820px] table-fixed text-sm">
            <thead className="bg-gray-300 border-b">
              <tr>
                <th className="w-[24%] px-3 py-2 text-left font-semibold">Paciente</th>
                <th className="w-[68%] px-3 py-2 text-left font-semibold">Status PTS por profissional</th>
                <th className="w-[8%] px-2 py-2 text-center font-semibold">Baixar PTS</th>
              </tr>
            </thead>
            <tbody>
              {carregando && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    Carregando status dos PTS...
                  </td>
                </tr>
              )}

              {!carregando && pacientesAgrupados.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    Nenhum PTS encontrado para este filtro.
                  </td>
                </tr>
              )}

              {!carregando &&
                pacientesPaginados.map((paciente) => {
                  const totalRelatoriosConcluidos = contarRelatoriosConcluidos(paciente.profissionais);
                  const possuiRelatorioConcluido = totalRelatoriosConcluidos > 0;
                  const baixandoPaciente = baixandoRelatorio === `paciente-${paciente.pacienteId}`;
                  const textoRelatorio =
                    totalRelatoriosConcluidos === 1 ? "1 relatorio PTS" : `${totalRelatoriosConcluidos} relatorios PTS`;

                  return (
                    <tr key={paciente.pacienteId} className="border-b hover:bg-gray-100 align-top">
                      <td className="px-3 py-2 text-left font-semibold text-gray-800 break-words">
                        {paciente.pacienteNome}
                      </td>
                      <td className="px-3 py-2">
                        <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                          {paciente.profissionais.map((profissional) => {
                            const finalizado = statusFinalizado(profissional.statusProfPts);

                            return (
                              <div
                                key={`${paciente.pacienteId}-${profissional.profissionalId}`}
                                className={`flex items-start gap-2 rounded-md border px-2 py-1.5 ${finalizado
                                    ? "border-green-200 bg-green-50"
                                    : "border-red-200 bg-red-50"
                                  }`}
                              >
                                {finalizado ? (
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                                ) : (
                                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-semibold leading-snug text-gray-800 break-words">
                                      {profissional.profissionalNome}
                                    </span>
                                    <span
                                      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold leading-none ${finalizado
                                          ? "border-green-300 bg-green-100 text-green-800"
                                          : "border-red-300 bg-red-100 text-red-800"
                                        }`}
                                    >
                                      {finalizado ? "Concluído" : "Pendente"}
                                    </span>
                                  </div>

                                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] leading-tight text-gray-600">
                                    <span
                                      className={`rounded px-1.5 py-0.5 font-medium ${getEspecialidadeBadgeColor(
                                        profissional.especialidade
                                      )}`}
                                    >
                                      {profissional.especialidade || "-"}
                                    </span>
                                    <span className="truncate">{profissional.registroProfissional || "Sem registro"}</span>
                                  </div>
                                </div>

                                {finalizado && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 shrink-0 border-green-300 bg-white p-0 text-green-700 hover:bg-green-100"
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
                                    title="Baixar relatorio PTS deste profissional"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={`mx-auto h-9 min-w-9 rounded-md px-2 transition-colors ${possuiRelatorioConcluido
                              ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                              : "border-gray-200 bg-gray-50 text-gray-300"
                            }`}
                          disabled={!possuiRelatorioConcluido || baixandoPaciente}
                          onClick={() => baixarRelatoriosPaciente(paciente)}
                          title={
                            possuiRelatorioConcluido
                              ? `Baixar ${textoRelatorio} concluido${totalRelatoriosConcluidos === 1 ? "" : "s"} deste paciente`
                              : "Nenhum relatorio PTS concluido para este paciente"
                          }
                        >
                          <Download className={`h-4 w-4 ${baixandoPaciente ? "animate-pulse" : ""}`} />
                          {possuiRelatorioConcluido && (
                            <span className="ml-1 text-xs font-bold leading-none">{totalRelatoriosConcluidos}</span>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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

      {modalNovoCiclo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex flex-col items-center rounded-md border border-amber-200 bg-amber-50 p-4 text-center text-amber-900">
              <div className="flex items-center justify-center gap-3">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-700" />
                <h3 className="text-lg font-semibold">Iniciar novo ciclo PTS?</h3>
              </div>
              <div className="w-full max-w-md">
                <p className="mt-3 rounded-md border border-amber-200 bg-white/80 px-3 py-2 text-center text-sm font-bold leading-relaxed text-amber-950 shadow-sm">
                  Ao confirmar, o ciclo {proximoAnoReferencia} será iniciado.
                </p>
                <p className="mt-2 rounded-md border border-amber-200 bg-white/80 px-3 py-2 text-center text-sm font-bold leading-relaxed text-amber-950 shadow-sm">Os relatórios realizados pelos profissionais do ano {anoReferencia} serão preservados.</p>
              </div>
            </div>

            <div className="space-y-2 rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-950 shadow-sm">
              <p className="font-bold leading-relaxed">Esta ação criará o ciclo PTS {proximoAnoReferencia} como pendente para os pacientes ativos e profissionais cadastrados.  </p>

            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalNovoCiclo(false)}
                disabled={iniciandoCiclo}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-blue-700 text-white hover:bg-blue-800"
                onClick={confirmarNovoCiclo}
                disabled={iniciandoCiclo}
              >
                {iniciandoCiclo ? "Iniciando..." : `Sim, iniciar ciclo ${proximoAnoReferencia}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
