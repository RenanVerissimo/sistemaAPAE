import { Button } from "@/app/components/ui/button";
import { ProfessionalType, Profissional } from "@/types";
import { Card } from "@mui/material";
import { ChevronLeft, FileText, Pencil, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { atualizarProfissional, deleteProfissional, getAllProfissionais } from "@/app/services/api";
import SnackbarComponent from "../../SnackbarComponent";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

export default function ProfissionalCard() {

    const [profissionais, setProfissionais] = useState<Profissional[]>([]);

    const [profissionalSelecionado, setProfissionalSelecionado] = useState<Profissional | null>(null);
    const [profissionalSelecionadoDel, setProfissionalSelecionadoDel] = useState<Profissional | null>(null);
    const [deleteProf, setDeleteProf] = useState(false);


    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
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

    const handleVoltar = () => {
        navigate("/SecretariaDashboard");
    };


    const fetchProfissionais = async () => {
        const pro = await getAllProfissionais();
        console.log("profs:", pro);
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


    useEffect(() => {
        fetchProfissionais();
    }, []);



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
                        onClick={() => navigate("/SecretariaDashboard/PacienteCard/VerRelatorios")}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Relatórios
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
                                    <tr key={prof.id} className="border-b hover:bg-gray-200">
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
                                                    onClick={() => {
                                                        setProfissionalSelecionado(prof);
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDeleteProf(true);
                                                        setProfissionalSelecionadoDel(prof);
                                                    }}
                                                >

                                                    <Trash2 className="w-4 h-4 text-red-600" />
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