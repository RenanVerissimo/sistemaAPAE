import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  getAllPacientes,
  getAllProfissionais,
  getAtendimentos,
} from "../services/api";
import { Atendimento, Paciente, Profissional } from "./interfaces/interfaces";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

function formatarDataNascimento(data?: string) {
  if (!data) return "-";

  const [ano, mes, dia] = data.split("T")[0].split("-");
  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

function limitarTexto(texto?: string, limite = 45) {
  if (!texto) return "-";
  return texto.length > limite ? `${texto.slice(0, limite)}...` : texto;
}

function obterEspecialidade(profissional: Profissional) {
  if (profissional.especialidade === "outro") {
    return profissional.outraEspecialidade?.trim() || "Outro";
  }

  return String(profissional.especialidade || "Sem especialidade").trim();
}

function normalizarChave(valor: string) {
  return valor.trim().toLowerCase();
}

function getEspecialidadeBadgeColor(especialidade?: string) {
  if (!especialidade) return "bg-gray-100 text-gray-800";

  switch (normalizarChave(especialidade)) {
    case "psiquiatra":
      return "bg-purple-100 text-purple-800";
    case "psicologo":
    case "psicólogo":
      return "bg-blue-100 text-blue-800";
    case "fonoaudiologo":
    case "fonoaudiólogo":
      return "bg-green-100 text-green-800";
    case "to":
      return "bg-orange-100 text-orange-800";
    case "assistente social":
      return "bg-pink-100 text-pink-800";
    case "fisioterapeuta":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function PacientesTableAtendimentoEspecifico() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [descricaoSelecionada, setDescricaoSelecionada] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroAplicado, setFiltroAplicado] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Ativo");
  const pacientesPorPagina = 10;

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);

      try {
        const [pacientesData, profissionaisData, atendimentosData] =
          await Promise.all([
            getAllPacientes(),
            getAllProfissionais(),
            getAtendimentos({}),
          ]);

        setPacientes(pacientesData);
        setProfissionais(profissionaisData);
        setAtendimentos(atendimentosData);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const especialidades = useMemo(() => {
    const especialidadesMap = new Map<string, string>();

    profissionais.forEach((profissional) => {
      const especialidade = obterEspecialidade(profissional);
      const chave = normalizarChave(especialidade);

      if (!especialidadesMap.has(chave)) {
        especialidadesMap.set(chave, especialidade);
      }
    });

    return Array.from(especialidadesMap.entries())
      .map(([chave, nome]) => ({ chave, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [profissionais]);

  const atendimentosPorPacienteEspecialidade = useMemo(() => {
    const contagem = new Map<string, number>();

    atendimentos.forEach((atendimento) => {
      if (!atendimento.paciente_id || !atendimento.especialidade) return;

      const chave = `${atendimento.paciente_id}-${normalizarChave(
        atendimento.especialidade
      )}`;

      contagem.set(chave, (contagem.get(chave) || 0) + 1);
    });

    return contagem;
  }, [atendimentos]);

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const matchBusca = filtroAplicado.trim()
      ? paciente.nome.toLowerCase().includes(filtroAplicado.toLowerCase()) ||
        paciente.prontuario.toLowerCase().includes(filtroAplicado.toLowerCase()) ||
        (paciente.cpf || "").includes(filtroAplicado) ||
        (paciente.cartaoSUS || "").includes(filtroAplicado)
      : true;

    const matchStatus =
      filtroStatus === "Todos" ? true : paciente.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  const totalPaginas = Math.ceil(pacientesFiltrados.length / pacientesPorPagina);
  const indiceUltimoPaciente = paginaAtual * pacientesPorPagina;
  const indicePrimeiroPaciente = indiceUltimoPaciente - pacientesPorPagina;
  const pacientesPaginaAtual = pacientesFiltrados.slice(
    indicePrimeiroPaciente,
    indiceUltimoPaciente
  );
  const inicio = pacientesFiltrados.length === 0 ? 0 : indicePrimeiroPaciente + 1;
  const fim = Math.min(indiceUltimoPaciente, pacientesFiltrados.length);

  const handleBuscar = () => {
    setFiltroAplicado(termoBusca);
    setPaginaAtual(1);
  };

  const handleLimparBusca = () => {
    setTermoBusca("");
    setFiltroAplicado("");
    setPaginaAtual(1);
  };

  const gerarPaginas = () => {
    const paginas = [];
    const maxPaginasVisiveis = 3;

    let inicioPagina = Math.max(1, paginaAtual - 1);
    let fimPagina = Math.min(
      totalPaginas,
      inicioPagina + maxPaginasVisiveis - 1
    );

    if (fimPagina - inicioPagina < maxPaginasVisiveis - 1) {
      inicioPagina = Math.max(1, fimPagina - maxPaginasVisiveis + 1);
    }

    for (let i = inicioPagina; i <= fimPagina; i++) {
      paginas.push(i);
    }

    return paginas;
  };

  if (carregando) {
    return (
      <Card className="rounded-xl border border-gray-200 p-6 text-sm text-gray-500">
        Carregando pacientes...
      </Card>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-3 items-center">
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          placeholder="Buscar por nome, CPF, prontuário ou cartão SUS..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />

        <Button
          onClick={handleBuscar}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4"
        >
          Buscar
        </Button>

        {filtroAplicado && (
          <Button variant="outline" onClick={handleLimparBusca} className="px-4">
            Limpar
          </Button>
        )}

        <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2 py-1 bg-white">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap uppercase">
            Filtro de status:
          </span>

          {(["Todos", "Ativo", "Inativo"] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setFiltroStatus(status);
                setPaginaAtual(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filtroStatus === status
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

      <Card className="rounded-xl overflow-hidden shadow-md border border-gray-200">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-sm">
          <thead className="bg-gray-300 border-b">
            <tr>
              <th className="w-[220px] px-2 py-2 text-center font-semibold">
                Nome
              </th>
              <th className="w-[116px] px-2 py-2 text-center font-semibold">
                Data Nascimento
              </th>
              <th className="w-[128px] px-2 py-2 text-center font-semibold">
                CPF
              </th>
              <th className="w-[160px] px-2 py-2 text-center font-semibold">
                Descrição
              </th>
              {especialidades.map((especialidade) => (
                <th
                  key={especialidade.chave}
                  className="w-[88px] px-1 py-2 text-center font-semibold text-xs whitespace-normal break-words"
                >
                  <span
                    className={`inline-flex max-w-full rounded-md px-2 py-1 text-xs font-semibold leading-tight ${getEspecialidadeBadgeColor(
                      especialidade.nome
                    )}`}
                  >
                    {especialidade.nome}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pacientesPaginaAtual.map((paciente) => (
              <tr
                key={paciente.id}
                className="h-[52px] border-b hover:bg-gray-100"
              >
                <td className="h-[52px] px-2 py-2 text-center align-middle">
                  <span className="block whitespace-normal break-words leading-tight" title={paciente.nome}>
                    {paciente.nome}
                  </span>
                </td>
                <td className="h-[52px] px-2 py-2 text-center align-middle whitespace-nowrap">
                  {formatarDataNascimento(paciente.dataNasc)}
                </td>
                <td className="h-[52px] px-1 py-2 text-center align-middle text-xs whitespace-nowrap">
                  <span title={paciente.cpf || "-"}>
                    {paciente.cpf || "-"}
                  </span>
                </td>
                <td className="h-[52px] overflow-hidden px-2 py-2 text-center align-middle">
                  {paciente.descricao && paciente.descricao.length > 45 ? (
                    <div className="flex max-w-full flex-col items-center justify-center overflow-hidden leading-tight">
                      <span
                        className="block max-w-full truncate text-xs"
                        title={paciente.descricao}
                      >
                        {limitarTexto(paciente.descricao)}
                      </span>
                      <button
                        className="text-blue-600 text-xs hover:underline"
                        onClick={() =>
                          setDescricaoSelecionada(paciente.descricao || "")
                        }
                      >
                        Ver mais
                      </button>
                    </div>
                  ) : (
                    <span className="block max-w-full truncate text-xs">
                      {limitarTexto(paciente.descricao)}
                    </span>
                  )}
                </td>
                {especialidades.map((especialidade) => {
                  const chave = `${paciente.id}-${especialidade.chave}`;
                  const total =
                    atendimentosPorPacienteEspecialidade.get(chave) || 0;

                  return (
                    <td
                      key={especialidade.chave}
                      className="h-[52px] px-1 py-2 text-center align-middle font-semibold"
                    >
                      {total}
                    </td>
                  );
                })}
              </tr>
            ))}

            {pacientesFiltrados.length === 0 && (
              <tr>
                <td
                  className="px-3 py-8 text-center text-gray-500"
                  colSpan={4 + especialidades.length}
                >
                  Nenhum paciente encontrado.
                </td>
              </tr>
            )}

            {Array.from({
              length:
                pacientesFiltrados.length === 0
                  ? 0
                  : pacientesPorPagina - pacientesPaginaAtual.length,
            }).map((_, index) => (
              <tr key={`empty-${index}`} className="h-[52px] border-b">
                <td colSpan={4 + especialidades.length}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Mostrando {inicio}-{fim} de {pacientesFiltrados.length} pacientes
          {filtroAplicado && ` (filtrado de ${pacientes.length})`}
        </p>

        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
          >
            <NavigateBeforeIcon fontSize="small" />
          </Button>

          {gerarPaginas().map((pagina) => (
            <Button
              key={pagina}
              variant={paginaAtual === pagina ? "default" : "outline"}
              size="sm"
              onClick={() => setPaginaAtual(pagina)}
            >
              {pagina}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={paginaAtual === totalPaginas || totalPaginas === 0}
            onClick={() =>
              setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))
            }
          >
            <NavigateNextIcon fontSize="small" />
          </Button>
        </div>
        </div>
      </Card>

      {descricaoSelecionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Descrição do paciente
            </h2>
            <p className="max-h-[60vh] overflow-y-auto break-words text-sm text-gray-700 whitespace-pre-wrap">
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
    </>
  );
}
