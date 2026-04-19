import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getRelatorios, getUsers, saveRelatorio, updateRelatorio, deleteRelatorio } from '@/utils/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { LogOut, PlusCircle, ChevronRight, ChevronLeft, Filter, Edit2, Trash2, Search as SearchIcon, FileDown, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { EvolucaoPacientesPage } from '@/app/components/EvolucaoPacientesPage';
import { Relatorio } from '../../interfaces/interfaces';

interface ProfessionalDashboardProps {
  user: User;
  onLogout: () => void;
}

export function ProfessionalDashboard({ user, onLogout }: ProfessionalDashboardProps) {


  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showRelatorios, setShowRelatorios] = useState(false);
  const [editingRelatorio, setEditingRelatorio] = useState<Relatorio | null>(null);
  const [showEvolucaoPaciente, setShowEvolucaoPaciente] = useState(false);
  const [showLaudosPaciente, setShowLaudosPaciente] = useState(false);

  // Form fields
  const [searchPaciente, setSearchPaciente] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState('');
  const [dataConsulta, setDataConsulta] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [descricao, setDescricao] = useState('');
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false);

  // Filtros para histórico
  const [searchPacienteFiltro, setSearchPacienteFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState(false);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const relatoriosPorPagina = 7;

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allRelatorios = getRelatorios();
    const myRelatorios = allRelatorios.filter(r => r.profissionalId === user.id);
    setRelatorios(myRelatorios);

    const users = getUsers();
    const patientList = users.filter(u => u.role === 'aluno');
    setPacientes(patientList);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paciente = pacientes.find(a => a.id === selectedPaciente);
    if (!paciente) return;

    if (editingRelatorio) {
      updateRelatorio(String(editingRelatorio.id), {
        alunoId: paciente.id,
        alunoNome: paciente.nome,
        descricao,
        data: dataConsulta
      });
      setSnackbar({ open: true, message: 'Relatório atualizado com sucesso!', severity: 'success' });
      setEditingRelatorio(null);
    } else {
      const novoRelatorio: Relatorio = {
        id: Number(`rel${Date.now()}`),
        profissionalId: user.id,
        profissionalNome: user.nome,
        profissionalEspecialidade: user.especialidade!,
        alunoId: paciente.id,
        alunoNome: paciente.nome,
        descricao,
        data: dataConsulta,
        createdAt: new Date().toISOString()
      };
      saveRelatorio(novoRelatorio);
      setSnackbar({ open: true, message: 'Relatório criado com sucesso!', severity: 'success' });
    }

    loadData();
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setSearchPaciente('');
    setSelectedPaciente('');
    setDescricao('');
    setDataConsulta(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleEdit = (relatorio: Relatorio) => {
    setEditingRelatorio(relatorio);
    const paciente = pacientes.find(a => a.id === relatorio.alunoId);
    if (paciente) {
      setSearchPaciente(paciente.nome);
      setSelectedPaciente(paciente.id);
    }
    setDataConsulta(relatorio.data);
    setDescricao(relatorio.descricao);
    setShowForm(true);
    setShowRelatorios(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este relatório?')) {
      deleteRelatorio(id);
      loadData();
      setSnackbar({ open: true, message: 'Relatório excluído com sucesso!', severity: 'success' });
    }
  };

  const handleCancelarEdicao = () => {
    setEditingRelatorio(null);
    resetForm();
    setShowForm(false);
  };

  const handleVerRelatorios = () => {
    const hoje = format(new Date(), 'yyyy-MM-dd');
    setDataInicio(hoje);
    setDataFim(hoje);
    setFiltroAplicado(true);
    setShowRelatorios(true);
  };

  const handleSelectPaciente = (paciente: User) => {
    setSearchPaciente(paciente.nome);
    setSelectedPaciente(paciente.id);
    setShowPacienteSuggestions(false);
  };

  const totalRelatorios = relatorios.length;
  const pacientesAtendidos = new Set(relatorios.map(r => r.alunoId)).size;

  const pacientesFiltrados = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(searchPaciente.toLowerCase()) ||
    (paciente.cartaoSUS && paciente.cartaoSUS.includes(searchPaciente))
  );

  const getRelatoriosExibidos = () => {
    let filtered = [...relatorios];

    if (searchPacienteFiltro) {
      filtered = filtered.filter(r =>
        r.alunoNome.toLowerCase().includes(searchPacienteFiltro.toLowerCase())
      );
    }

    if (dataInicio || dataFim) {
      const inicio = dataInicio ? new Date(dataInicio) : null;
      const fim = dataFim ? new Date(dataFim) : null;

      filtered = filtered.filter(r => {
        const dataRel = new Date(r.data);
        if (inicio && fim) {
          return dataRel >= inicio && dataRel <= fim;
        } else if (inicio) {
          return dataRel >= inicio;
        } else if (fim) {
          return dataRel <= fim;
        }
        return true;
      });
    }

    return filtered;
  };

  const relatoriosFiltrados = getRelatoriosExibidos().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const indexUltimo = paginaAtual * relatoriosPorPagina;
  const indexPrimeiro = indexUltimo - relatoriosPorPagina;
  const relatoriosPaginados = relatoriosFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(relatoriosFiltrados.length / relatoriosPorPagina);

  const aplicarFiltros = () => {
    setFiltroAplicado(true);
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setSearchPacienteFiltro('');
    setDataInicio('');
    setDataFim('');
    setFiltroAplicado(false);
    setPaginaAtual(1);
  };

  if (showEvolucaoPaciente) {
    return (
      <EvolucaoPacientesPage
        user={user}
        onBack={() => setShowEvolucaoPaciente(false)}
      />
    );
  }

  if (showLaudosPaciente) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowLaudosPaciente(false)}
                className="hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold">Laudos dos Pacientes</h1>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-16 py-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Paciente</th>
                    <th className="px-4 py-3 text-left font-semibold">Prontuário</th>
                    <th className="px-4 py-3 text-left font-semibold">CPF</th>
                    <th className="px-4 py-3 text-left font-semibold">CNIS</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Descrição</th>
                    <th className="px-4 py-3 text-center font-semibold">Laudo</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((paciente) => (
                    <tr key={paciente.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{paciente.nome}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{paciente.prontuario || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{paciente.cpf || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{paciente.cartaoSUS || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{paciente.ativo ? 'Ativo' : 'Inativo'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{paciente.descricao || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (paciente.laudoFile) {
                              // Download do laudo
                              const url = URL.createObjectURL(paciente.laudoFile);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `laudo_${paciente.nome}.pdf`;
                              a.click();
                            } else {
                              setSnackbar({ open: true, message: 'Paciente não possui laudo anexado', severity: 'error' });
                            }
                          }}
                          className="text-gray-600 hover:bg-gray-100"
                          title="Download Laudo do Paciente"
                        >
                          <FileDown className="w-6 h-6" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{user.nome}</h1>
            <p className="text-sm text-gray-500 capitalize">{user.especialidade}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Botão Novo Relatório */}
        {!showForm && !showRelatorios && (
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg">
            <CardContent className="pt-6">
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-3 text-left"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">Criar Novo Relatório</h3>
                  <p className="text-sm text-blue-100">Registre uma nova consulta com um paciente</p>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Relatório */}
        {showForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => editingRelatorio ? handleCancelarEdicao() : setShowForm(false)}
                  className="hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <CardTitle>{editingRelatorio ? 'Editar Relatório' : 'Novo Relatório'}</CardTitle>
              </div>
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
                        setSelectedPaciente('');
                        setShowPacienteSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowPacienteSuggestions(searchPaciente.length > 0)}
                      placeholder="Digite o nome ou cartão SUS do paciente"
                      required={!selectedPaciente}
                    />
                    {showPacienteSuggestions && pacientesFiltrados.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {pacientesFiltrados.map(paciente => (
                          <div
                            key={paciente.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectPaciente(paciente)}
                          >
                            <p className="font-medium">{paciente.nome}</p>
                            {paciente.cartaoSUS && (
                              <p className="text-xs text-gray-500">SUS: {paciente.cartaoSUS}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {searchPaciente && !selectedPaciente && (
                      <p className="text-xs text-gray-500">Selecione um paciente da lista</p>
                    )}
                    {selectedPaciente && (
                      <p className="text-xs text-green-600">✓ Paciente selecionado</p>
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

                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={!selectedPaciente}>
                    {editingRelatorio ? 'Atualizar' : 'Salvar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => editingRelatorio ? handleCancelarEdicao() : setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Overview */}
        {!showForm && !showRelatorios && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Visão Geral</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalRelatorios}</p>
                        <p className="text-sm text-gray-500">Relatórios criados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{pacientesAtendidos}</p>
                        <p className="text-sm text-gray-500">Pacientes atendidos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Ações</h2>
              <div className="space-y-4">
                <Card className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleVerRelatorios}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Ver Histórico de Relatórios</p>
                          <p className="text-sm text-gray-500">Visualize todos os relatórios já criados</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setShowLaudosPaciente(true)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Laudos</p>
                          <p className="text-sm text-gray-500">Visualize os laudos dos pacientes</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-3">Registro de Evolução</h2>
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg">
              <CardContent className="pt-6">
                <button
                  onClick={() => setShowEvolucaoPaciente(true)}
                  className="w-full flex items-center justify-center gap-3 text-left"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Registrar Evolução do Paciente</h3>
                    <p className="text-sm text-emerald-100">
                      Acompanhe o progresso e desenvolvimento do paciente
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Relatórios */}
        {showRelatorios && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setShowRelatorios(false); limparFiltros(); }}
                className="hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold">Histórico de Relatórios</h2>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="font-semibold text-sm text-gray-700">Filtrar relatórios</p>

                    <div className="space-y-2">
                      <Label htmlFor="searchPacienteFiltro" className="text-xs">Nome do Paciente</Label>
                      <Input
                        id="searchPacienteFiltro"
                        value={searchPacienteFiltro}
                        onChange={(e) => setSearchPacienteFiltro(e.target.value)}
                        placeholder="Digite o nome do paciente..."
                        className="bg-white"
                      />
                    </div>

                    <div className="grid md:grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="dataInicio" className="text-xs">Data Início</Label>
                        <Input
                          id="dataInicio"
                          type="date"
                          value={dataInicio}
                          onChange={(e) => setDataInicio(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataFim" className="text-xs">Data Fim</Label>
                        <Input
                          id="dataFim"
                          type="date"
                          value={dataFim}
                          onChange={(e) => setDataFim(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={aplicarFiltros}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <SearchIcon className="w-4 h-4 mr-2" />
                          Pesquisar
                        </Button>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={limparFiltros}
                          className="w-full"
                          size="sm"
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>

                    {filtroAplicado && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary" className="bg-blue-100">
                          {relatoriosFiltrados.length} resultado{relatoriosFiltrados.length !== 1 ? 's' : ''} encontrado{relatoriosFiltrados.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {relatoriosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-gray-500">
                  <p>Nenhum relatório encontrado</p>
                  <p className="text-sm mt-2">Tente ajustar os filtros</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-3">
                  {relatoriosPaginados.map((relatorio) => (
                    <Card key={relatorio.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{relatorio.alunoNome}</h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(relatorio.data), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(relatorio)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(String(relatorio.id))}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700">{relatorio.descricao}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                      disabled={paginaAtual === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {paginaAtual} de {totalPaginas}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                      disabled={paginaAtual === totalPaginas}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
