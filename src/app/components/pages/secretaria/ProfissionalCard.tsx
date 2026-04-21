import { Button } from "@/app/components/ui/button";
import { Card } from "@mui/material";
import { useState, useEffect } from "react";
import { atualizarProfissional, deleteProfissional, getAllProfissionais } from "@/app/services/api";
import SnackbarComponent from "../../SnackbarComponent";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { ProfessionalType, Profissional } from "../../interfaces/interfaces";
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Pencil, Trash2, UserPlus, KeyRound, Eye, EyeOff, Copy, Sparkles } from "lucide-react";
import { atualizarSenhaProfissional } from "@/app/services/api";

function limparTexto(t: string) {
    return (t || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");
}

function capitalizar(t: string) {
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function charAleatorio(qtd: number) {
    const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let r = "";
    for (let i = 0; i < qtd; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return r;
}

function gerarSenhaProfissional(prof: { nome?: string; dataNasc?: string; email?: string }, tentativa: number) {
    const partes = (prof.nome || "Usuario").trim().split(" ");
    const primeiroNome = capitalizar(limparTexto(partes[0] || "Usuario"));
    const ultimoNome = capitalizar(limparTexto(partes[partes.length - 1] || ""));
    const iniciais = partes.map((p) => limparTexto(p).charAt(0).toUpperCase()).join("");
    const ano = prof.dataNasc ? prof.dataNasc.split("-")[0] : "2025";
    const anoCurto = ano.slice(-2);
    const mes = prof.dataNasc ? prof.dataNasc.split("-")[1] || "01" : "01";
    const dia = prof.dataNasc ? prof.dataNasc.split("-")[2]?.split("T")[0] || "01" : "01";
    const usuarioEmail = capitalizar((prof.email || "").split("@")[0].replace(/[^a-zA-Z0-9]/g, ""));

    const simbolos = ["@", "#", "$", "!", "&", "*"];
    const sim = () => simbolos[Math.floor(Math.random() * simbolos.length)];

    // 5 padrões fixos baseados nos dados
    const padroes = [
        `${primeiroNome}${ano}${sim()}`,
        `${primeiroNome}${dia}${mes}${sim()}`,
        `${ultimoNome || primeiroNome}${ano}${sim()}`,
        `${primeiroNome}${anoCurto}${ano}${sim()}`,
        `${iniciais || primeiroNome.charAt(0)}${dia}${mes}${ano}${sim()}`,
    ];

    if (tentativa < 5) {
        return padroes[tentativa];
    }

    // Após 5ª: alterna entre apae + variações com aleatório
    const variantes = [
        `Apae${primeiroNome}${charAleatorio(3)}${sim()}`,
        `${primeiroNome}Apae${ano}${charAleatorio(2)}`,
        `Apae${anoCurto}${primeiroNome}${sim()}${charAleatorio(2)}`,
        `${ultimoNome || primeiroNome}Apae${charAleatorio(3)}${sim()}`,
        `Apae${iniciais}${ano}${charAleatorio(2)}${sim()}`,
        `${primeiroNome}${charAleatorio(3)}Apae${sim()}`,
    ];
    return variantes[(tentativa - 5) % variantes.length];
}


export default function ProfissionalCard() {

    const [profissionais, setProfissionais] = useState<Profissional[]>([]);

    const [profissionalSelecionado, setProfissionalSelecionado] = useState<Profissional | null>(null);
    const [profissionalSelecionadoDel, setProfissionalSelecionadoDel] = useState<Profissional | null>(null);
    const [deleteProf, setDeleteProf] = useState(false);


    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning",
    });


    const getEspecialidadeBadgeColor = (especialidade?: string) => {
        if (!especialidade) return "bg-gray-100 text-gray-800";

        switch (especialidade.toLowerCase()) {
            case "psiquiatra":
                return "bg-purple-100 text-purple-800";
            case "psicologo":
            case "psicólogo":
                return "bg-blue-100 text-blue-800";
            case "fonoaudiologo":
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
    };

    const especialidades: ProfessionalType[] = [
        "psiquiatra",
        "psicologo",
        "fonoaudiologo",
        "TO",
        "assistente social",
        "fisioterapeuta",
        "outro",
    ];

    const navigate = useNavigate();
    const location = useLocation();

    const handleVoltar = () => {
        navigate("/SecretariaDashboard");
    };


    const fetchProfissionais = async () => {
        const pro = await getAllProfissionais();
        setProfissionais(pro);
    }

    const salvarEdicaoProfissional = async () => {
        if (!profissionalSelecionado) return;

        try {
            let especialidadeFinal = profissionalSelecionado.especialidade;

            if (profissionalSelecionado.especialidade === "outro") {
                especialidadeFinal = profissionalSelecionado.outraEspecialidade || "";
            }

            await atualizarProfissional(profissionalSelecionado.id, {
                ...profissionalSelecionado,
                especialidade: especialidadeFinal,
            });

            setSnackbar({
                open: true,
                message: "Profissional atualizado com sucesso!",
                severity: "success",
            });

            setProfissionalSelecionado(null);
            fetchProfissionais();



        } catch (error) {
            setSnackbar({
                open: true,
                message: "Erro ao atualizar profissional.",
                severity: "error",
            });
        }
    };

    const deleteProfissionalAction = async (profissionalSelecionadoDel: Profissional | null) => {
        if (!profissionalSelecionadoDel) return;

        try {
            await deleteProfissional(profissionalSelecionadoDel.id);
            fetchProfissionais();
            setDeleteProf(false);
            setSnackbar({
                open: true,
                message: "Profissional excluido com sucesso!",
                severity: "success",
            });

        } catch (error) {
            setSnackbar({
                open: true,
                message: "Erro ao EXCLUIR profissional.",
                severity: "error",
            });
        }
    };

    const [profSenha, setProfSenha] = useState<Profissional | null>(null);
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [tentativaGerar, setTentativaGerar] = useState(0);
    const [salvandoSenha, setSalvandoSenha] = useState(false);

    const abrirModalSenha = (prof: Profissional) => {
        setProfSenha(prof);
        setSenhaAtual(prof.senha || "");
        setNovaSenha("");
        setMostrarSenhaAtual(false);
        setMostrarNovaSenha(false);
        setTentativaGerar(0);
    };

    const fecharModalSenha = () => {
        setProfSenha(null);
        setSenhaAtual("");
        setNovaSenha("");
        setTentativaGerar(0);
    };

    const copiar = async (texto: string) => {
        if (!texto) return;
        try {
            await navigator.clipboard.writeText(texto);
            setSnackbar({ open: true, message: "Senha copiada!", severity: "success" });
        } catch {
            setSnackbar({ open: true, message: "Não foi possível copiar.", severity: "error" });
        }
    };

    const handleGerarSenha = () => {
        if (!profSenha) return;
        const nova = gerarSenhaProfissional(profSenha, tentativaGerar);
        setNovaSenha(nova);
        setMostrarNovaSenha(true);
        setTentativaGerar((t) => t + 1);
    };

    const handleSalvarSenha = async () => {
        if (!profSenha || !novaSenha.trim()) {
            setSnackbar({ open: true, message: "Digite ou gere uma senha primeiro.", severity: "warning" });
            return;
        }
        setSalvandoSenha(true);
        try {
            await atualizarSenhaProfissional(profSenha.id, novaSenha);
            setSnackbar({ open: true, message: "Senha atualizada com sucesso!", severity: "success" });
            fecharModalSenha();
            fetchProfissionais();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || "Erro ao atualizar senha.", severity: "error" });
        } finally {
            setSalvandoSenha(false);
        }
    };




    useEffect(() => {
        fetchProfissionais();
    }, []);

    useEffect(() => {
        const state = location.state as { snackbar?: { message: string; severity: any } } | null;
        if (state?.snackbar) {
            setSnackbar({
                open: true,
                message: state.snackbar.message,
                severity: state.snackbar.severity,
            });
            // limpa o state para não reabrir ao recarregar
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

                {/* ESQUERDA */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleVoltar}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <h2 className="text-lg font-semibold">
                        Profissionais
                    </h2>
                </div>

                {/* DIREITA */}
                <div className="flex gap-2">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate("/SecretariaDashboard/ProfissionalCard/VerAtendimentos")}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Atendimentos
                    </Button>

                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                            navigate("/SecretariaDashboard/ProfissionalCard/CadastroProfissional")
                        }
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Cadastrar
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto ">
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-300 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-center font-semibold">Nome</th>
                                    <th className="px-4 py-3 text-center font-semibold">Email</th>
                                    <th className="px-4 py-3 text-center font-semibold">Especialidade</th>
                                    <th className="px-4 py-3 text-center font-semibold">Atendimentos (mês)</th>
                                    <th className="px-4 py-3 text-center font-semibold">Número de Registro Profissional</th>
                                    <th className="px-4 py-3 text-center font-semibold">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profissionais.map((prof) => (
                                    <tr
                                        key={prof.id}
                                        className="border-b hover:bg-gray-200 cursor-pointer"
                                        onClick={() =>
                                            navigate("/SecretariaDashboard/PacienteCard/VerAtendimentos", {
                                                state: {
                                                    profissional: { id: prof.id, nome: prof.nome },
                                                },
                                            })
                                        }
                                    >
                                        <td className="px-4 py-3 text-center">{prof.nome}</td>
                                        <td className="px-4 py-3 text-center">{prof.email}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-md text-xs font-medium ${getEspecialidadeBadgeColor(prof.especialidade)}`}
                                            >
                                                {prof.especialidade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">{prof.qtdAtendimentos}</td>
                                        <td className="px-4 py-3 text-center">{prof.registroProfissional}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setProfissionalSelecionado(prof);
                                                    }}
                                                    title="Editar profissional"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>



                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteProf(true);
                                                        setProfissionalSelecionadoDel(prof);
                                                    }}
                                                    title="Excluir profissional"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        abrirModalSenha(prof);
                                                    }}
                                                    title="Gerenciar senha"
                                                >
                                                    <KeyRound className="w-4 h-4 text-blue-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/*Editar Profissional */}
                {profissionalSelecionado && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 space-y-4">

                            <h2 className="text-lg font-semibold">
                                Editar Profissional
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium">Nome</label>
                                    <input
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={profissionalSelecionado.nome}
                                        onChange={(e) =>
                                            setProfissionalSelecionado({
                                                ...profissionalSelecionado,
                                                nome: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={profissionalSelecionado.email}
                                        onChange={(e) =>
                                            setProfissionalSelecionado({
                                                ...profissionalSelecionado,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Especialidade</label>
                                    <select
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={profissionalSelecionado.especialidade}
                                        onChange={(e) =>
                                            setProfissionalSelecionado({
                                                ...profissionalSelecionado,
                                                especialidade: e.target.value as ProfessionalType,
                                            })
                                        }
                                    >
                                        {especialidades.map((esp) => (
                                            <option key={esp} value={esp}>
                                                {esp}
                                            </option>
                                        ))}
                                    </select>
                                    {profissionalSelecionado.especialidade === "outro" && (
                                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Informe a especialidade
                                            </label>

                                            <p className="text-xs text-gray-500 mb-2">
                                                Você selecionou "Outro". Especifique qual é a especialidade.
                                            </p>

                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Ex: Neuropsicopedagogo"
                                                value={
                                                    profissionalSelecionado.especialidade === "outro"
                                                        ? profissionalSelecionado.outraEspecialidade || ""
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    setProfissionalSelecionado({
                                                        ...profissionalSelecionado,
                                                        outraEspecialidade: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Qtd Atendimentos</label>
                                    <input
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={profissionalSelecionado.qtdAtendimentos}
                                        onChange={(e) =>
                                            setProfissionalSelecionado({
                                                ...profissionalSelecionado,
                                                qtdAtendimentos: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Numero de Registro Profissional</label>
                                    <input
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={profissionalSelecionado.registroProfissional}
                                        onChange={(e) =>
                                            setProfissionalSelecionado({
                                                ...profissionalSelecionado,
                                                registroProfissional: (e.target.value),
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setProfissionalSelecionado(null)}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={salvarEdicaoProfissional}
                                >
                                    Salvar
                                </Button>
                            </div>

                        </div>
                    </div>
                )}

                {/*DELETAR Profissional */}

                {deleteProf && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 space-y-4">
                            <div className="flex justify-center">
                                <div className="border-4 border-red-500 rounded-full">
                                    <PriorityHighIcon
                                        sx={{ fontSize: 40 }}
                                        className="text-red-600"
                                    />
                                </div>
                            </div>
                            <h1 className="text-[25px] font-bold text-center text-gray-800">
                                Excluir Profissional?
                            </h1>

                            <h3 className="text-ls pt-2">Tem certeza que deseja excluir esse profissional?</h3>

                            <p className="text-xs text-red-500 mt-5">
                                Esta ação não poderá ser desfeita.
                            </p>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => { setDeleteProf(false) }}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => { deleteProfissionalAction(profissionalSelecionadoDel) }}
                                >
                                    Excluir
                                </Button>

                            </div>
                        </div>
                    </div>
                )}
                {profSenha && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 space-y-5">
                            <div className="flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold">Gerenciar Senha</h2>
                            </div>

                            <p className="text-sm text-gray-600">
                                Profissional: <span className="font-medium text-gray-800">{profSenha.nome}</span>
                            </p>

                            {/* Senha atual */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700">Senha atual</label>
                                <div className="relative">
                                    <input
                                        type={mostrarSenhaAtual ? "text" : "password"}
                                        value={senhaAtual}
                                        readOnly
                                        className="w-full border rounded-md px-3 py-2 pr-20 bg-gray-50 text-sm"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setMostrarSenhaAtual((v) => !v)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                            title={mostrarSenhaAtual ? "Ocultar" : "Mostrar"}
                                        >
                                            {mostrarSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => copiar(senhaAtual)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                            title="Copiar"
                                            disabled={!senhaAtual}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Nova senha */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700">Nova senha (opcional)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={mostrarNovaSenha ? "text" : "password"}
                                            value={novaSenha}
                                            onChange={(e) => setNovaSenha(e.target.value)}
                                            placeholder="Digite ou gere uma nova senha"
                                            className="w-full border-2 border-blue-300 bg-blue-50 rounded-md px-3 py-2 pr-20 text-sm focus:border-blue-500 focus:outline-none"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setMostrarNovaSenha((v) => !v)}
                                                className="p-1 text-gray-500 hover:text-gray-700"
                                                title={mostrarNovaSenha ? "Ocultar" : "Mostrar"}
                                            >
                                                {mostrarNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copiar(novaSenha)}
                                                className="p-1 text-gray-500 hover:text-gray-700"
                                                title="Copiar"
                                                disabled={!novaSenha}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGerarSenha}
                                        className="whitespace-nowrap"
                                        title="Gera uma sugestão de senha"
                                    >
                                        <Sparkles className="w-4 h-4 mr-1" />
                                        Gerar
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {tentativaGerar === 0 && "💡 Clique em \"Gerar\" pra criar uma sugestão baseada nos dados do profissional."}
                                    {tentativaGerar > 0 && tentativaGerar < 5 && `Variação ${tentativaGerar} de 5. Clique de novo pra ver outra opção.`}
                                    {tentativaGerar >= 5 && "Agora alternando entre variações com \"apae\" + dados + caracteres aleatórios."}
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button variant="outline" onClick={fecharModalSenha} disabled={salvandoSenha}>
                                    Cancelar
                                </Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleSalvarSenha}
                                    disabled={salvandoSenha || !novaSenha.trim()}
                                >
                                    {salvandoSenha ? "Salvando..." : "Salvar nova senha"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <SnackbarComponent
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                />
            </div>
        </>
    );
}