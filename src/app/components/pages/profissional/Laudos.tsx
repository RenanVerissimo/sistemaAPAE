import { useEffect, useState } from "react";
import {
  getAllPacientes,
  getLaudosPaciente,
  getUrlLaudo,
  enviarLaudoPaciente,
  excluirLaudo,
  type Laudo,
} from "@/app/services/api";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  ChevronLeft,
  Eye,
  FileDown,
  FileText,
  FileUp,
  Search as SearchIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Paciente } from "../../interfaces/interfaces";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface LaudosProps {
  onBack: () => void;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

export default function Laudos({ onBack, setSnackbar }: LaudosProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagina, setPagina] = useState(1);
  const [pacienteLaudos, setPacienteLaudos] = useState<Paciente | null>(null);
  const [pacienteEnvioLaudo, setPacienteEnvioLaudo] = useState<Paciente | null>(null);
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [carregandoLaudos, setCarregandoLaudos] = useState(false);
  const [laudoFile, setLaudoFile] = useState<File | null>(null);
  const [observacaoLaudo, setObservacaoLaudo] = useState("");
  const [enviandoLaudo, setEnviandoLaudo] = useState(false);
  const [laudoExclusao, setLaudoExclusao] = useState<Laudo | null>(null);
  const [excluindoLaudo, setExcluindoLaudo] = useState(false);
  const porPagina = 10;

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await getAllPacientes();
        setPacientes(data);
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
        setSnackbar({
          open: true,
          message: "Erro ao carregar pacientes",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, [setSnackbar]);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.cpf && p.cpf.includes(search)) ||
      (p.cartaoSUS && p.cartaoSUS.includes(search))
  );

  const indexUltimo = pagina * porPagina;
  const indexPrimeiro = indexUltimo - porPagina;
  const pacientesPaginados = pacientesFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(pacientesFiltrados.length / porPagina);

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
    await carregarLaudos(paciente.id);
  };

  const abrirModalInserirLaudo = (paciente: Paciente) => {
    setPacienteEnvioLaudo(paciente);
    setLaudoFile(null);
    setObservacaoLaudo("");
  };

  const fecharModalLaudos = () => {
    setPacienteLaudos(null);
    setLaudos([]);
  };

  const fecharModalInserirLaudo = () => {
    setPacienteEnvioLaudo(null);
    setLaudoFile(null);
    setObservacaoLaudo("");
    setEnviandoLaudo(false);
  };

  const confirmarEnvioLaudo = async () => {
    if (!pacienteEnvioLaudo || !laudoFile) return;

    setEnviandoLaudo(true);
    try {
      await enviarLaudoPaciente(
        pacienteEnvioLaudo.id,
        laudoFile,
        observacaoLaudo
      );

      setSnackbar({
        open: true,
        message: "Laudo enviado com sucesso!",
        severity: "success",
      });

      if (pacienteLaudos?.id === pacienteEnvioLaudo.id) {
        await carregarLaudos(pacienteEnvioLaudo.id);
      }

      fecharModalInserirLaudo();
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

  const abrirModalExclusaoLaudo = (laudo: Laudo) => {
    setLaudoExclusao(laudo);
  };

  const confirmarExclusaoLaudo = async () => {
    if (!pacienteLaudos || !laudoExclusao) return;

    setExcluindoLaudo(true);
    try {
      await excluirLaudo(laudoExclusao.id);
      setSnackbar({
        open: true,
        message: "Laudo excluído com sucesso!",
        severity: "success",
      });
      await carregarLaudos(pacienteLaudos.id);
      setLaudoExclusao(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao excluir laudo.",
        severity: "error",
      });
    } finally {
      setExcluindoLaudo(false);
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

  const formatarTamanhoArquivo = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatarDataPtBr = (data: string) => {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("T")[0].split("-").map(Number);
    const date =
      ano && mes && dia ? new Date(ano, mes - 1, dia) : new Date(data);

    if (Number.isNaN(date.getTime())) return data;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onBack();
              setSearch("");
              setPagina(1);
            }}
            className="cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">Laudos dos Pacientes</h2>
        </div>

        <Card>
          <CardContent className="space-y-6 mt-5">
            <div className="relative w-full max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CPF ou CNIS..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagina(1);
                }}
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Carregando pacientes...
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full table-fixed text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="w-[28%] px-3 py-3 text-left font-semibold">Nome</th>
                      <th className="w-[13%] px-2 py-3 text-center font-semibold">Data Nasc.</th>
                      <th className="w-[14%] px-2 py-3 text-center font-semibold">Prontuario</th>
                      <th className="w-[15%] px-2 py-3 text-center font-semibold">CPF</th>
                      <th className="w-[16%] px-2 py-3 text-center font-semibold">Cartão SUS</th>
                      <th className="w-[14%] px-2 py-3 text-center font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesPaginados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-500">
                          Nenhum paciente encontrado
                        </td>
                      </tr>
                    ) : (
                      pacientesPaginados.map((pac) => (
                        <tr key={pac.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <span className="block truncate" title={pac.nome}>{pac.nome}</span>
                          </td>
                          <td className="px-2 py-3 text-center whitespace-nowrap">{formatarDataPtBr(pac.dataNasc)}</td>
                          <td className="px-2 py-3 text-center">
                            <span className="block truncate" title={pac.prontuario}>{pac.prontuario}</span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="block truncate" title={pac.cpf || "-"}>{pac.cpf || "-"}</span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="block truncate" title={pac.cartaoSUS || "-"}>{pac.cartaoSUS || "-"}</span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Inserir laudo"
                                aria-label="Inserir laudo"
                                className="h-8 w-8 cursor-pointer border border-transparent p-0 transition-all hover:border-purple-200 hover:bg-purple-50 hover:shadow-sm"
                                onClick={() => abrirModalInserirLaudo(pac)}
                              >
                                <FileUp className="w-4 h-4 text-purple-600" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Ver e baixar laudos"
                                aria-label="Ver e baixar laudos"
                                className="h-8 w-8 cursor-pointer border border-transparent p-0 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
                                onClick={() => abrirModalLaudos(pac)}
                              >
                                <FileDown className="w-4 h-4 text-blue-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="cursor-pointer"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Pagina {pagina} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="cursor-pointer"
                >
                  Proxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {pacienteLaudos && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Laudos do Paciente</h2>
              <p className="text-sm text-gray-500">{pacienteLaudos.nome}</p>
            </div>

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
                <div className="max-h-[360px] overflow-y-auto rounded border divide-y">
                  {laudos.map((laudo) => (
                    <div
                      key={laudo.id}
                      className="flex items-center justify-between gap-3 p-3"
                    >
                      <div className="min-w-0 flex items-start gap-2">
                        <FileText className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {laudo.nomeArquivo}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatarDataPtBr(laudo.createdAt)} - {formatarTamanhoArquivo(laudo.tamanho)}
                            {laudo.observacao ? ` - ${laudo.observacao}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Abrir laudo"
                          aria-label="Abrir laudo"
                          className="h-9 w-9 p-0"
                          onClick={() => window.open(getUrlLaudo(laudo.id), "_blank")}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Baixar laudo"
                          aria-label="Baixar laudo"
                          className="h-9 w-9 p-0"
                          onClick={() => baixarLaudo(laudo)}
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Excluir laudo"
                          aria-label="Excluir laudo"
                          className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => abrirModalExclusaoLaudo(laudo)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

      {pacienteEnvioLaudo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full shadow-lg space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Inserir Laudo</h2>
              <p className="text-sm text-gray-500">{pacienteEnvioLaudo.nome}</p>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Adicionar laudo em PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setLaudoFile(e.target.files?.[0] || null)}
                  className="w-full rounded border bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Observação</label>
                <input
                  value={observacaoLaudo}
                  onChange={(e) => setObservacaoLaudo(e.target.value)}
                  placeholder="Ex: laudo neurológico, avaliação inicial..."
                  className="w-full rounded border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={fecharModalInserirLaudo}>
                Cancelar
              </Button>
              <Button
                onClick={confirmarEnvioLaudo}
                disabled={!laudoFile || enviandoLaudo}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {enviandoLaudo ? "Enviando..." : "Enviar laudo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {laudoExclusao && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-center mb-3">
              <AlertTriangle className="text-red-500 w-12 h-12" />
            </div>

            <h2 className="text-lg font-semibold mb-3 text-center">
              Excluir laudo?
            </h2>

            <div className="border border-red-200 rounded-lg bg-red-50 px-4 py-3 text-center">
              <p className="text-sm text-gray-700">
                Esta ação removerá o arquivo:
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-red-700">
                {laudoExclusao.nomeArquivo}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setLaudoExclusao(null)}
                disabled={excluindoLaudo}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmarExclusaoLaudo}
                disabled={excluindoLaudo}
              >
                {excluindoLaudo ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
