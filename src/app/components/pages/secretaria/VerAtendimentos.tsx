import { useState, useEffect } from "react";
import { ChevronLeft, Search, Filter, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { getAtendimentos } from "@/app/services/api";
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Relatorio } from "../../interfaces/interfaces";


export function VerAtendimentos() {
  const navigate = useNavigate();
  const location = useLocation();

  const formatarParaInput = (date: Date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };
  const getDataHoje = () => formatarParaInput(new Date());
  const getDataOntem = () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    return formatarParaInput(ontem);
  };

  const [nomePaciente, setNomePaciente] = useState("");
  const [nomeProfissional, setNomeProfissional] = useState("");
  const [dataInicio, setDataInicio] = useState(getDataOntem());
  const [dataFim, setDataFim] = useState(getDataHoje());
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 10;

  const totalPaginas = Math.ceil(relatorios.length / porPagina);
  const inicio = (paginaAtual - 1) * porPagina;
  const relatoriosPaginados = relatorios.slice(inicio, inicio + porPagina);

  const gerarPaginas = () => {
    const paginas = [];
    const maxPaginasVisiveis = 3;

    let inicioP = Math.max(1, paginaAtual - 1);
    let fim = Math.min(totalPaginas, inicioP + maxPaginasVisiveis - 1);

    if (fim - inicioP < maxPaginasVisiveis - 1) {
      inicioP = Math.max(1, fim - maxPaginasVisiveis + 1);
    }

    for (let i = inicioP; i <= fim; i++) {
      paginas.push(i);
    }

    return paginas;
  };

  const handlePesquisar = async () => {
    setCarregando(true);
    setCarregado(false);
    try {
      const data = await getAtendimentos({
        paciente: nomePaciente,
        profissional: nomeProfissional,
        dataInicio,
        dataFim,
      });
      setRelatorios(data);
      setPaginaAtual(1);
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
      setRelatorios([]);
    } finally {
      setCarregando(false);
      setCarregado(true);
    }
  };

  const handleLimpar = () => {
    setNomePaciente("");
    setNomeProfissional("");
    setDataInicio(getDataOntem());
    setDataFim(getDataHoje());
    setRelatorios([]);
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



  useEffect(() => {
    const state = location.state as
      | {
        profissional?: { id: number; nome: string };
        paciente?: { id: number; nome: string };
      }
      | null;

    if (state?.profissional) {
      const nome = state.profissional.nome;
      setNomeProfissional(nome);

      // limpa o state do histórico
      navigate(location.pathname, { replace: true });

      // dispara a busca já com o nome do profissional
      (async () => {
        setCarregando(true);
        setCarregado(false);
        try {
          const data = await getAtendimentos({
            paciente: "",
            profissional: nome,
            dataInicio,
            dataFim,
          });
          setRelatorios(data);
          setPaginaAtual(1);
        } catch (error) {
          console.error("Erro ao buscar atendimentos:", error);
          setRelatorios([]);
        } finally {
          setCarregando(false);
          setCarregado(true);
        }
      })();
    }
    if (state?.paciente) {
      const nome = state.paciente.nome;
      setNomePaciente(nome);

      navigate(location.pathname, { replace: true });

      (async () => {
        setCarregando(true);
        setCarregado(false);
        try {
          const data = await getAtendimentos({
            paciente: nome,
            profissional: "",
            dataInicio,
            dataFim,
          });
          setRelatorios(data);
          setPaginaAtual(1);
        } catch (error) {
          console.error("Erro ao buscar atendimentos:", error);
          setRelatorios([]);
        } finally {
          setCarregando(false);
          setCarregado(true);
        }
      })();
    }
  }, []);


  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
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
              <p className="font-semibold text-sm text-gray-700">Filtrar Atendimentos</p>
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
                  <Label className="text-xs">Nome do Profissional</Label>
                  <Input
                    value={nomeProfissional}
                    onChange={(e) => setNomeProfissional(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePesquisar()}
                    placeholder="Digite o nome do profissional..."
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Data Início</Label>
                  <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="bg-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Data Fim</Label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="bg-white" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handlePesquisar} disabled={carregando}>
                    <Search className="w-4 h-4 mr-2" />
                    {carregando ? "Buscando..." : "Pesquisar"}
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={handleLimpar}>
                    <X className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>
              {carregado && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm">
                  {relatorios.length} resultado{relatorios.length !== 1 ? "s" : ""} encontrado{relatorios.length !== 1 ? "s" : ""}
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
            <p className="text-sm">Use os filtros acima para buscar atendimentos.</p>
          </CardContent>
        </Card>
      )}

      {carregado && relatorios.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <p>Nenhum relatório encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros</p>
          </CardContent>
        </Card>
      )}

      {carregado && relatorios.length > 0 && (
        <>
          <div className="space-y-3">
            {relatoriosPaginados.map((rel) => (
              <Card key={rel.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap gap-2 mb-1">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-1.5">
                        <PersonIcon style={{ fontSize: 16 }} />
                        {rel.nomePaciente}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-1.5">
                        <MedicalServicesIcon style={{ fontSize: 16 }} />
                        {rel.nomeProfissional}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm italic flex items-center gap-1.5">
                        <WorkspacePremiumIcon style={{ fontSize: 16 }} />
                        {rel.especialidade}
                      </span>
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
                Mostrando {inicio + 1}–{Math.min(inicio + porPagina, relatorios.length)} de {relatorios.length}
              </span>

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
          )}
        </>
      )}
    </div>
  );
}