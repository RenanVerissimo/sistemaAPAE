import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Filter, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { getAllProfissionais, getAtendimentos } from "@/app/services/api";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Profissional, User } from "../../interfaces/interfaces";


interface HistoricoAtendimentosProps {
  user: User;
}

export function HistoricoAtendimentos({ user }: HistoricoAtendimentosProps) {
  const navigate = useNavigate();

  const [nomePaciente, setNomePaciente] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [profissionalId, setProfissionalId] = useState<string>("");
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 10;

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
      } catch (err) {
        console.error("Erro ao carregar profissionais:", err);
      }
    };
    carregarProfissionais();
  }, [user.especialidade]);

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
    setDataInicio("");
    setDataFim("");
    setProfissionalId("");
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

  // Reset paginação quando muda o filtro de profissional
  useEffect(() => {
    setPaginaAtual(1);
  }, [profissionalId]);

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
                <div className="space-y-1">
                  <Label className="text-xs">Nome do Paciente</Label>
                  <Input
                    value={nomePaciente}
                    onChange={(e) => setNomePaciente(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePesquisar()}
                    placeholder="Digite o nome do paciente..."
                    className="bg-white"
                  />
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
            {atendimentosPaginados.map((rel) => (
              <Card key={rel.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap gap-2 mb-1">
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
                    <p className="text-xs text-gray-400">{formatarData(rel.dataConsulta)}</p>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{rel.descricao}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    className={`px-2 py-1 rounded cursor-pointer ${
                      n === paginaAtual ? "bg-gray-800 text-white" : "hover:bg-gray-200"
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