import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ArrowLeft, ArrowRight, FileDown, Save, Search as SearchIcon } from 'lucide-react';
import { Badge } from "@/app/components/ui/badge";
import { generateAlunoRelatorioPDF } from "@/utils/generateAlunoRelatorioPDF";
import { getAllPacientes, getRegistroEvolucao, salvarRegistroEvolucao } from "@/app/services/api";
import { Relatorio, User, Paciente } from '../../interfaces/interfaces';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface EvolucaoPacientesPageProps {
  user: User;
  onBack: () => void;
  setSnackbar: Dispatch<SetStateAction<SnackbarState>>;
}

type AcaoPendente = "voltar" | "pdf" | null;

export function EvolucaoPacientesPage({ user, onBack, setSnackbar }: EvolucaoPacientesPageProps) {
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const [searchPaciente, setSearchPaciente] = useState('');
  const [relatorios] = useState<Relatorio[]>([]);

  const [historicoClinico, setHistoricoClinico] = useState('');
  const [objetivoDoTratamento, setObjetivoDoTratamento] = useState('');
  const [tecEProcAplicados, setTecEProcAplicados] = useState('');
  const [evolucaoRetrocessoDoPaciente, setEvolucaoRetrocessoDoPaciente] = useState('');
  const [recomendacoesFinais, setRecomendacoesFinais] = useState('');
  const [carregandoRegistro, setCarregandoRegistro] = useState(false);
  const [salvandoRegistro, setSalvandoRegistro] = useState(false);
  const [registroAlterado, setRegistroAlterado] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState<AcaoPendente>(null);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [pageView, setPageView] = useState<"lista" | "registro">("lista");
  const [showDescricaoModal, setShowDescricaoModal] = useState(false);
  const [descricaoSelecionada, setDescricaoSelecionada] = useState("");

  useEffect(() => {
    const carregarPacientes = async () => {
      try {
        const lista: Paciente[] = await getAllPacientes();
        setPacientes(lista);
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
      }
    };
    carregarPacientes();
  }, []);

  useEffect(() => {
    const bloquearSaidaComAlteracoes = (event: BeforeUnloadEvent) => {
      if (!registroAlterado) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", bloquearSaidaComAlteracoes);
    return () => window.removeEventListener("beforeunload", bloquearSaidaComAlteracoes);
  }, [registroAlterado]);

  const limparCamposRegistro = () => {
    setHistoricoClinico('');
    setObjetivoDoTratamento('');
    setTecEProcAplicados('');
    setEvolucaoRetrocessoDoPaciente('');
    setRecomendacoesFinais('');
    setRegistroAlterado(false);
  };

  const marcarCampoAlterado = (atualizarCampo: (valor: string) => void, valor: string) => {
    atualizarCampo(valor);
    setRegistroAlterado(true);
  };

  const abrirRegistroPaciente = async (paciente: Paciente) => {
    const profissionalId = Number(user.id);

    setPacienteSelecionado(paciente);
    setPageView("registro");
    limparCamposRegistro();

    if (!profissionalId) {
      setSnackbar({
        open: true,
        message: "ID do profissional inválido. Faça login novamente.",
        severity: "error",
      });
      return;
    }

    setCarregandoRegistro(true);
    try {
      const registro = await getRegistroEvolucao(paciente.id, profissionalId);

      setHistoricoClinico(registro?.historicoClinico ?? '');
      setObjetivoDoTratamento(registro?.objetivosTratamento ?? '');
      setTecEProcAplicados(registro?.tecnicasProcedimentos ?? '');
      setEvolucaoRetrocessoDoPaciente(registro?.evolucaoPaciente ?? '');
      setRecomendacoesFinais(registro?.recomendacoesFinais ?? '');
      setRegistroAlterado(false);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Erro ao carregar o registro de evolução.",
        severity: "error",
      });
    } finally {
      setCarregandoRegistro(false);
    }
  };

  const salvarRegistroAtual = async (opcoes?: {
    mostrarMensagem?: boolean;
    somenteSeAlterado?: boolean;
  }) => {
    const mostrarMensagem = opcoes?.mostrarMensagem ?? true;

    if (opcoes?.somenteSeAlterado && !registroAlterado) {
      return true;
    }

    if (!pacienteSelecionado) return false;

    const profissionalId = Number(user.id);
    if (!profissionalId) {
      setSnackbar({
        open: true,
        message: "ID do profissional inválido. Faça login novamente.",
        severity: "error",
      });
      return false;
    }

    setSalvandoRegistro(true);
    try {
      await salvarRegistroEvolucao(pacienteSelecionado.id, {
        profissional_id: profissionalId,
        historicoClinico,
        objetivosTratamento: objetivoDoTratamento,
        tecnicasProcedimentos: tecEProcAplicados,
        evolucaoPaciente: evolucaoRetrocessoDoPaciente,
        recomendacoesFinais,
      });

      setRegistroAlterado(false);

      if (mostrarMensagem) {
        setSnackbar({
          open: true,
          message: "Projeto Terapêutico Singular (PTS) salvo com sucesso!",
          severity: "success",
        });
      }

      return true;
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar o registro de evolução.",
        severity: "error",
      });
      return false;
    } finally {
      setSalvandoRegistro(false);
    }
  };

  const gerarPdfAtual = () => {
    if (!pacienteSelecionado) return;

    generateAlunoRelatorioPDF({
      aluno: pacienteSelecionado,
      profissional: user,
      campos: {
        historicoClinico,
        objetivos: objetivoDoTratamento,
        tecnicas: tecEProcAplicados,
        evolucao: evolucaoRetrocessoDoPaciente,
        recomendacoes: recomendacoesFinais,
      }
    });
  };

  const executarAcao = (acao: Exclude<AcaoPendente, null>) => {
    if (acao === "voltar") {
      setPageView("lista");
      return;
    }

    gerarPdfAtual();
  };

  const solicitarAcao = (acao: Exclude<AcaoPendente, null>) => {
    if (registroAlterado) {
      setAcaoPendente(acao);
      return;
    }

    executarAcao(acao);
  };

  const cancelarAcaoPendente = () => {
    setAcaoPendente(null);
  };

  const continuarSemSalvar = () => {
    if (!acaoPendente) return;

    const acao = acaoPendente;
    setAcaoPendente(null);
    if (acao === "voltar") {
      setRegistroAlterado(false);
    }
    executarAcao(acao);
  };

  const salvarEContinuar = async () => {
    if (!acaoPendente) return;

    const acao = acaoPendente;
    const salvou = await salvarRegistroAtual({ mostrarMensagem: false });

    if (!salvou) return;

    setAcaoPendente(null);
    executarAcao(acao);
    setSnackbar({
      open: true,
      message: "Projeto Terapêutico Singular (PTS) salvo com sucesso!",
      severity: "success",
    });
  };



  const pacientesFiltrados = pacientes.filter((paciente) => {
    const ativo = (paciente.status || "").toLowerCase() === "ativo";
    if (!ativo) return false;

    const termo = searchPaciente.toLowerCase();
    return (
      paciente.nome.toLowerCase().includes(termo) ||
      (paciente.cpf && paciente.cpf.includes(searchPaciente)) ||
      (paciente.cartaoSUS && paciente.cartaoSUS.includes(searchPaciente))
    );
  });

  const indexOfLastPaciente = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstPaciente = indexOfLastPaciente - ITEMS_PER_PAGE;
  const pacientesPaginadosLista = pacientesFiltrados.slice(indexOfFirstPaciente, indexOfLastPaciente);

  const getConsultasMesPaciente = (pacienteNome: string) => {
    const agora = new Date();
    const mes = agora.getMonth();
    const ano = agora.getFullYear();

    return relatorios.filter((r) => {
      const data = new Date(r.data);
      return (
        r.alunoNome === pacienteNome &&
        data.getMonth() === mes &&
        data.getFullYear() === ano
      );
    }).length;
  };

  const resumoDescricao = (texto = "", limite = 45) => {
    if (texto.length <= limite) return texto;
    return texto.slice(0, limite) + "...";
  };

  if (pageView === "registro" && pacienteSelecionado) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* HEADER */}

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          {/* HEADER */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => solicitarAcao("voltar")}
              disabled={carregandoRegistro || salvandoRegistro}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">PTS</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{pacienteSelecionado.nome}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {carregandoRegistro && (
                <p className="text-sm text-gray-500">Carregando registro salvo...</p>
              )}

              {!carregandoRegistro && registroAlterado && (
                <p className="text-sm text-amber-600">Alterações ainda não salvas.</p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Histórico Clínico
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                  value={historicoClinico}
                  onChange={(e) => marcarCampoAlterado(setHistoricoClinico, e.target.value)}
                  disabled={carregandoRegistro}
                  placeholder="Descreva o histórico clínico do paciente..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Objetivos do Tratamento
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                  value={objetivoDoTratamento}
                  onChange={(e) => marcarCampoAlterado(setObjetivoDoTratamento, e.target.value)}
                  disabled={carregandoRegistro}
                  placeholder="Descreva os objetivos do tratamento..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Técnicas e Procedimentos Aplicados
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={5}
                  value={tecEProcAplicados}
                  onChange={(e) => marcarCampoAlterado(setTecEProcAplicados, e.target.value)}
                  disabled={carregandoRegistro}
                  placeholder="Descreva as técnicas e procedimentos aplicados..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Evolução ou Retrocesso do Paciente
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={5}
                  value={evolucaoRetrocessoDoPaciente}
                  onChange={(e) => marcarCampoAlterado(setEvolucaoRetrocessoDoPaciente, e.target.value)}
                  disabled={carregandoRegistro}
                  placeholder="Descreva a evolução ou retrocesso do paciente..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Recomendações Finais
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={5}
                  value={recomendacoesFinais}
                  onChange={(e) => marcarCampoAlterado(setRecomendacoesFinais, e.target.value)}
                  disabled={carregandoRegistro}
                  placeholder="Descreva as recomendações finais..."
                />
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => void salvarRegistroAtual()}
                  disabled={carregandoRegistro || salvandoRegistro}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {salvandoRegistro ? "Salvando..." : "Salvar"}
                </Button>

                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={carregandoRegistro || salvandoRegistro}
                  onClick={() => solicitarAcao("pdf")}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Gerar Relatório PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={() => solicitarAcao("voltar")}
                  disabled={carregandoRegistro || salvandoRegistro}
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>

          {acaoPendente && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-md rounded-lg border border-amber-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-amber-900">
                  <h3 className="text-lg font-semibold">Alterações não salvas</h3>
                  <p className="mt-1 text-sm">
                    Você editou um ou mais campos e ainda não salvou. Deseja salvar antes de continuar?
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={cancelarAcaoPendente}
                    disabled={salvandoRegistro}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="outline"
                    onClick={continuarSemSalvar}
                    disabled={salvandoRegistro}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    {acaoPendente === "pdf" ? "Gerar sem salvar" : "Voltar sem salvar"}
                  </Button>

                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={salvarEContinuar}
                    disabled={salvandoRegistro}
                  >
                    {salvandoRegistro ? "Salvando..." : "Salvar e continuar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">Projeto Terapêutico Singular (PTS)</h2>
        </div>
        <Card>

          <CardContent className="space-y-6 mt-5">
            {/* Filtro */}
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Buscar paciente por nome, CPF ou CNIS..."
                value={searchPaciente}
                onChange={(e) => {
                  setSearchPaciente(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-10"
              />
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nome</th>
                    <th className="px-4 py-3 text-left font-semibold">Prontuário</th>
                    <th className="px-4 py-3 text-left font-semibold">CPF</th>
                    <th className="px-4 py-3 text-center font-semibold">CNIS</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-center font-semibold">Atendimentos (mês)</th>
                    <th className="px-4 py-3 text-left font-semibold">Descrição</th>
                    <th className="px-4 py-3 text-center font-semibold">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {pacientesPaginadosLista.map((paciente) => (
                    <tr
                      key={paciente.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 font-medium">{paciente.nome}</td>
                      <td className="px-4 py-3">{paciente.prontuario}</td>
                      <td className="px-4 py-3">{paciente.cpf || "-"}</td>
                      <td className="px-4 py-3 text-center">{paciente.cartaoSUS || "-"}</td>

                      <td className="px-4 py-3">
                        <Badge
                          className={
                            paciente.status === "Ativo"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }
                        >
                          {paciente.status || "Inativo"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-center font-semibold">
                        {getConsultasMesPaciente(paciente.nome)}
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        {paciente.descricao ? (
                          <div className="text-sm text-gray-700">
                            <span>{resumoDescricao(paciente.descricao, 45)}</span>
                            {paciente.descricao.length > 45 && (
                              <button
                                className="text-blue-600 text-xs ml-2 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDescricaoSelecionada(paciente.descricao || "");
                                  setShowDescricaoModal(true);
                                }}
                              >
                                Ver mais
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          title="Clique aqui para fazer o registro da evolução do paciente"
                          onClick={() => {
                            abrirRegistroPaciente(paciente);
                          }}
                          className="
                                    p-2 
                                    rounded-full 
                                    text-blue-600 
                                    hover:text-white 
                                    hover:bg-blue-600 
                                    transition 
                                    duration-200
                                    cursor-pointer
                                  "
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              {showDescricaoModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Descrição do paciente</h2>
                    <p className="text-gray-700 whitespace-pre-line">{descricaoSelecionada}</p>
                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={() => setShowDescricaoModal(false)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>




            {/* Paginação */}
            {pacientesFiltrados.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                <span className="text-sm text-gray-600">
                  Página {currentPage} de{" "}
                  {Math.ceil(pacientesFiltrados.length / ITEMS_PER_PAGE)}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(
                        Math.ceil(pacientesFiltrados.length / ITEMS_PER_PAGE),
                        p + 1
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(pacientesFiltrados.length / ITEMS_PER_PAGE)
                  }
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal permanece igual */}
    </div>
  )
};
