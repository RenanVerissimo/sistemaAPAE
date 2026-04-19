import { useState } from "react";
import { Pencil, Power, Trash2, FileDown } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Paciente } from "@/types";

interface PacientesTableProps {
  pacientes: Paciente[];
}

export function PacientesTable({ pacientes }: PacientesTableProps) {
  const [descricaoSelecionada, setDescricaoSelecionada] = useState<string | null>(null);

  const limitarTexto = (texto?: string) => {
    if (!texto) return "-";
    if (texto.length <= 45) return texto;
    return texto.substring(0, 45) + "...";
  };

  return (
    <>
    
      <div className="max-w-7xl mx-auto">
        <Card className="rounded-xl overflow-hidden shadow-md border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-300 border-b">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold">Nomeeeeee</th>
                  <th className="px-4 py-3 text-center font-semibold">Data Nascimento</th>
                  <th className="px-4 py-3 text-center font-semibold">Prontuário</th>
                  <th className="px-4 py-3 text-center font-semibold">CPF</th>
                  <th className="px-4 py-3 text-center font-semibold">Cartão SUS</th>
                  <th className="px-4 py-3 text-center font-semibold">Descrição</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody>
                {pacientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      Nenhum paciente encontrado
                    </td>
                  </tr>
                ) : (
                  pacientes.map((pac) => (
                    <tr key={pac.id} className="border-b hover:bg-gray-200">
                      <td className="px-4 py-3 text-center">{pac.nome}</td>
                      <td className="px-4 py-3 text-center">{pac.dataNasc}</td>
                      <td className="px-4 py-3 text-center">{pac.prontuario}</td>
                      <td className="px-4 py-3 text-center">{pac.cpf || "-"}</td>
                      <td className="px-4 py-3 text-center">{pac.cartaoSUS || "-"}</td>

                      <td className="px-4 py-3">
                        {pac.descricao && pac.descricao.length > 45 ? (
                          <>
                            {limitarTexto(pac.descricao)}{" "}
                            <button
                              className="text-blue-600 text-xs ml-2 hover:underline"
                              onClick={() => setDescricaoSelecionada(pac.descricao || "")}
                            >
                              Ver mais
                            </button>
                          </>
                        ) : (
                          limitarTexto(pac.descricao)
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {pac.status ? "Ativo" : "Inativo"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm">
                            <FileDown className="w-4 h-4" />
                          </Button>

                          <Button variant="ghost" size="sm">
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* MODAL DESCRIÇÃO */}
      {descricaoSelecionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Descrição do paciente</h2>

            <p className="text-gray-700 whitespace-pre-line">
              {descricaoSelecionada}
            </p>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setDescricaoSelecionada(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}