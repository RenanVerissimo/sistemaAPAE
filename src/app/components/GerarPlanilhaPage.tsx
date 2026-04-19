import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getRelatorios, getUsers } from '@/utils/mockData';
import { format } from 'date-fns';

interface GerarPlanilhaPageProps {
  onVoltar: () => void;
}

export function GerarPlanilhaPage({ onVoltar }: GerarPlanilhaPageProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [mesInicio, setMesInicio] = useState(currentMonth.toString());
  const [anoInicio, setAnoInicio] = useState(currentYear.toString());
  const [mesFim, setMesFim] = useState(currentMonth.toString());
  const [anoFim, setAnoFim] = useState(currentYear.toString());

  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const anos = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString());

  const handleGerarPlanilhaTodosPacientes = () => {
    const relatorios = getRelatorios();
    const users = getUsers();
    const pacientes = users.filter(u => u.role === 'aluno');

    // Filtrar por período
    const dataInicioFiltro = new Date(parseInt(anoInicio), parseInt(mesInicio) - 1, 1);
    const dataFimFiltro = new Date(parseInt(anoFim), parseInt(mesFim), 0); // Último dia do mês

    const relatoriosFiltrados = relatorios.filter(r => {
      const dataRel = new Date(r.data);
      return dataRel >= dataInicioFiltro && dataRel <= dataFimFiltro;
    });

    // Agrupar por paciente
    const dadosPorPaciente = pacientes.map(paciente => {
      const atendimentos = relatoriosFiltrados.filter(r => r.alunoId === paciente.id);
      
      return {
        'Nome do Paciente': paciente.nome,
        'CPF': paciente.cpf || '-',
        'CNIS': paciente.cartaoSUS || '-',
        'Status': paciente.ativo ? 'Ativo' : 'Inativo',
        'Total de Atendimentos': atendimentos.length,
        'Descrição': paciente.descricao || '-'
      };
    });

    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(dadosPorPaciente);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atendimentos por Paciente');

    // Baixar arquivo
    const nomeArquivo = `atendimentos_pacientes_${anoInicio}_${mesInicio}_a_${anoFim}_${mesFim}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  };

  const handleGerarPlanilhaDetalhada = () => {
    const relatorios = getRelatorios();

    // Filtrar por período
    const dataInicioFiltro = new Date(parseInt(anoInicio), parseInt(mesInicio) - 1, 1);
    const dataFimFiltro = new Date(parseInt(anoFim), parseInt(mesFim), 0);

    const relatoriosFiltrados = relatorios.filter(r => {
      const dataRel = new Date(r.data);
      return dataRel >= dataInicioFiltro && dataRel <= dataFimFiltro;
    });

    // Preparar dados
    const dadosDetalhados = relatoriosFiltrados.map(r => ({
      'Data': format(new Date(r.data), 'dd/MM/yyyy'),
      'Paciente': r.alunoNome,
      'Profissional': r.profissionalNome,
      'Especialidade': r.profissionalEspecialidade,
      'Descrição': r.descricao,
    }));

    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(dadosDetalhados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atendimentos Detalhados');

    // Baixar arquivo
    const nomeArquivo = `atendimentos_detalhados_${anoInicio}_${mesInicio}_a_${anoFim}_${mesFim}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onVoltar}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Gerar Planilha de Atendimentos</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Período Início */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Período Inicial</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select value={mesInicio} onValueChange={setMesInicio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map(mes => (
                        <SelectItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Select value={anoInicio} onValueChange={setAnoInicio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {anos.map(ano => (
                        <SelectItem key={ano} value={ano}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Período Fim */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Período Final</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select value={mesFim} onValueChange={setMesFim}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map(mes => (
                        <SelectItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Select value={anoFim} onValueChange={setAnoFim}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {anos.map(ano => (
                        <SelectItem key={ano} value={ano}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opções de Download */}
        <Card>
          <CardHeader>
            <CardTitle>Opções de Download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleGerarPlanilhaTodosPacientes}
                className="w-full bg-green-600 hover:bg-green-700 justify-start"
                size="lg"
              >
                <Download className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-semibold">Resumo por Paciente</p>
                  <p className="text-xs text-green-100">
                    Total de atendimentos agrupados por paciente
                  </p>
                </div>
              </Button>

              <Button
                onClick={handleGerarPlanilhaDetalhada}
                className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                size="lg"
              >
                <Download className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-semibold">Relatório Detalhado</p>
                  <p className="text-xs text-blue-100">
                    Todos os atendimentos com descrições completas
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
