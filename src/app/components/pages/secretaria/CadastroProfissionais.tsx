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
import { Eye, EyeOff, Sparkles, Copy } from "lucide-react";


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

  function gerarSenhaMedia(nome: string, dataNasc: string): string {
    // Pega o primeiro nome, sem acentos, capitalizado
    const primeiroNome = (nome || "")
      .trim()
      .split(" ")[0]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, "");

    const nomeFormatado = primeiroNome
      ? primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase()
      : "Usuario";

    // Pega o ano do nascimento (formato esperado: yyyy-mm-dd)
    const ano = dataNasc ? dataNasc.split("-")[0] : new Date().getFullYear().toString();

    // Sorteia um símbolo
    const simbolos = ["@", "#", "$", "!", "&", "*"];
    const simbolo = simbolos[Math.floor(Math.random() * simbolos.length)];

    return `${nomeFormatado}${ano}${simbolo}`;
  }
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite ou gere uma senha"
                    className="pr-20"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((v) => !v)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!senha) return;
                        try {
                          await navigator.clipboard.writeText(senha);
                          setSnackbar({
                            open: true,
                            message: "Senha copiada!",
                            severity: "success",
                          });
                        } catch {
                          setSnackbar({
                            open: true,
                            message: "Não foi possível copiar.",
                            severity: "error",
                          });
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Copiar senha"
                      disabled={!senha}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!nome.trim() || !dataNasc.trim()) {
                      setSnackbar({
                        open: true,
                        message: "Preencha o nome e a data de nascimento antes de gerar a senha.",
                        severity: "warning",
                      });
                      return;
                    }
                    const novaSenha = gerarSenhaMedia(nome, dataNasc);
                    setSenha(novaSenha);
                    setMostrarSenha(true);
                  }}
                  className="whitespace-nowrap"
                  title="Gera uma senha baseada no nome + ano de nascimento"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Gerar senha
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                💡 Use o botão "Gerar senha" pra criar automaticamente. Você pode mostrar e copiar pra entregar ao profissional.
              </p>
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