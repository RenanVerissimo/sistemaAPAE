import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfessionalType } from '../../interfaces/interfaces';
import { cadastrarProfissional } from '@/app/services/api';
import SnackbarComponent from '../../SnackbarComponent';


export function CadastroProfissionais() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [especialidade, setEspecialidade] = useState<ProfessionalType>('psicologo');
  const [registroProfissional, setRegistroProfissional] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [outraEspecialidade, setOutraEspecialidade] = useState('');
  const [qtdAtendimentos, setQtdAtendimentos] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      const especialidadeFinal =
        especialidade === 'outro' ? outraEspecialidade : especialidade;

      await cadastrarProfissional({
        nome,
        email,
        senha,
        especialidade: especialidadeFinal,
        registroProfissional,
        dataNasc,
        qtdAtendimentos,
        rolee: '',
      });

      // sucesso → volta para a lista levando a mensagem
      navigate('/SecretariaDashboard/ProfissionalCard', {
        state: {
          snackbar: {
            open: true,
            message: 'Profissional cadastrado com sucesso!',
            severity: 'success',
          },
        },
      });
    } catch (error) {
      console.error('Erro ao cadastrar profissional:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao cadastrar profissional. Verifique os dados e tente novamente.',
        severity: 'error',
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">Cadastrar Profissional</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Profissional</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Data de Nascimento *</Label>
              <Input
                type="date"
                value={dataNasc}
                onChange={e => setDataNasc(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Senha *</Label>
              <Input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                minLength={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Especialidade *</Label>
              <Select value={especialidade} onValueChange={v => setEspecialidade(v as ProfessionalType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psiquiatra">Psiquiatra</SelectItem>
                  <SelectItem value="psicologo">Psicólogo(a)</SelectItem>
                  <SelectItem value="fonoaudiologo">Fonoaudiólogo(a)</SelectItem>
                  <SelectItem value="TO">Terapeuta Ocupacional</SelectItem>
                  <SelectItem value="assistente social">Assistente Social</SelectItem>
                  <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {especialidade === 'outro' && (
                <div className="space-y-2">
                  <Label>Qual é a especialidade?</Label>
                  <Input
                    value={outraEspecialidade}
                    onChange={e => setOutraEspecialidade(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Registro Profissional</Label>
              <Input
                placeholder="Ex: CRP 06/123456, CRM 123456, CRFa 1234"
                value={registroProfissional}
                onChange={e => setRegistroProfissional(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade Atendimento</Label>
              <Input
                type="number"
                min={0}
                value={qtdAtendimentos}
                onChange={e => setQtdAtendimentos(e.target.value ? Number(e.target.value) : 0)}
              />
            </div>

            {erro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {erro}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={salvando}
              >
                {salvando ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </div>
  );
}