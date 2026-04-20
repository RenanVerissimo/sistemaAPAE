import { useState, useRef } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ChevronLeft, FileDown, FileText, X } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { cadastrarPaciente } from '@/app/services/api';
import SnackbarComponent from '../../SnackbarComponent';
import { Paciente } from '../../interfaces/interfaces';



export function CadastroPacientes() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cartaoSUS, setCartaoSUS] = useState('');
  const [descricao, setDescricao] = useState('');
  const [laudoFile, setLaudoFile] = useState<File | null>(null);
  const [dataNasc, setDataNasc] = useState("");
  const [prontuario, setProntuario] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const [cadastrarOutro, setCadastrarOutro] = useState(false);

  const handleCadastrarPaciente = async () => {
    if (!nome.trim() || !dataNasc.trim() || !prontuario.trim() || !cpf.trim() || !cartaoSUS.trim()) {
      setSnackbar({
        open: true,
        message: "Preencha todos os campos obrigatórios.",
        severity: "warning",
      });
      return;
    }

    const novoPaciente: Paciente = {
      id: 0,
      nome,
      cpf,
      cartaoSUS,
      descricao,
      dataNasc,
      prontuario,
      status: "Ativo",
      qtdConsultasRealizadas: 0,
    };

    try {
      await cadastrarPaciente(novoPaciente);

      if (cadastrarOutro) {
        // limpa o formulário e mostra o snackbar aqui mesmo
        setNome('');
        setCpf('');
        setCartaoSUS('');
        setDescricao('');
        setDataNasc('');
        setProntuario('');
        setLaudoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        setSnackbar({
          open: true,
          message: "Paciente CADASTRADO com sucesso!",
          severity: "success",
        });
      } else {
        // volta para PacienteCard levando a mensagem
        navigate("/SecretariaDashboard/PacienteCard", {
          state: {
            snackbar: {
              open: true,
              message: "Paciente CADASTRADO com sucesso!",
              severity: "success",
            },
          },
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao cadastrar paciente.",
        severity: "error",
      });
    }
  };

  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate("/SecretariaDashboard/PacienteCard");
  };


  return (

    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleVoltar}>
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <h2 className="text-lg font-semibold">
          Cadastrar Paciente
        </h2>
      </div>

      <Card>

        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="space-y-3">
              <Label>Nome Completo *</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Nascimento *</Label>
              <Input
                value={dataNasc}
                type='date'
                onChange={(e) => setDataNasc(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Prontuário *</Label>
              <Input
                value={prontuario}
                onChange={(e) => setProntuario(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>CPF *</Label>
              <Input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Cartão SUS *</Label>
              <Input
                value={cartaoSUS}
                onChange={(e) => setCartaoSUS(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição do Paciente</Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Observações, necessidades especiais, histórico..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Laudo do Paciente</Label>

              {!laudoFile && (
                <label className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <FileDown className="w-5 h-5 text-blue-600" />
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-gray-700">
                      Anexar laudo
                    </span>
                    <span className="text-gray-500">
                      PDF, JPG ou PNG (até 5MB)
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setLaudoFile(e.target.files?.[0] || null)}
                  />
                </label>
              )}

              {laudoFile && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                      {laudoFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLaudoFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Remover arquivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cadastrarOutro}
                  onChange={(e) => setCadastrarOutro(e.target.checked)}
                  className="w-4 h-4"
                />
                Cadastrar outro paciente?
              </label>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleVoltar}>
                  Cancelar
                </Button>
                <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={handleCadastrarPaciente}>
                  Cadastrar
                </Button>
              </div>
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
