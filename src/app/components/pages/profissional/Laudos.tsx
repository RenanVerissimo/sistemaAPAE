import { useEffect, useState } from "react";
import {
  getAllPacientes,
  getLaudosPaciente,
  getUrlLaudo,
  type Laudo,
} from "@/app/services/api";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  ChevronLeft,
  FileDown,
  FileText,
  Search as SearchIcon,
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
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [carregandoLaudos, setCarregandoLaudos] = useState(false);
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

  const fecharModalLaudos = () => {
    setPacienteLaudos(null);
    setLaudos([]);
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

  const formatarDataLaudo = (data: string) => {
    if (!data) return "-";
    const date = new Date(data);
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
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Nome</th>
                      <th className="px-4 py-3 text-center font-semibold">Data Nasc.</th>
                      <th className="px-4 py-3 text-center font-semibold">Prontuario</th>
                      <th className="px-4 py-3 text-center font-semibold">CPF</th>
                      <th className="px-4 py-3 text-center font-semibold">Cartao SUS</th>
                      <th className="px-4 py-3 text-center font-semibold">Acoes</th>
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
                          <td className="px-4 py-3">{pac.nome}</td>
                          <td className="px-4 py-3 text-center">{pac.dataNasc}</td>
                          <td className="px-4 py-3 text-center">{pac.prontuario}</td>
                          <td className="px-4 py-3 text-center">{pac.cpf || "-"}</td>
                          <td className="px-4 py-3 text-center">{pac.cartaoSUS || "-"}</td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer border border-transparent transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
                              onClick={() => abrirModalLaudos(pac)}
                            >
                              <FileDown className="w-4 h-4 mr-1 text-blue-600" />
                              Laudos
                            </Button>
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
                            {formatarDataLaudo(laudo.createdAt)} - {formatarTamanhoArquivo(laudo.tamanho)}
                            {laudo.observacao ? ` - ${laudo.observacao}` : ""}
                          </p>
                        </div>
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
    </div>
  );
}
