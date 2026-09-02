import { PacientesTableAtendimentoEspecifico } from "@/app/components/PacientesTableAtendimentoEspecifico";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft, Funnel, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const meses = [
    { numero: 1, nome: "Janeiro" },
    { numero: 2, nome: "Fevereiro" },
    { numero: 3, nome: "Marco" },
    { numero: 4, nome: "Abril" },
    { numero: 5, nome: "Maio" },
    { numero: 6, nome: "Junho" },
    { numero: 7, nome: "Julho" },
    { numero: 8, nome: "Agosto" },
    { numero: 9, nome: "Setembro" },
    { numero: 10, nome: "Outubro" },
    { numero: 11, nome: "Novembro" },
    { numero: 12, nome: "Dezembro" },
];

export function AtendimentoEspecifico() {

    const navigate = useNavigate();
    const hoje = new Date();
    const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
    const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());
    const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth() + 1);

    const anoMesSelecionado = useMemo(
        () => `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}`,
        [anoSelecionado, mesSelecionado]
    );

    const mesSelecionadoLabel = useMemo(() => {
        const mes = meses.find((item) => item.numero === mesSelecionado);
        return `${mes?.nome ?? "Mes"} de ${anoSelecionado}`;
    }, [anoSelecionado, mesSelecionado]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div>
                        <h2 className="text-lg font-semibold">Atendimentos por Profissional</h2>
                        <p className="text-sm text-gray-500">{mesSelecionadoLabel}</p>
                    </div>
                </div>

                <Button
                    onClick={() => setModalFiltroAberto(true)}
                    className="bg-gray-800 hover:bg-gray-700 text-white"
                >
                    <Funnel className="w-4 h-4 mr-2" />
                    Filtro
                </Button>
            </div>

            <PacientesTableAtendimentoEspecifico
                anoMesSelecionado={anoMesSelecionado}
                mesSelecionadoLabel={mesSelecionadoLabel}
            />

            {modalFiltroAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Filtro</h3>
                            <button
                                type="button"
                                onClick={() => setModalFiltroAberto(false)}
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Ano
                            <input
                                type="number"
                                value={anoSelecionado}
                                onChange={(event) => setAnoSelecionado(Number(event.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {meses.map((mes) => (
                                <button
                                    key={mes.numero}
                                    type="button"
                                    onClick={() => {
                                        setMesSelecionado(mes.numero);
                                        setModalFiltroAberto(false);
                                    }}
                                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${mesSelecionado === mes.numero
                                        ? "border-gray-800 bg-gray-800 text-white"
                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {mes.nome}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
