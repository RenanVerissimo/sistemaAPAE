import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import {
  getAllPacientes,
  cadastrarAtendimento,
} from "@/app/services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import { User } from "../../interfaces/interfaces";


interface PacienteAPI {
  id: number;
  nome: string;
  cpf?: string;
  prontuario?: string;
  cartaoSUS?: string;
  status?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface CadastroAtendimentoProps {
  user: User;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

export function CadastroAtendimento({ user, setSnackbar }: CadastroAtendimentoProps) {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState<PacienteAPI[]>([]);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(null);
  const [dataConsulta, setDataConsulta] = useState(format(new Date(), "yyyy-MM-dd"));
  const [descricao, setDescricao] = useState("");
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [continuarCadastrando, setContinuarCadastrando] = useState(false);

  useEffect(() => {
    const carregarPacientes = async () => {
      try {
        const lista: PacienteAPI[] = await getAllPacientes();
        setPacientes(lista);
      } catch (error) {
        console.error(error);
        setSnackbar({
          open: true,
          message: "Erro ao carregar pacientes",
          severity: "error",
        });
      }
    };
    carregarPacientes();
  }, [setSnackbar]);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchPaciente.toLowerCase()) ||
      (p.cartaoSUS && p.cartaoSUS.includes(searchPaciente))
  );

  const handleSelectPaciente = (paciente: PacienteAPI) => {
    setSearchPaciente(paciente.nome);
    setSelectedPacienteId(paciente.id);
    setShowPacienteSuggestions(false);
  };

  const limparFormulario = () => {
    setSearchPaciente("");
    setSelectedPacienteId(null);
    setDescricao("");
    setDataConsulta(format(new Date(), "yyyy-MM-dd"));
    setShowPacienteSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPacienteId) return;

    const profissionalId = Number(user.id);
    if (!profissionalId || isNaN(profissionalId)) {
      setSnackbar({
        open: true,
        message: "ID do profissional inválido. Faça login novamente.",
        severity: "error",
      });
      console.error("user.id inválido:", user.id);
      return;
    }

    const payload = {
      paciente_id: selectedPacienteId,
      profissional_id: profissionalId,
      dataConsulta,
      descricao,
    };

    setSalvando(true);
    try {
      await cadastrarAtendimento(payload);
      setSnackbar({
        open: true,
        message: "Atendimento cadastrado com sucesso!",
        severity: "success",
      });

      if (continuarCadastrando) {
        limparFormulario();
      } else {
        navigate("/ProfissionalDashboard");
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar atendimento",
        severity: "error",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">Novo Atendimento</h2>
      </div>

      {/* CARD DO FORMULÁRIO */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <Label htmlFor="paciente">Paciente *</Label>
                <Input
                  id="paciente"
                  value={searchPaciente}
                  onChange={(e) => {
                    setSearchPaciente(e.target.value);
                    setSelectedPacienteId(null);
                    setShowPacienteSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() =>
                    setShowPacienteSuggestions(searchPaciente.length > 0)
                  }
                  placeholder="Digite o nome ou cartão SUS do paciente"
                  required={!selectedPacienteId}
                  autoComplete="off"
                />
                {showPacienteSuggestions && pacientesFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {pacientesFiltrados.map((paciente) => (
                      <div
                        key={paciente.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectPaciente(paciente)}
                      >
                        <p className="font-medium">{paciente.nome}</p>
                        {paciente.cartaoSUS && (
                          <p className="text-xs text-gray-500">
                            SUS: {paciente.cartaoSUS}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {searchPaciente && !selectedPacienteId && (
                  <p className="text-xs text-gray-500">
                    Selecione um paciente da lista
                  </p>
                )}
                {selectedPacienteId && (
                  <p className="text-xs text-green-600">
                    ✓ Paciente selecionado
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data da Consulta *</Label>
                <Input
                  id="data"
                  type="date"
                  value={dataConsulta}
                  onChange={(e) => setDataConsulta(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição da Consulta *</Label>
              <Textarea
                id="descricao"
                placeholder="Ex: Paciente fez atividade recreativa hoje. Mostrou grande evolução..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* CHECKBOX: cadastrar outro em seguida */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="continuar"
                type="checkbox"
                checked={continuarCadastrando}
                onChange={(e) => setContinuarCadastrando(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-blue-600"
              />
              <Label htmlFor="continuar" className="text-sm cursor-pointer select-none">
                Cadastrar outro atendimento?
              </Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={salvando}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
                disabled={!selectedPacienteId || salvando}
              >
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}