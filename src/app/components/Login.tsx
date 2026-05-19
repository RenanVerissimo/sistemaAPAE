import { useState } from 'react';

import { login } from '@/app/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { Profissional } from './interfaces/interfaces';
import SnackbarComponent from './SnackbarComponent';

interface LoginProps {
  onLogin: (user: Profissional) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCarregando(true);

    try {
      const user = await login(email, senha);

      if (user) {
        const role = user.rolee === 'SECRETARIA' ? 'secretaria' : 'profissional';
        setSnackbar({
          open: true,
          message: 'Logado com sucesso!',
          severity: 'success',
        });
        setTimeout(() => {
          onLogin({ ...user, role });
        }, 700);
      } else {
        const message = 'Login ou senha errados';
        setError(message);
        setSnackbar({
          open: true,
          message,
          severity: 'error',
        });
      }
    } catch (err) {
      console.error(err);
      const message = 'Erro ao conectar com o servidor';
      setError(message);
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setCarregando(false);
    }
  };

  // 🔧 ATALHOS DE TESTE — REMOVER DEPOIS
  const preencherPaula = () => {
    setEmail('paula.secretaria@apae.com');
    setSenha('123456');
  };

  const preencherCarlos = () => {
    setEmail('carlos.mendes@apae.com');
    setSenha('123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Sistema APAE</CardTitle>
          <CardDescription>
            Gerenciamento de Consultas e Relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@apae.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((valor) => !valor)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* 🔧 ATALHOS DE TESTE — REMOVER DEPOIS */}
           {/*<div className="mt-6 pt-4 border-t border-dashed border-gray-300">
            <p className="text-xs text-gray-500 mb-2 text-center">
              Atalhos de teste (remover depois)
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={preencherPaula}
              >
                Paula (Secretaria)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={preencherCarlos}
              >
                Carlos (Profissional)
              </Button>
            </div> 
          </div>
          */}
        </CardContent>
      </Card>
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
