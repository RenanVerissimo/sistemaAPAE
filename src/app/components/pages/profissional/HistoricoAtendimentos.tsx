import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Filter, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Profissional, User } from "../../interfaces/interfaces";
import { getAllPacientes, getAllProfissionais, getAtendimentos } from "@/app/services/api";
import { Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/app/components/ui/textarea";
import { atualizarAtendimento, deleteAtendimento } from "@/app/services/api";


interface HistoricoAtendimentosProps {
  user: User;
}

interface PacienteAPI {
  id: number;
  nome: string;
  cartaoSUS?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface HistoricoAtendimentosProps {
  user: User;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

export function HistoricoAtendimentos({ user, setSnackbar }: HistoricoAtendimentosProps) {

  const navigate = useNavigate();

  const [nomePaciente, setNomePaciente] = useState("");
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const formatarParaInput = (d: Date) => d.toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(formatarParaInput(ontem));
  const [dataFim, setDataFim] = useState(formatarParaInput(hoje));
  const [profissionalId, setProfissionalId] = useState<string>("");
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 10;

  const [pacientes, setPacientes] = useState<PacienteAPI[]>([]);
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false);

  const [modalEdicao, setModalEdicao] = useState<any | null>(null);
  const [modalExclusao, setModalExclusao] = useState<any | null>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editData, setEditData] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const podeEditar = (rel: any) => {
    const donoId = rel.profissional_id ?? rel.profissionalId;
    return Number(donoId) === Number(user.id);
  };

  const abrirModalEdicao = (rel: any) => {
    setModalEdicao(rel);
    setEditDescricao(rel.descricao || "");
    setEditData(rel.dataConsulta?.split("T")[0] || "");
    setEditPacienteId(rel.paciente_id ?? rel.pacienteId ?? null);
    setEditPacienteNome(rel.nomePaciente || rel.paciente_nome || "");
    setEditPacienteSearch("");
    setEditandoPaciente(false);
  };

  const fecharModalEdicao = () => {
    setModalEdicao(null);
    setEditDescricao("");
    setEditData("");
    setEditPacienteId(null);
    setEditPacienteNome("");
    setEditPacienteSearch("");
    setEditandoPaciente(false);
  };

  const salvarEdicao = async () => {
    if (!modalEdicao) return;
    setSalvando(true);
    try {
      await atualizarAtendimento(modalEdicao.id, {
        paciente_id: editPacienteId,
        descricao: editDescricao,
        dataConsulta: editData,
        profissional_id: Number(user.id),
      });
      setAtendimentos((prev) =>
        prev.map((a) =>
          a.id === modalEdicao.id
            ? {
              ...a,
              descricao: editDescricao,
              dataConsulta: editData,
              paciente_id: editPacienteId,
              nomePaciente: editPacienteNome,
              paciente_nome: editPacienteNome,
            }
            : a
        )
      );
      setSnackbar({
        open: true,
        message: "Atendimento atualizado com sucesso!",
        severity: "success",
      });
      fecharModalEdicao();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Erro ao atualizar atendimento",
        severity: "error",
      });
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    if (!modalExclusao) return;
    setExcluindo(true);
    try {
      await deleteAtendimento(modalExclusao.id, Number(user.id));
      setAtendimentos((prev) => prev.filter((a) => a.id !== modalExclusao.id));
      setSnackbar({
        open: true,
        message: "Atendimento excluído com sucesso!",
        severity: "success",
      });
      setModalExclusao(null);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Erro ao excluir atendimento",
        severity: "error",
      });
    } finally {
      setExcluindo(false);
    }
  };


  const [editandoPaciente, setEditandoPaciente] = useState(false);
  const [editPacienteSearch, setEditPacienteSearch] = useState("");
  const [editPacienteId, setEditPacienteId] = useState<number | null>(null);
  const [editPacienteNome, setEditPacienteNome] = useState("");
  const [showEditPacienteSugest, setShowEditPacienteSugest] = useState(false);

  // Carrega profissionais da mesma especialidade
  useEffect(() => {
    const carregarProfissionais = async () => {
      try {
        const lista: Profissional[] = await getAllProfissionais();
        const mesmaEspecialidade = lista.filter(
          (p) =>
            p.especialidade?.toLowerCase() === user.especialidade?.toLowerCase()
        );
        setProfissionais(mesmaEspecialidade);

        // Pré-seleciona o profissional logado
        if (user.id) {
          setProfissionalId(String(user.id));
        }
      } catch (err) {
        console.error("Erro ao carregar profissionais:", err);
      }
    };
    carregarProfissionais();
  }, [user.especialidade, user.id]);

  // Filtra atendimentos por profissional selecionado (client-side)
  const atendimentosFiltrados = useMemo(() => {
    if (!profissionalId) return atendimentos;
    const idNum = Number(profissionalId);
    return atendimentos.filter(
      (a) =>
        a.profissional_id === idNum ||
        a.profissionalId === idNum ||
        a.nomeProfissional ===
        profissionais.find((p) => p.id === idNum)?.nome
    );
  }, [atendimentos, profissionalId, profissionais]);

  const totalPaginas = Math.ceil(atendimentosFiltrados.length / porPagina);
  const inicio = (paginaAtual - 1) * porPagina;
  const atendimentosPaginados = atendimentosFiltrados.slice(
    inicio,
    inicio + porPagina
  );

  const gerarPaginas = () => {
    const paginas: number[] = [];
    const max = 3;
    let i = Math.max(1, paginaAtual - 1);
    let f = Math.min(totalPaginas, i + max - 1);
    if (f - i < max - 1) i = Math.max(1, f - max + 1);
    for (let n = i; n <= f; n++) paginas.push(n);
    return paginas;
  };

  const handlePesquisar = async () => {
    setCarregando(true);
    setCarregado(false);
    try {
      const data = await getAtendimentos({
        paciente: nomePaciente,
        especialidade: user.especialidade,
        dataInicio,
        dataFim,
      });
      setAtendimentos(data);
      setPaginaAtual(1);
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
      setAtendimentos([]);
    } finally {
      setCarregando(false);
      setCarregado(true);
    }
  };

  const handleLimpar = () => {
    setNomePaciente("");
    setDataInicio(formatarParaInput(ontem));
    setDataFim(formatarParaInput(hoje));
    setProfissionalId(user.id ? String(user.id) : "");
    setAtendimentos([]);
    setCarregado(false);
  };

  const formatarData = (data: string) => {
    if (!data) return "-";
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(nomePaciente.toLowerCase()) ||
      (p.cartaoSUS && p.cartaoSUS.includes(nomePaciente))
  );

  const handleSelectPaciente = (paciente: PacienteAPI) => {
    setNomePaciente(paciente.nome);
    setShowPacienteSuggestions(false);
  };

  const pacientesFiltradosEdit = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(editPacienteSearch.toLowerCase()) ||
      (p.cartaoSUS && p.cartaoSUS.includes(editPacienteSearch))
  );

  // Reset paginação quando muda o filtro de profissional
  useEffect(() => {
    setPaginaAtual(1);
  }, [profissionalId]);

  useEffect(() => {
    const carregarPacientes = async () => {
      try {
        const lista: PacienteAPI[] = await getAllPacientes();
        setPacientes(lista);
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
      }
    };
    carregarPacientes();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">Histórico de Atendimentos</h2>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 space-y-4">
              <p className="font-semibold text-sm text-gray-700">
                Filtrar atendimentos
              </p>

              {/* Linha 1: Paciente + Profissional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 relative">
                  <Label className="text-xs">Nome do Paciente</Label>
                  <Input
                    value={nomePaciente}
                    onChange={(e) => {
                      setNomePaciente(e.target.value);
                      setShowPacienteSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowPacienteSuggestions(nomePaciente.length > 0)}
                    onBlur={() =>
                      setTimeout(() => setShowPacienteSuggestions(false), 150)
                    }
                    onKeyDown={(e) => e.key === "Enter" && handlePesquisar()}
                    placeholder="Digite o nome do paciente..."
                    className="bg-white"
                    autoComplete="off"
                  />
                  {showPacienteSuggestions && pacientesFiltrados.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {pacientesFiltrados.map((paciente) => (
                        <div
                          key={paciente.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() => handleSelectPaciente(paciente)}
                        >
                          <p className="font-medium text-sm">{paciente.nome}</p>
                          {paciente.cartaoSUS && (
                            <p className="text-xs text-gray-500">SUS: {paciente.cartaoSUS}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Profissional</Label>
                  <select
                    value={profissionalId}
                    onChange={(e) => setProfissionalId(e.target.value)}
                    className="w-full bg-white border border-input rounded-md h-9 px-3 text-sm"
                  >
                    <option value="">Todos os profissionais</option>
                    {profissionais.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linha 2: Datas + Botões */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    onClick={handlePesquisar}
                    disabled={carregando}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {carregando ? "Buscando..." : "Pesquisar"}
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={handleLimpar}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>

              {carregado && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-sm"
                >
                  {atendimentosFiltrados.length} resultado
                  {atendimentosFiltrados.length !== 1 ? "s" : ""} encontrado
                  {atendimentosFiltrados.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE EDIÇÃO */}
      {modalEdicao && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={fecharModalEdicao}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Editar Atendimento
              </h3>
              <button
                onClick={fecharModalEdicao}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1 relative">
                <Label className="text-xs text-gray-600">Paciente</Label>

                {!editandoPaciente ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 flex-1">
                      {editPacienteNome}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditandoPaciente(true);
                        setEditPacienteSearch("");
                      }}
                      className="cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Trocar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Input
                        value={editPacienteSearch}
                        onChange={(e) => {
                          setEditPacienteSearch(e.target.value);
                          setShowEditPacienteSugest(e.target.value.length > 0);
                        }}
                        onFocus={() =>
                          setShowEditPacienteSugest(editPacienteSearch.length > 0)
                        }
                        onBlur={() =>
                          setTimeout(() => setShowEditPacienteSugest(false), 150)
                        }
                        placeholder="Digite o nome do novo paciente..."
                        autoComplete="off"
                        className="bg-blue-50 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditandoPaciente(false);
                          setEditPacienteSearch("");
                          setShowEditPacienteSugest(false);
                        }}
                        className="cursor-pointer"
                      >
                        Cancelar
                      </Button>
                    </div>

                    {showEditPacienteSugest && pacientesFiltradosEdit.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {pacientesFiltradosEdit.map((paciente) => (
                          <div
                            key={paciente.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => {
                              setEditPacienteId(paciente.id);
                              setEditPacienteNome(paciente.nome);
                              setEditandoPaciente(false);
                              setEditPacienteSearch("");
                              setShowEditPacienteSugest(false);
                            }}
                          >
                            <p className="font-medium text-sm">{paciente.nome}</p>
                            {paciente.cartaoSUS && (
                              <p className="text-xs text-gray-500">SUS: {paciente.cartaoSUS}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-data" className="text-xs">Data da Consulta *</Label>
                <Input
                  id="edit-data"
                  type="date"
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="bg-blue-50 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-desc" className="text-xs">Descrição *</Label>
                <Textarea
                  id="edit-desc"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  rows={5}
                  className="bg-blue-50 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                onClick={fecharModalEdicao}
                disabled={salvando}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={salvarEdicao}
                disabled={salvando || !editDescricao || !editData}
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO */}
      {modalExclusao && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !excluindo && setModalExclusao(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Excluir Atendimento
              </h3>
              <button
                onClick={() => setModalExclusao(null)}
                disabled={excluindo}
                className="text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-700">
                Tem certeza que deseja excluir este atendimento?
              </p>
              <div className="bg-gray-50 border rounded-md p-3 space-y-1">
                <p className="text-sm">
                  <span className="font-semibold">Paciente:</span>{" "}
                  {modalExclusao.nomePaciente || modalExclusao.paciente_nome}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Data:</span>{" "}
                  {formatarData(modalExclusao.dataConsulta)}
                </p>
                {modalExclusao.descricao && (
                  <p className="text-sm text-gray-600 italic mt-1 line-clamp-2">
                    "{modalExclusao.descricao}"
                  </p>
                )}
              </div>
              <p className="text-xs text-red-600">
                ⚠️ Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setModalExclusao(null)}
                disabled={excluindo}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarExcluir}
                disabled={excluindo}
                className="bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                {excluindo ? "Excluindo..." : "Sim, excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!carregado && !carregando && (
        <Card>
          <CardContent className="text-center py-12 text-gray-400">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Use os filtros acima para buscar atendimentos</p>
          </CardContent>
        </Card>
      )}

      {carregado && atendimentosFiltrados.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <p>Nenhum atendimento encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros</p>
          </CardContent>
        </Card>
      )}

      {carregado && atendimentosFiltrados.length > 0 && (
        <>
          <div className="space-y-3">
            {atendimentosPaginados.map((rel) => {
              const ehDono = podeEditar(rel);

              return (
                <Card key={rel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    {/* Linha do topo: badges + botões */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-1.5">
                          <PersonIcon style={{ fontSize: 16 }} />
                          {rel.nomePaciente || rel.paciente_nome}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-1.5">
                          <MedicalServicesIcon style={{ fontSize: 16 }} />
                          {rel.nomeProfissional || rel.profissional_nome || user.nome}
                        </span>
                        {(rel.especialidade || user.especialidade) && (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm italic flex items-center gap-1.5">
                            <WorkspacePremiumIcon style={{ fontSize: 16 }} />
                            {rel.especialidade || user.especialidade}
                          </span>
                        )}
                      </div>

                      {ehDono && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModalEdicao(rel)}
                            className="cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModalExclusao(rel)}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">{formatarData(rel.dataConsulta)}</p>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{rel.descricao}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
              <span>
                Mostrando {inicio + 1}–
                {Math.min(inicio + porPagina, atendimentosFiltrados.length)} de{" "}
                {atendimentosFiltrados.length}
              </span>

              <div className="flex items-center gap-1">
                <button
                  className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaAtual(1)}
                >
                  {"<<"}
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaAtual((p) => p - 1)}
                >
                  <NavigateBeforeIcon fontSize="small" />
                </button>

                {paginaAtual > 2 && (
                  <>
                    <button
                      className="px-2 py-1 rounded hover:bg-gray-200 cursor-pointer"
                      onClick={() => setPaginaAtual(1)}
                    >
                      1
                    </button>
                    <span className="px-1">...</span>
                  </>
                )}

                {gerarPaginas().map((n) => (
                  <button
                    key={n}
                    className={`px-2 py-1 rounded cursor-pointer ${n === paginaAtual ? "bg-gray-800 text-white" : "hover:bg-gray-200"
                      }`}
                    onClick={() => setPaginaAtual(n)}
                  >
                    {n}
                  </button>
                ))}

                {paginaAtual < totalPaginas - 1 && (
                  <>
                    <span className="px-1">...</span>
                    <button
                      className="px-2 py-1 rounded hover:bg-gray-200 cursor-pointer"
                      onClick={() => setPaginaAtual(totalPaginas)}
                    >
                      {totalPaginas}
                    </button>
                  </>
                )}

                <button
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPaginaAtual((p) => p + 1)}
                >
                  <NavigateNextIcon fontSize="small" />
                </button>
                <button
                  className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPaginaAtual(totalPaginas)}
                >
                  {">>"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}