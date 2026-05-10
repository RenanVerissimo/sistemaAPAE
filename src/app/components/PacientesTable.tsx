import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";

import {
  atualizarPaciente,
  deletePaciente,
  excluirLaudo,
  enviarLaudoPaciente,
  getAllPacientes,
  getLaudosPaciente,
  getUrlLaudo,
  type Laudo,
} from "../services/api";
import SnackbarComponent from "./SnackbarComponent";
import { TableActions } from "./tableActions";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Paciente } from "./interfaces/interfaces";
import { useNavigate } from "react-router-dom";


export function PacientesTable() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [descricaoSelecionada, setDescricaoSelecionada] = useState<string | null>(null);

  const [excluirModal, setExcluirModal] = useState(false);
  const [pacienteExcluir, setPacienteExcluir] = useState<Paciente | null>(null);
  const [pacienteEditar, setPacienteEditar] = useState<Paciente | null>(null);
  const [pacienteAtivoInativo, setPacienteAtivoInativo] = useState<Paciente | null>(null);
  const [modalPacienteAtivoInativo, setModalPacienteAtivoInativo] = useState(false);
  const [pacienteLaudos, setPacienteLaudos] = useState<Paciente | null>(null);
  const [modoModalLaudos, setModoModalLaudos] = useState<"gerenciar" | "baixar">("gerenciar");
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [laudoFile, setLaudoFile] = useState<File | null>(null);
  const [observacaoLaudo, setObservacaoLaudo] = useState("");
  const [carregandoLaudos, setCarregandoLaudos] = useState(false);
  const [enviandoLaudo, setEnviandoLaudo] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Ativo");

  const [paginaAtual, setPaginaAtual] = useState(1);



  const gerarPaginas = () => {
    const paginas = [];

    const maxPaginasVisiveis = 3;

    let inicio = Math.max(1, paginaAtual - 1);
    let fim = Math.min(totalPaginas, inicio + maxPaginasVisiveis - 1);

    if (fim - inicio < maxPaginasVisiveis - 1) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }

    return paginas;
  };

  /*   const inicio = pacientes.length === 0 ? 0 : indicePrimeiroPaciente + 1;
    const fim = Math.min(indiceUltimoPaciente, pacientes.length); */

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState('');

  // 1. Primeiro filtra
  const pacientesFiltrados = pacientes.filter((p) => {
    const matchBusca = filtroAplicado.trim()
      ? p.nome.toLowerCase().includes(filtroAplicado.toLowerCase()) ||
      p.prontuario.toLowerCase().includes(filtroAplicado.toLowerCase()) ||
      (p.cpf || '').includes(filtroAplicado) ||
      (p.cartaoSUS || '').includes(filtroAplicado)
      : true;

    const matchStatus = filtroStatus === "Todos" ? true : p.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  // 2. Depois pagina em cima da lista filtrada
  const pacientesPorPagina = 10;
  const indiceUltimoPaciente = paginaAtual * pacientesPorPagina;
  const indicePrimeiroPaciente = indiceUltimoPaciente - pacientesPorPagina;
  const pacientesPaginaAtual = pacientesFiltrados.slice(
    indicePrimeiroPaciente,
    indiceUltimoPaciente
  );

  const totalPaginas = Math.ceil(pacientesFiltrados.length / pacientesPorPagina);

  const inicio = pacientesFiltrados.length === 0 ? 0 : indicePrimeiroPaciente + 1;
  const fim = Math.min(indiceUltimoPaciente, pacientesFiltrados.length);


  const handleBuscar = () => {
    setFiltroAplicado(termoBusca);
    setPaginaAtual(1);
  };
  const handleLimparBusca = () => {
    setTermoBusca('');
    setFiltroAplicado('');
    setPaginaAtual(1);
  };

  useEffect(() => {
    carregarPacientes();
  }, []);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const carregarPacientes = async () => {
    const data = await getAllPacientes();
    setPacientes(data);
  };

  const carregarLaudos = async (pacienteId: number) => {
    setCarregandoLaudos(true);
    try {
      const data = await getLaudosPaciente(pacienteId);
      setLaudos(data);
    } finally {
      setCarregandoLaudos(false);
    }
  };

  const abrirModalLaudos = async (paciente: Paciente) => {
    setPacienteLaudos(paciente);
    setModoModalLaudos("gerenciar");
    setLaudoFile(null);
    setObservacaoLaudo("");
    await carregarLaudos(paciente.id);
  };

  const abrirModalDownloadLaudos = async (paciente: Paciente) => {
    setPacienteLaudos(paciente);
    setModoModalLaudos("baixar");
    setLaudoFile(null);
    setObservacaoLaudo("");
    await carregarLaudos(paciente.id);
  };

  const fecharModalLaudos = () => {
    setPacienteLaudos(null);
    setLaudos([]);
    setLaudoFile(null);
    setObservacaoLaudo("");
  };

  const confirmarEnvioLaudo = async () => {
    if (!pacienteLaudos || !laudoFile) return;

    setEnviandoLaudo(true);
    try {
      await enviarLaudoPaciente(pacienteLaudos.id, laudoFile, observacaoLaudo);
      setSnackbar({
        open: true,
        message: "Laudo enviado com sucesso!",
        severity: "success",
      });
      setLaudoFile(null);
      setObservacaoLaudo("");
      await carregarLaudos(pacienteLaudos.id);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao enviar laudo.",
        severity: "error",
      });
    } finally {
      setEnviandoLaudo(false);
    }
  };

  const baixarLaudo = (laudo: Laudo) => {
    const link = document.createElement("a");
    link.href = getUrlLaudo(laudo.id, true);
    link.download = laudo.nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const confirmarExclusaoLaudo = async (laudo: Laudo) => {
    if (!window.confirm(`Deseja excluir o laudo "${laudo.nomeArquivo}"?`)) return;

    try {
      await excluirLaudo(laudo.id);
      setSnackbar({
        open: true,
        message: "Laudo excluido com sucesso!",
        severity: "success",
      });
      if (pacienteLaudos) {
        await carregarLaudos(pacienteLaudos.id);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao excluir laudo.",
        severity: "error",
      });
    }
  };

  const limitarTexto = (texto?: string) => {
    if (!texto) return "-";
    if (texto.length <= 45) return texto;
    return texto.substring(0, 45) + "...";
  };

  const formatarTamanhoArquivo = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatarDataLaudo = (data: string) => {
    if (!data) return "-";
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const confirmarExclusao = async () => {
    if (!pacienteExcluir) return;

    try {
      await deletePaciente(pacienteExcluir.id);

      setSnackbar({
        open: true,
        message: "Paciente excluído com sucesso!",
        severity: "success",
      });

      setExcluirModal(false);
      setPacienteExcluir(null);
      carregarPacientes();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao excluir paciente.",
        severity: "error",
      });
    }
  };

  const confirmarEdicao = async () => {
    if (!pacienteEditar) return;

    try {

      if (
        !pacienteEditar.nome.trim() ||
        !pacienteEditar.dataNasc.trim() ||
        !pacienteEditar.prontuario.trim() ||
        !(pacienteEditar.cpf || "").trim() ||
        !(pacienteEditar.cartaoSUS || "").trim()
      ) {
        setSnackbar({
          open: true,
          message: "Preencha todos os campos obrigatórios.",
          severity: "warning",
        });
        return;
      }

      await atualizarPaciente(pacienteEditar.id, pacienteEditar);

      setSnackbar({
        open: true,
        message: "Paciente editado com sucesso!",
        severity: "success",
      });

      setPacienteEditar(null);
      carregarPacientes();
    } catch (error) {
      console.error("ERRO REAL DO UPDATE:", error);
      setSnackbar({
        open: true,
        message: "Erro ao editar paciente.",
        severity: "error",
      });
    }
  };

  const alterarStatusPaciente = async () => {
    if (!pacienteAtivoInativo) return;

    try {
      const novoStatus =
        pacienteAtivoInativo.status === "Ativo" ? "Inativo" : "Ativo";

      await atualizarPaciente(pacienteAtivoInativo.id, {
        ...pacienteAtivoInativo,
        status: novoStatus,
      });

      setSnackbar({
        open: true,
        message: "Status do paciente atualizado com sucesso!",
        severity: "success",
      });

      setPacienteAtivoInativo(null);
      setModalPacienteAtivoInativo(false);

      carregarPacientes();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao atualizar status do paciente.",
        severity: "error",
      });
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-600 border border-gray-300";

    switch (status.toLowerCase()) {
      case "ativo":
        return "bg-green-100 text-green-800 border border-green-300";
      case "inativo":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto min-h-[520px] flex flex-col">
        <div className="flex gap-2 mb-3 items-center">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
            placeholder="Buscar por nome, CPF, prontuário ou cartão SUS..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />



          <Button onClick={handleBuscar} className="bg-gray-800 hover:bg-gray-700 text-white px-4">
            Buscar
          </Button>
          {filtroAplicado && (
            <Button variant="outline" onClick={handleLimparBusca} className="px-4">
              Limpar
            </Button>
          )}
          {/* FILTRO STATUS */}
          <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2 py-1 bg-white">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap uppercase">Filtro de status:</span>
            {(["Todos", "Ativo", "Inativo"] as const).map((status) => (
              <button
                key={status}
                onClick={() => { setFiltroStatus(status); setPaginaAtual(1); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${filtroStatus === status
                  ? status === "Ativo"
                    ? "bg-green-100 text-green-800"
                    : status === "Inativo"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-800 text-white"
                  : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <Card className="rounded-xl overflow-hidden shadow-md border border-gray-200 flex-1">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-300 border-b">
                <tr>
                  <th className="px-4 py-1 text-center font-semibold w-[18%]">Nome</th>
                  <th className="px-4 py-1 text-center font-semibold w-[10%]">Data Nascimento</th>
                  <th className="px-4 py-1 text-center font-semibold w-[10%]">Prontuário</th>
                  <th className="px-4 py-1 text-center font-semibold w-[10%]">CPF</th>
                  <th className="px-4 py-1 text-center font-semibold w-[12%]">Cartão SUS</th>
                  <th className="px-4 py-1 text-center font-semibold w-[22%]">Descrição</th>
                  <th className="px-4 py-1 text-center font-semibold w-[8%]">Status</th>
                  <th className="px-4 py-1 text-center font-semibold w-[10%]">Ações</th>
                </tr>
              </thead>

              <tbody>
                {pacientesPaginaAtual.map((pac) => (
                  <tr
                    key={pac.id}
                    className="border-b hover:bg-gray-200 h-[48px] cursor-pointer"
                    onClick={() =>
                      navigate("/SecretariaDashboard/PacienteCard/VerAtendimentos", {
                        state: { paciente: { id: pac.id, nome: pac.nome } },
                      })
                    }
                  >
                    <td className="px-3 py-2 text-center">{pac.nome}</td>
                    <td className="px-3 py-2 text-center">{pac.dataNasc}</td>
                    <td className="px-3 py-2 text-center">{pac.prontuario}</td>
                    <td className="px-3 py-2 text-center">{pac.cpf || "-"}</td>
                    <td className="px-3 py-2 text-center">{pac.cartaoSUS || "-"}</td>
                    <td className="px-3 py-2 text-center">
                      {pac.descricao && pac.descricao.length > 45 ? (
                        <>
                          {limitarTexto(pac.descricao)}
                          <button
                            className="text-blue-600 text-xs ml-2 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDescricaoSelecionada(pac.descricao || "");
                            }}
                          >
                            Ver mais
                          </button>
                        </>
                      ) : (
                        limitarTexto(pac.descricao)
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(pac.status)}`}
                      >
                        {pac.status}
                      </span>

                    </td>
                    <td
                      className="px-3 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TableActions
                        onDownload={() => abrirModalDownloadLaudos(pac)}
                        onPower={() => {
                          setPacienteAtivoInativo(pac);
                          setModalPacienteAtivoInativo(true);
                        }}
                        onEdit={() => setPacienteEditar(pac)}
                        onLaudo={() => abrirModalLaudos(pac)}
                        onDelete={() => {
                          setPacienteExcluir(pac);
                          setExcluirModal(true);
                        }}
                      />
                    </td>
                  </tr>
                ))}

                {/* Linhas vazias para manter altura fixa da tabela */}
                {Array.from({ length: pacientesPorPagina - pacientesPaginaAtual.length }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b h-[56px]">
                    <td className="px-3 py-2" colSpan={8}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">

        {/* TEXTO INFORMATIVO */}
        <span>
          Mostrando {inicio}–{fim} de {pacientesFiltrados.length} pacientes
          {filtroAplicado && ` (filtrado de ${pacientes.length})`}
        </span>

        {/* PAGINAÇÃO */}
        <div className="flex items-center gap-1">

          {/* PRIMEIRA */}
          <button
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-40"
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual(1)}
          >
            {"<<"}
          </button>

          {/* ANTERIOR */}
          <button
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual((prev) => prev - 1)}
          >
            <NavigateBeforeIcon fontSize="small" />
          </button>

          {/* PRIMEIRA + ... */}
          {paginaAtual > 2 && (
            <>
              <button
                className="px-2 py-1 rounded hover:bg-gray-200"
                onClick={() => setPaginaAtual(1)}
              >
                1
              </button>
              <span className="px-1">...</span>
            </>
          )}

          {/* PÁGINAS CENTRAIS */}
          {gerarPaginas().map((numero) => (
            <button
              key={numero}
              className={`px-2 py-1 rounded ${numero === paginaAtual
                ? "bg-gray-800 text-white"
                : "hover:bg-gray-200"
                }`}
              onClick={() => setPaginaAtual(numero)}
            >
              {numero}
            </button>
          ))}

          {/* ... + ÚLTIMA */}
          {paginaAtual < totalPaginas - 1 && (
            <>
              <span className="px-1">...</span>
              <button
                className="px-2 py-1 rounded hover:bg-gray-200"
                onClick={() => setPaginaAtual(totalPaginas)}
              >
                {totalPaginas}
              </button>
            </>
          )}

          {/* PRÓXIMA */}
          <button
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual((prev) => prev + 1)}
          >
            <NavigateNextIcon fontSize="small" />
          </button>

        </div>
      </div>

      {descricaoSelecionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Descrição do paciente
            </h2>

            <p className="text-gray-700 whitespace-pre-line break-all">
              {descricaoSelecionada}
            </p>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setDescricaoSelecionada(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {excluirModal && pacienteExcluir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">

            {/* Ícone centralizado e grande */}
            <div className="flex justify-center mb-3">
              <ErrorOutlineIcon className="text-red-500" sx={{ fontSize: 52 }} />
            </div>

            <h2 className="text-lg font-semibold mb-4 text-center">
              Confirmar exclusão?
            </h2>

            <div className="text-center text-gray-700 border border-red-300 rounded-lg px-4 py-3 bg-red-50">
              <p>Deseja realmente excluir o paciente:</p>
              <p className="uppercase font-bold text-base">
                {pacienteExcluir.nome} ?
              </p>
            </div>

            <div className="text-center mt-8">
              <p> ⚠️ ATENÇÃO </p>
              <p className="text-ms text-red-500 italic font-medium">
                Após a exclusão não será possível reverter o processo
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setExcluirModal(false);
                  setPacienteExcluir(null);
                }}
              >
                Cancelar
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmarExclusao}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}


      {pacienteEditar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Editar Paciente
            </h2>

            <div className="space-y-3">

              <div>
                <label className="text-sm font-medium">Nome</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={pacienteEditar.nome}
                  onChange={(e) =>
                    setPacienteEditar({
                      ...pacienteEditar,
                      nome: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Data Nascimento</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={pacienteEditar.dataNasc}
                  onChange={(e) =>
                    setPacienteEditar({
                      ...pacienteEditar,
                      dataNasc: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Prontuário</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={pacienteEditar.prontuario}
                  onChange={(e) =>
                    setPacienteEditar({
                      ...pacienteEditar,
                      prontuario: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">CPF</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={pacienteEditar.cpf || ""}
                  onChange={(e) =>
                    setPacienteEditar({
                      ...pacienteEditar,
                      cpf: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Cartão SUS</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={pacienteEditar.cartaoSUS || ""}
                  onChange={(e) =>
                    setPacienteEditar({
                      ...pacienteEditar,
                      cartaoSUS: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={pacienteEditar.descricao || ""}
                  onChange={(e) =>
                    setPacienteEditar({
                      ...pacienteEditar,
                      descricao: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pacienteEditar.status === "Ativo"}
                  onChange={(e) =>
                    setPacienteEditar({
                      ...pacienteEditar,
                      status: e.target.checked ? "Ativo" : "Inativo",
                    })
                  }
                />
                <label className="text-sm font-medium">
                  Paciente Ativo
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPacienteEditar(null)}
              >
                Cancelar
              </Button>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={confirmarEdicao}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalPacienteAtivoInativo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
            <div className="flex justify-center mb-3">
              <ErrorOutlineIcon className="text-yellow-500" sx={{ fontSize: 48 }} />
            </div>
            <h2 className="text-lg font-semibold mb-4 text-center">
              Alterar Status do Paciente?
            </h2>
            <div className="border border-yellow-300 rounded-lg px-4 py-3 bg-yellow-50 text-center mt-2">
              <p className="text-gray-700">
                O(A) paciente <strong>{pacienteAtivoInativo?.nome}</strong> ficará como{" "}
                <span
                  className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${getStatusBadgeColor(
                    pacienteAtivoInativo?.status === "Ativo" ? "Inativo" : "Ativo"
                  )}`}
                >
                  {pacienteAtivoInativo?.status === "Ativo" ? "Inativo" : "Ativo"}
                </span>
              </p>
            </div>
            <div className="mt-4 text-center text-gray-700">
              <p>Deseja continuar?</p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setPacienteAtivoInativo(null)
                  setModalPacienteAtivoInativo(false);
                }}
              >
                Cancelar
              </Button>

              <Button
                className="bg-yellow-400 hover:bg-yellow-400 text-black"
                onClick={() => alterarStatusPaciente()}
              >

                Alterar
              </Button>
            </div>
          </div>
        </div>
      )}

      {pacienteLaudos && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg space-y-5">
            <div>
              <h2 className="text-lg font-semibold">
                {modoModalLaudos === "baixar" ? "Laudos para baixar" : "Laudos do Paciente"}
              </h2>
              <p className="text-sm text-gray-500">{pacienteLaudos.nome}</p>
            </div>

            {modoModalLaudos === "gerenciar" && (
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Adicionar laudo em PDF</label>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setLaudoFile(e.target.files?.[0] || null)}
                    className="w-full rounded border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Observacao</label>
                  <input
                    value={observacaoLaudo}
                    onChange={(e) => setObservacaoLaudo(e.target.value)}
                    placeholder="Ex: laudo neurologico, avaliacao inicial..."
                    className="w-full rounded border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={confirmarEnvioLaudo}
                    disabled={!laudoFile || enviandoLaudo}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {enviandoLaudo ? "Enviando..." : "Enviar laudo"}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Laudos anexados</h3>

              {carregandoLaudos && (
                <p className="text-sm text-gray-500">Carregando laudos...</p>
              )}

              {!carregandoLaudos && laudos.length === 0 && (
                <div className="rounded border border-dashed p-4 text-center text-sm text-gray-500">
                  Nenhum laudo anexado para este paciente.
                </div>
              )}

              {!carregandoLaudos && laudos.length > 0 && (
                <div className="max-h-64 overflow-y-auto rounded border divide-y">
                  {laudos.map((laudo) => (
                    <div
                      key={laudo.id}
                      className="flex items-center justify-between gap-3 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {laudo.nomeArquivo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatarDataLaudo(laudo.createdAt)} - {formatarTamanhoArquivo(laudo.tamanho)}
                          {laudo.observacao ? ` - ${laudo.observacao}` : ""}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getUrlLaudo(laudo.id), "_blank")}
                        >
                          Abrir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => baixarLaudo(laudo)}
                        >
                          Baixar
                        </Button>
                        {modoModalLaudos === "gerenciar" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmarExclusaoLaudo(laudo)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={fecharModalLaudos}>
                Fechar
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
    </>
  );
}
