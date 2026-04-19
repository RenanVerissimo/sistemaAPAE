import { useEffect, useState } from "react";
import { getAllPacientes } from "@/app/services/api";
import { Paciente } from "@/types";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { ChevronLeft, FileDown, Search as SearchIcon } from "lucide-react";
import { PacientesTable } from "@/app/components/PacientesTable";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface LaudosProps {
  onBack: () => void;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

export default function Laudos({
  onBack,
  setSnackbar,
}: LaudosProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  // 🔥 Buscar da API
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

  // 🔎 Filtro
  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.cpf && p.cpf.includes(search)) ||
      (p.cartaoSUS && p.cartaoSUS.includes(search))
  );

  // 📄 Paginação
  const indexUltimo = pagina * porPagina;
  const indexPrimeiro = indexUltimo - porPagina;

  const pacientesPaginados = pacientesFiltrados.slice(
    indexPrimeiro,
    indexUltimo
  );

  const totalPaginas = Math.ceil(pacientesFiltrados.length / porPagina);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onBack();
              setSearch("");
              setPagina(1);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <h1 className="text-xl font-semibold">
            Laudos dos Pacientes
          </h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 🔎 Filtro */}
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

            {/* Loading */}
            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Carregando pacientes...
              </div>
            ) : (
              <PacientesTable
                pacientes={pacientesPaginados}
                getConsultasMesPaciente={() => 0}
                resumoDescricao={(desc) => desc}
                renderActions={(paciente) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (paciente.laudoFile) {
                        const url = URL.createObjectURL(
                          paciente.laudoFile
                        );
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `laudo_${paciente.nome}.pdf`;
                        a.click();
                      } else {
                        setSnackbar({
                          open: true,
                          message:
                            "Paciente não possui laudo anexado",
                          severity: "error",
                        });
                      }
                    }}
                    title="Download Laudo"
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                )}
              />
            )}

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagina((p) => Math.max(1, p - 1))
                  }
                  disabled={pagina === 1}
                >
                  Anterior
                </Button>

                <span className="text-sm text-gray-600">
                  Página {pagina} de {totalPaginas}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagina((p) =>
                      Math.min(totalPaginas, p + 1)
                    )
                  }
                  disabled={pagina === totalPaginas}
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