import { useState } from 'react';
import { ProfessionalType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CadastroProfissionais() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [especialidade, setEspecialidade] = useState<ProfessionalType>('psicologo');
  const [registroProfissional, setRegistroProfissional] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [outraEspecialidade, setOutraEspecialidade] = useState('');
  const [qtdAtendimentos, setQtdAtendimentos] = useState(0);

  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { navigate(-1) }}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <h2 className="text-lg font-semibold">
          Cadastrar Profissional
        </h2>
      </div>
      <Card className=''>
        <CardHeader>
          <CardTitle>Novo Profissional</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={() => { }} className="space-y-4">
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
              {especialidade === "outro" && (
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
                onChange={(e) =>
                  setQtdAtendimentos(e.target.value ? Number(e.target.value) : 0)
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Cadastrar
              </Button>
              <Button type="button" variant="outline" onClick={handleVoltar}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
