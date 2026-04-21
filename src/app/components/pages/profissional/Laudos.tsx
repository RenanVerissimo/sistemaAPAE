import { useEffect, useRef, useState } from "react";
import { getAllPacientes } from "@/app/services/api";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  ChevronLeft,
  FileDown,
  Search as SearchIcon,
  ChevronDown,
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
  const [menuAberto, setMenuAberto] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(null);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

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

  const baixarUltimoLaudo = (paciente: Paciente) => {
    setMenuAberto(null);
    if (paciente.laudoFile) {
      const url = URL.createObjectURL(paciente.laudoFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laudo_${paciente.nome}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      setSnackbar({
        open: true,
        message: "Paciente não possui laudo anexado",
        severity: "error",
      });
    }
  };

  const baixarTodosLaudos = (paciente: Paciente) => {
    setMenuAberto(null);
    if (paciente.laudoFile) {
      const url = URL.createObjectURL(paciente.laudoFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = `todos_laudos_${paciente.nome}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSnackbar({
        open: true,
        message: "Download iniciado (apenas 1 laudo por paciente disponível atualmente)",
        severity: "info",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Paciente não possui laudos anexados",
        severity: "error",
      });
    }
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
                      <th className="px-4 py-3 text-center font-semibold">Prontuário</th>
                      <th className="px-4 py-3 text-center font-semibold">CPF</th>
                      <th className="px-4 py-3 text-center font-semibold">Cartão SUS</th>
                      <th className="px-4 py-3 text-center font-semibold">Ações</th>
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
                            <div
                              className="relative inline-block"
                              ref={menuAberto === pac.id ? menuRef : null}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() =>
                                  setMenuAberto(menuAberto === pac.id ? null : pac.id)
                                }
                              >
                                <FileDown className="w-4 h-4 mr-1" />
                                Baixar
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </Button>

                              {menuAberto === pac.id && (
                                <div className="absolute right-0 mt-1 w-52 bg-white border rounded-md shadow-lg z-20">
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                    onClick={() => baixarUltimoLaudo(pac)}
                                  >
                                    Baixar último laudo
                                  </button>
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-t"
                                    onClick={() => baixarTodosLaudos(pac)}
                                  >
                                    Baixar todos os laudos
                                  </button>
                                </div>
                              )}
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
                  Página {pagina} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="cursor-pointer"
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}